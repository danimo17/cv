#!/usr/bin/env python3
"""Claude Code PreToolUse hook (Bash). Fa vinculants les regles 09 (gates) i 10 (contracte primer).

Nomes mira invocacions REALS de git (inici de linia o despres de ; && || |), no prosa dins de heredocs.
Exit 2 = bloqueja l'ordre i mostra el motiu.
"""

import json
import os
import re
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
        print("Regla 09: --no-verify / -n no esta permes. Passa la gate (pnpm gate).", file=sys.stderr)
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
            "Regla 10: cap commit sense contracte actiu. Escriu .claude/tasks/ACTIVE (slug) i "
            ".claude/tasks/<slug>/contract.md amb criteris Given/When/Then.",
            file=sys.stderr,
        )
        sys.exit(2)

sys.exit(0)
