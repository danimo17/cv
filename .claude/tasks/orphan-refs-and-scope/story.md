# Story: orphan-refs-and-scope

**Slug:** `orphan-refs-and-scope` · **Branch:** `feat/orphan-refs-and-scope` · **Status:** doing

As the repo owner I want a change to a public surface (a `data-testid`, a prop, a class, an i18n key) to update
every reference in the same change, and I want the scope of a shared-component change to be asked before it is
built, so that no test or consumer is left half-updated (origin: 2026-09-25 findings 2 and 3 of
`workflow-integrity-hardening`, scope items 2 and 3).

## Out of scope

- The commit-time hook check for shared components (task `hook-hardening`, criterion 5) — this task writes the
  contract template section and the rule text it checks for.
- Arch tests for rules 02/13/14/15 (task `arch-rule-gates`).

## External dependencies

None. Own worktree; conflicts with sibling tasks resolved at merge.
