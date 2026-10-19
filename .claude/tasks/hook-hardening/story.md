# Story: hook-hardening

**Slug:** `hook-hardening` · **Branch:** `feat/hook-hardening` · **Status:** doing

As the repo owner I want the remaining process gaps closed inside `.claude/hooks/require-contract.py` so that
orphaned branches, undelegated multi-file work, undecided structural changes and shared-component changes
without a consumer check are blocked mechanically (rule 19).

Origin: `workflow-integrity-hardening` scope items 1, 3 (mechanical part), 4 and part of 5, plus backlog row
`require-contract-decision-check`, plus the worktree finding of 2026-10-13 (the Claude hook must resolve the
repo from the payload `cwd`, not only from `CLAUDE_PROJECT_DIR`).

## Out of scope

- The arch tests for rules 02/13/14/15 (task `arch-rule-gates`); the orphan test-id test and rule texts (task
  `orphan-refs-and-scope`).
- Review freshness and progress gates (done in `close-workflow-redesign`).

## External dependencies

None. Own worktree; conflicts with sibling tasks resolved at merge.
