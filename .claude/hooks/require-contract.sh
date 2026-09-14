#!/bin/sh
# Claude Code PreToolUse hook (Bash). Regles 09 i 10. La logica es a require-contract.py.
exec python3 "$(dirname "$0")/require-contract.py"
