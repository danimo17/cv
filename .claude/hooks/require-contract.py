#!/usr/bin/env python3
"""Workflow gate. One script, three callers (decisions 051, 054 and 057, incl. its 2026-10-05 amendment).

  require-contract.py                      Claude Code PreToolUse hook (Bash): JSON on stdin
  require-contract.py --commit             git pre-commit: checks the index
  require-contract.py --pre-push           git pre-push: reads "<local ref> <local sha> <remote ref> <remote sha>"
                                           lines on stdin, gates every remote ref refs/heads/feat/<slug> on the
                                           LOCAL SHA's tree
  require-contract.py --ci <branch> <sha>  CI: the push checks for one branch + commit

Behavior is documented in .claude/docs/catalog/ai-workflow.md; tests in tests/arch/require-contract-hook.spec.ts.
Exit 2 = blocked, the reason is printed on stderr. The task slug of a feat/<slug> branch is <slug>;
.claude/tasks/ACTIVE is only consulted on other branches.

Commit-time state is read from the index and push-time state from the pushed commit's tree (git show
<sha>:path), never from the working tree, so the order of edits before the git command does not change
the verdict.
"""

import json
import os
import re
import shlex
import subprocess
import sys

CLOSED_PREFIX = ".claude/tasks/closed/"
TASKS_PREFIX = ".claude/tasks/"
FEAT_PREFIX = "feat/"
UNCHECKED = re.compile(r"-\s\[\s\]")
PROGRESS_LINE = re.compile(r"^- \[( |x|X)\] (\S+) — evidence:\s*(.*)$")
PUSH_PR_OPEN = re.compile(r"^- \[ \] push-pr — evidence:\s*$")
HANDOFF_PATH = re.compile(r"^\.claude/tasks/[^/]+/handoff\.md$")
ARCHIVE_PATH = re.compile(r"^\.claude/tasks/closed/[^/]+\.md$")
HEX_TOKEN = re.compile(r"(?<![0-9A-Za-z])[0-9a-fA-F]{7,40}(?![0-9A-Za-z])")
SHA_EVIDENCE_STEPS = ("commit", "review", "close-out")
PUSH_VALUE_FLAGS = ("-o", "--push-option", "--receive-pack", "--exec", "--repo")
USAGE = (
    "usage: require-contract.py [--commit | --pre-push | --ci <branch> <sha>] "
    "(no argument: Claude PreToolUse hook, JSON on stdin)"
)

root = "."


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


def git_ok(args):
    try:
        r = subprocess.run(["git"] + args, cwd=root, capture_output=True)
    except OSError:
        return False
    return r.returncode == 0


def git_nul(args):
    out = git(args)
    return [p for p in out.split("\0") if p] if out else []


def git_show(rev, path):
    return git(["show", f"{rev}:{path}"])


def current_branch():
    return (git(["rev-parse", "--abbrev-ref", "HEAD"]) or "").strip()


def section(content, heading_pattern):
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
    lines = section(content, r"^## Workflow progress\b")
    if lines is None:
        return None
    entries = []
    for line in lines:
        m = PROGRESS_LINE.match(line)
        if m:
            entries.append((m.group(2), m.group(1) in ("x", "X"), m.group(3).strip()))
    return entries


def required_push_steps(rev):
    raw = git_show(rev, ".claude/workflow-steps.json") if rev else None
    try:
        if raw is None:
            with open(os.path.join(root, ".claude", "workflow-steps.json"), encoding="utf-8") as f:
                raw = f.read()
        steps = json.loads(raw)
        return [s["id"] for s in steps if s.get("phase") == "pre-push" and s["id"] != "push-pr"]
    except (OSError, ValueError, KeyError, TypeError):
        fail(
            "Rule 09 (push-review-gate): .claude/workflow-steps.json is missing or malformed — it is the "
            "single list of workflow steps the push gate checks (decision 057)."
        )


def evidence_problem(step, evidence):
    if not evidence:
        return "no evidence"
    if step in SHA_EVIDENCE_STEPS:
        tokens = HEX_TOKEN.findall(evidence)
        if not any(git_ok(["cat-file", "-e", f"{t}^{{commit}}"]) for t in tokens):
            return (
                "evidence must contain a 7-40 character commit sha that resolves to a commit in this "
                "repository"
            )
    return None


def check_progress_evidence(path, content):
    entries = progress_entries(content) or []
    problems = []
    for step, ticked, evidence in entries:
        problem = evidence_problem(step, evidence) if ticked else None
        if problem:
            problems.append(f"{step} ({problem})")
    if problems:
        fail(
            f"Rule 09 (workflow progress): {path} ticks step(s) in ## Workflow progress with invalid "
            f"evidence: {'; '.join(problems)}. Fill `evidence:` (commit sha for commit/review/close-out, "
            "otherwise a gate output line / date) or leave the box unticked — see "
            ".claude/templates/handoff.md."
        )


def progress_problem(path, content, rev):
    entries = progress_entries(content)
    if entries is None:
        return (
            f"{path} has no ## Workflow progress section — every handoff opens "
            "with it (see .claude/templates/handoff.md)."
        )
    state = {step: (ticked, evidence) for step, ticked, evidence in entries}
    missing = []
    for step in required_push_steps(rev):
        ticked, evidence = state.get(step, (False, ""))
        if not ticked:
            missing.append(f"{step} (not ticked)")
            continue
        problem = evidence_problem(step, evidence)
        if problem:
            missing.append(f"{step} ({problem})")
    if missing:
        return (
            f"{path}'s ## Workflow progress has step(s) not ticked with valid "
            f"evidence: {', '.join(missing)}. Tick each one (`- [x] <id> — evidence: <sha / gate line / "
            "date>`) before pushing; only `push-pr` may stay open."
        )
    return None


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
    content = git_show("", archive) or ""
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


def task_slug_for_commit():
    branch = current_branch()
    if not branch.startswith(FEAT_PREFIX):
        return working_tree_active()
    slug = branch[len(FEAT_PREFIX):]
    folder_present = os.path.isdir(os.path.join(root, TASKS_PREFIX, slug))
    archived = git_ok(["cat-file", "-e", f":{CLOSED_PREFIX}{slug}.md"])
    return "" if archived and not folder_present else slug


def commit_checks():
    status = staged_changes()
    staged = list(status)
    closing = closing_slugs(status)

    for slug in closing:
        check_close(slug, status)

    slug = task_slug_for_commit()

    if closing or not slug:
        if not all(f.startswith(".claude/") for f in staged):
            fail(
                "Rule 10: no active task (a non-feat branch with .claude/tasks/ACTIVE empty, or a "
                "feat/<slug> branch whose task is already closed) or a closing commit, and this commit "
                "touches code outside .claude/ — write a story + contract first."
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
                f"Rule 10: no commit without a contract. Write {TASKS_PREFIX}{slug}/contract.md with "
                "Given/When/Then criteria (the slug is the feat/<slug> branch name; on other branches "
                ".claude/tasks/ACTIVE holds it)."
            )

    for path, code in sorted(status.items()):
        if code in ("A", "M") and (HANDOFF_PATH.match(path) or ARCHIVE_PATH.match(path)):
            check_progress_evidence(path, git_show("", path) or "")

    decision_worthy = ("nuxt.config.ts", "eslint.config.mjs")
    touches_config = any(f in decision_worthy for f in staged)
    touches_decision = any(f.startswith(".claude/docs/decisions/") for f in staged)
    if touches_config and not touches_decision:
        fail(
            "Rule 11: this commit changes nuxt.config.ts or eslint.config.mjs but stages no file under "
            ".claude/docs/decisions/. Architecture/config changes need a decision record in the same "
            "commit — write one (see decision 041 for the pattern) and stage it."
        )


def push_gate(branch, sha):
    slug = branch[len(FEAT_PREFIX):]
    problems = []

    def review_problems(path, review):
        if review is None:
            return [f"{path} has no ## Review section. Fill it per .claude/templates/handoff.md "
                    "before pushing (workflow step review)."]
        found = []
        unchecked = unchecked_items(review)
        if unchecked:
            items = "; ".join(f"line {i}: {text}" for i, text in unchecked)
            found.append(f"{path}'s ## Review section has {len(unchecked)} unchecked item(s): {items}")
        if not re.search(r"code-review", "\n".join(review), re.IGNORECASE):
            found.append(f"{path}'s ## Review section never mentions code-review having run")
        return found

    handoff_path = f"{TASKS_PREFIX}{slug}/handoff.md"
    archive_path = f"{CLOSED_PREFIX}{slug}.md"
    handoff = git_show(sha, handoff_path)

    if handoff is not None:
        problems += review_problems(handoff_path, section(handoff, r"^## Review\b"))
        problem = progress_problem(handoff_path, handoff, sha)
        if problem:
            problems.append(problem)
    else:
        archive = git_show(sha, archive_path)
        if archive is None:
            fail(
                f"Rule 09 (push-review-gate): neither {handoff_path} nor {archive_path} exists in the "
                f"pushed commit — a {branch} branch is pushed either with its task still open "
                "(handoff.md with ## Review) or already closed (the archive from "
                ".claude/templates/close-checklist.md, committed)."
            )
        unchecked = unchecked_items(archive.splitlines(), exempt_push_pr=True)
        if unchecked:
            items = "; ".join(f"line {i}: {text}" for i, text in unchecked)
            problems.append(f"{archive_path} has {len(unchecked)} unchecked item(s): {items}")
        review = section(archive, r"^## Review\b")
        if review is None:
            problems.append(
                f"{archive_path} has no ## Review section — paste the handoff's review block into it"
            )
        elif not re.search(r"code-review", "\n".join(review), re.IGNORECASE):
            problems.append(f"{archive_path}'s ## Review section never mentions code-review having run")
        problem = progress_problem(archive_path, archive, sha)
        if problem:
            problems.append(problem)

    if len(problems) == 1:
        fail(f"Rule 09 (push-review-gate): {problems[0]}")
    if problems:
        listed = "\n".join(f"  - {p}" for p in problems)
        fail(f"Rule 09 (push-review-gate): {len(problems)} problems blocking the push of {branch}:\n{listed}")


def local_feat_branches():
    out = git(["for-each-ref", "--format=%(refname:short)", f"refs/heads/{FEAT_PREFIX}"]) or ""
    return [b for b in out.splitlines() if b]


def push_targets(rest):
    try:
        tokens = shlex.split(rest)
    except ValueError:
        tokens = rest.split()
    flags = []
    positional = []
    i = 0
    while i < len(tokens):
        token = tokens[i]
        if token == "--":
            positional.extend(tokens[i + 1:])
            break
        if token.startswith("-"):
            flags.append(token)
            if token in PUSH_VALUE_FLAGS:
                i += 1
        else:
            positional.append(token)
        i += 1

    names = [f.split("=")[0] for f in flags]
    deleting = "--delete" in names or any(
        f.startswith("-") and not f.startswith("--") and "d" in f[1:] for f in flags
    )
    if deleting:
        return []

    refspecs = positional[1:]
    branch = current_branch()
    if "--all" in names or "--mirror" in names or any("*" in r for r in refspecs):
        refspecs = local_feat_branches()
    elif not refspecs:
        if "--tags" in names:
            return []
        if branch in ("", "HEAD"):
            fail(
                "Rule 09 (push-review-gate): `git push` with no refspec on a detached HEAD — the branch "
                "being pushed is unknown, so it can't be gated. Name it explicitly "
                "(git push <remote> HEAD:refs/heads/feat/<slug>)."
            )
        refspecs = [branch]

    targets = []
    for spec in refspecs:
        spec = spec.lstrip("+")
        src, _, dst = spec.partition(":") if ":" in spec else (spec, "", spec)
        if not src or not dst:
            continue
        if dst == "HEAD":
            if branch in ("", "HEAD"):
                fail(
                    "Rule 09 (push-review-gate): the push destination HEAD is a detached HEAD — name the "
                    "branch explicitly (HEAD:refs/heads/feat/<slug>)."
                )
            dst = branch
        if dst.startswith("refs/heads/"):
            dst = dst[len("refs/heads/"):]
        if not dst.startswith(FEAT_PREFIX):
            continue
        sha = (git(["rev-parse", "--verify", "--quiet", f"{src}^{{commit}}"]) or "").strip()
        if not sha:
            fail(
                f"Rule 09 (push-review-gate): can't resolve the source `{src}` of the push to {dst} to a "
                "commit, so it can't be gated."
            )
        if (dst, sha) not in targets:
            targets.append((dst, sha))
    return targets


def run_commit_hook(hits):
    if any(sub == "commit" for sub, _ in hits):
        commit_checks()
    for sub, rest in hits:
        if sub == "push":
            for branch, sha in push_targets(rest):
                push_gate(branch, sha)


def claude_hook():
    global root
    root = os.environ.get("CLAUDE_PROJECT_DIR", ".")
    data = json.load(sys.stdin)
    cmd = data.get("tool_input", {}).get("command", "")

    git_call = re.compile(
        r"(?:^|[;&|]\s*)(?:[A-Za-z_]+=\S+\s+)*git\s+(commit|push)\b([^\n;&|]*)", re.M
    )
    hits = git_call.findall(cmd)
    if not hits:
        return

    for _sub, rest in hits:
        if re.search(r"--no-verify|(?:^|\s)-n\b", rest):
            fail("Rule 09: --no-verify / -n is not allowed. Pass the gate (pnpm gate).")

    run_commit_hook(hits)


def use_cwd_repo():
    global root
    top = subprocess.run(
        ["git", "rev-parse", "--show-toplevel"], capture_output=True, text=True
    )
    root = top.stdout.strip() if top.returncode == 0 and top.stdout.strip() else "."


def pre_push_hook():
    use_cwd_repo()
    seen = []
    for line in sys.stdin.read().splitlines():
        parts = line.split()
        if len(parts) < 4:
            continue
        _local_ref, local_sha, remote_ref, _remote_sha = parts[:4]
        if not remote_ref.startswith(f"refs/heads/{FEAT_PREFIX}") or set(local_sha) == {"0"}:
            continue
        target = (remote_ref[len("refs/heads/"):], local_sha)
        if target not in seen:
            seen.append(target)
    for branch, sha in seen:
        push_gate(branch, sha)


def ci_hook(args):
    use_cwd_repo()
    if len(args) != 2:
        fail(USAGE)
    branch, sha = args
    if branch.startswith("refs/heads/"):
        branch = branch[len("refs/heads/"):]
    if not branch.startswith(FEAT_PREFIX):
        return
    if not git_ok(["cat-file", "-e", f"{sha}^{{commit}}"]):
        fail(f"Rule 09 (push-review-gate): commit {sha} is not in this checkout (fetch-depth: 0?).")
    push_gate(branch, sha)


def main():
    args = sys.argv[1:]
    if not args:
        claude_hook()
    elif args == ["--commit"]:
        use_cwd_repo()
        commit_checks()
    elif args == ["--pre-push"]:
        pre_push_hook()
    elif args[0] == "--ci":
        ci_hook(args[1:])
    else:
        fail(USAGE)
    sys.exit(0)


main()
