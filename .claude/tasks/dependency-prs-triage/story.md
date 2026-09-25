# Story: dependency-prs-triage

**As** the user, **I want** every open Dependabot PR (#4-8) evaluated against the current `main` (post
`ux-redesign` merge) **for** so dependencies don't drift indefinitely and nothing merges blind.

## Scope

5 open PRs, opened 2026-09-21 against an older `main` (CI passed then, may not hold now — `main` moved ~24
commits since):

- #4 `minor-and-patch` group (4 packages) — low risk.
- #5 `vue-router` 4.6.4 → 5.3.1 — major, real risk: Nuxt/`@nuxtjs/i18n` may not support v5 yet.
- #6 `eslint` 9.39.5 → 10.10.0 — major, risk to the project's custom architecture-enforcing lint rules
  (08/026/038).
- #7 `vitest` 4.1.11 → 5.0.1 — major, config/API breaking-change risk.
- #8 `typescript` 5.9.3 → 6.0.3 — major, `vue-tsc` support and new strictness-error risk.

Each PR investigated empirically (checked out in an isolated worktree, merged with current `main`, `pnpm gate`

- `build` run for real, not just changelog-read) before any recommendation.

## Out of scope

- Actually merging a PR into `main` — that's always the user's action (rule 06). This task's job is analysis
  and, where a PR needs a fix before it's safe, preparing that fix on this repo's own `feat/*` branch (never
  pushing directly to a `dependabot/*` branch).
- Closing a PR outright — also needs the user's explicit go-ahead per PR (not blanket authority), even when
  the recommendation is "close as premature."

## External dependencies

None beyond the packages being evaluated themselves.
