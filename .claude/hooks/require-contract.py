#!/usr/bin/env python3
"""Claude Code PreToolUse hook (Bash). Enforces rules 09 (gates), 10 (contract first) and 11 (decisions
logged for architecturally-significant config changes).

Only looks at REAL git invocations (start of line or after ; && || |), not prose inside heredocs.
Exit 2 = blocks the command and shows the reason.
"""

import json
import os
import re
import subprocess
import sys

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
        print("Rule 09: --no-verify / -n is not allowed. Pass the gate (pnpm gate).", file=sys.stderr)
        sys.exit(2)

if any(sub == "commit" for sub, _ in hits):
    root = os.environ.get("CLAUDE_PROJECT_DIR", ".")

    def run_git(args):
        try:
            return subprocess.run(
                ["git"] + args, cwd=root, capture_output=True, text=True, check=True,
            ).stdout.splitlines()
        except (OSError, subprocess.CalledProcessError):
            return []

    try:
        with open(os.path.join(root, ".claude", "tasks", "ACTIVE"), encoding="utf-8") as f:
            slug = f.read().strip()
    except OSError:
        slug = ""

    staged = run_git(["diff", "--cached", "--name-only"])

    if not slug:
        if not all(f.startswith(".claude/") for f in staged):
            print(
                "Rule 10: no active task (.claude/tasks/ACTIVE is empty) and this commit touches code "
                "outside .claude/ — write a story + contract first.",
                file=sys.stderr,
            )
            sys.exit(2)
    else:
        task_prefix = f".claude/tasks/{slug}/"
        tracked = run_git(["ls-tree", "-r", "--name-only", "HEAD", "--", task_prefix])
        staged_status = {}
        if tracked:
            status_lines = run_git(["diff", "--cached", "--name-status"])
            for line in status_lines:
                fields = line.split("\t")
                if len(fields) < 2:
                    continue
                staged_status[fields[-1]] = fields[0][0]
        closing = bool(tracked) and all(staged_status.get(path) == "D" for path in tracked)

        if closing:
            archive = f".claude/tasks/closed/{slug}.md"
            if not staged_status.get(archive, "").startswith("A"):
                print(
                    f"Rule 10 (task-close-gate): this commit deletes .claude/tasks/{slug}/ but "
                    f"doesn't stage .claude/tasks/closed/{slug}.md — closing a task requires an "
                    "archived, fully-checked close-checklist in the same commit (see "
                    ".claude/templates/close-checklist.md).",
                    file=sys.stderr,
                )
                sys.exit(2)
            show = subprocess.run(
                ["git", "show", f":{archive}"], cwd=root, capture_output=True, text=True,
            )
            content = show.stdout if show.returncode == 0 else ""
            unchecked = [
                (i, line.strip())
                for i, line in enumerate(content.splitlines(), start=1)
                if re.search(r"-\s\[\s\]", line)
            ]
            if unchecked:
                items = "; ".join(f"line {i}: {text}" for i, text in unchecked)
                print(
                    f"Rule 10 (task-close-gate): .claude/tasks/closed/{slug}.md has "
                    f"{len(unchecked)} unchecked item(s) — every close-checklist box must be checked "
                    f"before the task can close. Unchecked: {items}",
                    file=sys.stderr,
                )
                sys.exit(2)
        else:
            contract = os.path.join(root, ".claude", "tasks", slug, "contract.md")
            ok = False
            if os.path.isfile(contract):
                with open(contract, encoding="utf-8") as f:
                    ok = "given" in f.read().lower()
            if not ok:
                print(
                    "Rule 10: no commit without an active contract. Write .claude/tasks/ACTIVE (slug) and "
                    ".claude/tasks/<slug>/contract.md with Given/When/Then criteria.",
                    file=sys.stderr,
                )
                sys.exit(2)

    DECISION_WORTHY = ("nuxt.config.ts", "eslint.config.mjs")
    touches_config = any(f in DECISION_WORTHY for f in staged)
    touches_decision = any(f.startswith(".claude/docs/decisions/") for f in staged)
    if touches_config and not touches_decision:
        print(
            "Rule 11: this commit changes nuxt.config.ts or eslint.config.mjs but stages no file under "
            ".claude/docs/decisions/. Architecture/config changes need a decision record in the same "
            "commit — write one (see decision 041 for the pattern) and stage it.",
            file=sys.stderr,
        )
        sys.exit(2)

sys.exit(0)
