# Story: audit-overrides-3

**Slug:** `audit-overrides-3` · **Branch:** `feat/audit-overrides-3` · **Status:** doing

As the repo owner I want the red CI `audit` job fixed again: advisories published 2026-10-22 to 2026-10-29 (`zod`
<4.6.6 via `@nuxt/eslint`, `happy-dom` <=21.0.3 via `@nuxt/test-utils`, `undici` 8.x <8.12.2 via `nuxt` and 7.x
<7.30.1 via `wrangler>miniflare`, plus anything else `pnpm audit --audit-level=high` lists) fail the check on
`main`'s own lockfile and block PRs #23 to #25 and #28.

## Out of scope

- Ignoring an advisory without a patched version: needs the user's explicit approval (rule 11).
- Changing how the audit job works (the user is asked separately).

## External dependencies

None. Runs in its own worktree; must merge before the open PRs.
