#!/usr/bin/env python3
"""Claude Code PreToolUse hook (Bash). Enforces rules 09 (gates), 10 (contract first) and 11 (decisions
logged for architecturally-significant config changes). Behavior is documented in
.claude/docs/catalog/ai-workflow.md and decisions 051, 054 and 057; tests in
tests/arch/require-contract-hook.spec.ts.

Only looks at REAL git invocations (start of line or after ; && || |), not prose inside heredocs.
Exit 2 = blocks the command and shows the reason.

Commit-time state is read from the index (git diff --cached, git show :path) and push-time state from HEAD
(git show HEAD:path), never from the working tree, so the order in which files were edited before the git
command does not change the verdict.
"""

import json
import os
import re
import subprocess
import sys

CLOSED_PREFIX = ".claude/tasks/closed/"
TASKS_PREFIX = ".claude/tasks/"
UNCHECKED = re.compile(r"-\s\[\s\]")
PROGRESS_LINE = re.compile(r"^- \[( |x)\] (\S+) — evidence:\s*(.*)$")
PUSH_PR_OPEN = re.compile(r"^- \[ \] push-pr — evidence:\s*$")
HANDOFF_PATH = re.compile(r"^\.claude/tasks/[^/]+/handoff\.md$")
ARCHIVE_PATH = re.compile(r"^\.claude/tasks/closed/[^/]+\.md$")

root = os.environ.get("CLAUDE_PROJECT_DIR", ".")


def fail(message):
    print(message, file=sys.stderr)
    sys.exit(2)


def git(args):
    try:
        r = subprocess.run(
            ["git"] + args, cwd=root, capture_output=True, text=True, errors="replace",
        )
    except OSError:
        return None
    return r.stdout if r.returncode == 0 else None


def git_nul(args):
    out = git(args)
    return [p for p in out.split("\0") if p] if out else []


def section(content, heading_pattern):
    """Lines under the first heading matching heading_pattern, up to the next ## heading; None if absent."""
    lines = []
    found = False
    for line in content.splitlines():
        if not found:
            if re.match(heading_pattern, line):
                found = True
            continue
        if re.match(r"^## ", line):
            break
        lines.append(line)
    return lines if found else None


def unchecked_items(lines, exempt_push_pr=False):
    return [
        (i, line.strip())
        for i, line in enumerate(lines, start=1)
        if UNCHECKED.search(line) and not (exempt_push_pr and PUSH_PR_OPEN.match(line))
    ]


def progress_entries(content):
    """(id, ticked, evidence) for every progress line in ## Workflow progress; None if no such section."""
    lines = section(content, r"^## Workflow progress\b")
    if lines is None:
        return None
    entries = []
    for line in lines:
        m = PROGRESS_LINE.match(line)
        if m:
            entries.append((m.group(2), m.group(1) == "x", m.group(3).strip()))
    return entries


def required_push_steps():
    try:
        with open(os.path.join(root, ".claude", "workflow-steps.json"), encoding="utf-8") as f:
            steps = json.load(f)
        return [s["id"] for s in steps if s.get("phase") == "pre-push" and s["id"] != "push-pr"]
    except (OSError, ValueError, KeyError, TypeError):
        fail(
            "Rule 09 (push-review-gate): .claude/workflow-steps.json is missing or malformed — it is the "
            "single list of workflow steps the push gate checks (decision 057)."
        )


def check_progress_evidence(path, content):
    entries = progress_entries(content) or []
    empty = [step for step, ticked, evidence in entries if ticked and not evidence]
    if empty:
        fail(
            f"Rule 09 (workflow progress): {path} ticks step(s) {', '.join(empty)} in ## Workflow progress "
            "without evidence. Fill `evidence:` (commit sha / gate output line / date) or leave the box "
            "unticked — see .claude/templates/handoff.md."
        )


def check_progress_complete(path, content):
    entries = progress_entries(content)
    if entries is None:
        fail(
            f"Rule 09 (push-review-gate): {path} has no ## Workflow progress section — every handoff opens "
            "with it (see .claude/templates/handoff.md)."
        )
    state = {step: (ticked, evidence) for step, ticked, evidence in entries}
    missing = []
    for step in required_push_steps():
        ticked, evidence = state.get(step, (False, ""))
        if not (ticked and evidence):
            missing.append(step)
    if missing:
        fail(
            f"Rule 09 (push-review-gate): {path}'s ## Workflow progress has step(s) not ticked with "
            f"evidence: {', '.join(missing)}. Tick each one (`- [x] <id> — evidence: <sha / gate line / "
            "date>`) before pushing; only `push-pr` may stay open."
        )


data = json.load(sys.stdin)
cmd = data.get("tool_input", {}).get("command", "")

GIT = re.compile(
    r"(?:^|[;&|]\s*)(?:[A-Za-z_]+=\S+\s+)*git\s+(commit|push)\b([^\n;&|]*)", re.M
)
hits = GIT.findall(cmd)
if not hits:
    sys.exit(0)

for _sub, rest in hits:
    if re.search(r"--no-verify|(?:^|\s)-n\b", rest):
        fail("Rule 09: --no-verify / -n is not allowed. Pass the gate (pnpm gate).")


def staged_changes():
    parts = git_nul(["diff", "--cached", "--name-status", "--no-renames", "-z"])
    return {parts[i + 1]: parts[i][0] for i in range(0, len(parts) - 1, 2)}


def closing_slugs(status):
    tracked = {}
    for path in git_nul(["ls-tree", "-r", "-z", "--name-only", "HEAD", "--", TASKS_PREFIX]):
        parts = path.split("/")
        if len(parts) < 4 or parts[2] == "closed":
            continue
        tracked.setdefault(parts[2], []).append(path)
    return [
        slug for slug, files in sorted(tracked.items()) if all(status.get(f) == "D" for f in files)
    ]


def check_close(slug, status):
    archive = f"{CLOSED_PREFIX}{slug}.md"
    if status.get(archive) != "A":
        fail(
            f"Rule 10 (task-close-gate): this commit deletes {TASKS_PREFIX}{slug}/ but doesn't stage "
            f"{archive} as a new file — closing a task requires an archived, fully-checked "
            "close-checklist in the same commit (see .claude/templates/close-checklist.md)."
        )
    content = git(["show", f":{archive}"]) or ""
    unchecked = unchecked_items(content.splitlines(), exempt_push_pr=True)
    if unchecked:
        items = "; ".join(f"line {i}: {text}" for i, text in unchecked)
        fail(
            f"Rule 10 (task-close-gate): {archive} has {len(unchecked)} unchecked item(s) — every "
            "close-checklist box must be checked before the task can close (only the `push-pr` progress "
            f"line may stay open, it is ticked after the push). Unchecked: {items}"
        )


def working_tree_active():
    try:
        with open(os.path.join(root, TASKS_PREFIX, "ACTIVE"), encoding="utf-8") as f:
            return f.read().strip()
    except OSError:
        return ""


if any(sub == "commit" for sub, _ in hits):
    status = staged_changes()
    staged = list(status)
    closing = closing_slugs(status)

    for slug in closing:
        check_close(slug, status)

    slug = working_tree_active()

    if closing or not slug:
        if not all(f.startswith(".claude/") for f in staged):
            fail(
                "Rule 10: no active task (.claude/tasks/ACTIVE is empty) or a closing commit, and this "
                "commit touches code outside .claude/ — write a story + contract first."
            )
    else:
        task_dir = os.path.join(root, TASKS_PREFIX, slug)
        if not os.path.isfile(os.path.join(task_dir, "story.md")):
            fail(
                f"Rule 10: no commit without a story. Write {TASKS_PREFIX}{slug}/story.md "
                "(template .claude/templates/story.md)."
            )
        contract = os.path.join(task_dir, "contract.md")
        ok = False
        if os.path.isfile(contract):
            with open(contract, encoding="utf-8") as f:
                ok = "given" in f.read().lower()
        if not ok:
            fail(
                "Rule 10: no commit without an active contract. Write .claude/tasks/ACTIVE (slug) and "
                ".claude/tasks/<slug>/contract.md with Given/When/Then criteria."
            )

    for path, code in sorted(status.items()):
        if code in ("A", "M") and (HANDOFF_PATH.match(path) or ARCHIVE_PATH.match(path)):
            check_progress_evidence(path, git(["show", f":{path}"]) or "")

    DECISION_WORTHY = ("nuxt.config.ts", "eslint.config.mjs")
    touches_config = any(f in DECISION_WORTHY for f in staged)
    touches_decision = any(f.startswith(".claude/docs/decisions/") for f in staged)
    if touches_config and not touches_decision:
        fail(
            "Rule 11: this commit changes nuxt.config.ts or eslint.config.mjs but stages no file under "
            ".claude/docs/decisions/. Architecture/config changes need a decision record in the same "
            "commit — write one (see decision 041 for the pattern) and stage it."
        )

if any(sub == "push" for sub, _ in hits):
    branch = (git(["rev-parse", "--abbrev-ref", "HEAD"]) or "").strip()

    if branch.startswith("feat/"):
        active = (git(["show", f"HEAD:{TASKS_PREFIX}ACTIVE"]) or "").strip()

        def block(reason):
            fail(f"Rule 09 (push-review-gate): {reason}")

        if active:
            path = f"{TASKS_PREFIX}{active}/handoff.md"
            content = git(["show", f"HEAD:{path}"])
            if content is None:
                block(
                    f"{path} doesn't exist in the last commit — the ## Review section is missing. Fill "
                    "it per .claude/templates/handoff.md before pushing (workflow step review)."
                )
            review = section(content, r"^## Review\b")
            if review is None:
                block(
                    f"{path} has no ## Review section. Fill it per .claude/templates/handoff.md before "
                    "pushing (workflow step review)."
                )
            unchecked = unchecked_items(review)
            if unchecked:
                items = "; ".join(f"line {i}: {text}" for i, text in unchecked)
                block(
                    f"{path}'s ## Review section has {len(unchecked)} unchecked item(s): {items}"
                )
            if not re.search(r"code-review", "\n".join(review), re.IGNORECASE):
                block(f"{path}'s ## Review section never mentions code-review having run")
            check_progress_complete(path, content)
        else:
            slug = branch[len("feat/"):]
            path = f"{CLOSED_PREFIX}{slug}.md"
            content = git(["show", f"HEAD:{path}"])
            if content is None:
                block(
                    f".claude/tasks/ACTIVE is empty in HEAD and {path} doesn't exist there — a "
                    f"feat/{slug} branch is pushed either with its task still active (handoff.md with "
                    "## Review) or already closed (the archive from .claude/templates/close-checklist.md, "
                    "committed)."
                )
            unchecked = unchecked_items(content.splitlines(), exempt_push_pr=True)
            if unchecked:
                items = "; ".join(f"line {i}: {text}" for i, text in unchecked)
                block(f"{path} has {len(unchecked)} unchecked item(s): {items}")
            review = section(content, r"^## Review\b")
            if review is None:
                block(f"{path} has no ## Review section — paste the handoff's review block into it")
            if not re.search(r"code-review", "\n".join(review), re.IGNORECASE):
                block(f"{path}'s ## Review section never mentions code-review having run")
            check_progress_complete(path, content)

sys.exit(0)
