# Story: audit-overrides-2

**Slug:** `audit-overrides-2` · **Branch:** `feat/audit-overrides-2` · **Status:** doing

As the repo owner I want the red CI `audit` job fixed so that PRs can merge: advisories published after decision
058 (`@modelcontextprotocol/server`, `vite`, `launch-editor`, plus anything else `pnpm audit --audit-level=high`
lists) make `audit` fail on `main`'s own lockfile, blocking PRs #23, #24, #25 and the Dependabot PR #19.

## Out of scope

- Ignoring an advisory without a patched version: needs the user's explicit approval (rule 11).
- Any app code change.

## External dependencies

None. Runs in its own worktree; must merge before the three open PRs.
