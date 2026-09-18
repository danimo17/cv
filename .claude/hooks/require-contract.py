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
    try:
        with open(os.path.join(root, ".claude", "tasks", "ACTIVE"), encoding="utf-8") as f:
            slug = f.read().strip()
    except OSError:
        slug = ""
    contract = os.path.join(root, ".claude", "tasks", slug, "contract.md")
    ok = False
    if slug and os.path.isfile(contract):
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
    try:
        staged = subprocess.run(
            ["git", "diff", "--cached", "--name-only"],
            cwd=root, capture_output=True, text=True, check=True,
        ).stdout.splitlines()
    except (OSError, subprocess.CalledProcessError):
        staged = []
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
