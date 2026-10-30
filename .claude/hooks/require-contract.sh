#!/bin/sh
# Claude Code PreToolUse hook (Bash). Rules 09 and 10. The logic lives in require-contract.py.
exec python3 "$(dirname "$0")/require-contract.py"
