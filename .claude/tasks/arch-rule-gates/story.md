# Story: arch-rule-gates

**Slug:** `arch-rule-gates` · **Branch:** `feat/arch-rule-gates` · **Status:** doing

As the repo owner I want rules 02, 13, 14 and 15 enforced by arch tests instead of "human review" so that a
comment, a lint suppression, a non-English file or an internal-looking resource can never reach `main`
silently (rule 19: an "ensure" is a gate, not a promise).

Origin: backlog rows `arch-no-comments-no-suppressions` (decision 041) and `workflow-integrity-hardening`
scope item 5 (rules 02, 13, 14, 15).

## Out of scope

- Rule 16 (UI consistency) stays human review, documented as a permanent exception.
- Hook changes (`require-contract.py`): task `hook-hardening`.
- Rewriting existing code beyond removing the violations the new tests find.

## External dependencies

None. Run in its own worktree; conflicts with the sibling tasks are resolved at merge time.
