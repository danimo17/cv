# 061 · Audit job: three more dependency overrides (advisories of 2026-10-21/22)

**Context.** After decision 058, new high advisories were published for transitives already in the lockfile. The CI
`audit` job (`pnpm audit --audit-level=high`, a required check on `main`) went red on `main`'s own lockfile and so
blocks PRs #23, #24, #25 and the Dependabot PR #19, none of which touch runtime dependencies. `pnpm audit` reported
15 vulnerabilities (2 low, 7 moderate, 6 high of which the 2 of decision 056 are ignored); only the 4 un-ignored high
ones affect the exit code. Same approach as decisions 056 and 058 (rule 11: not asked again). Scope: task
`audit-overrides-2`, contract criteria 1-3.

**Decision.** In `pnpm-workspace.yaml`, three more `overrides` raise the vulnerable transitives to their patched
floor. Each patched version was checked with `npm view <pkg> versions time` and was published more than 24 hours ago,
so `minimumReleaseAge: 1440` accepts it with no `minimumReleaseAgeExclude` entry. Each selector is bounded to the
vulnerable range so a future major is never forced:

- `@modelcontextprotocol/server@>=2.0.0 <2.3.0` to `^2.3.0` (two high advisories, `GHSA-jm63-cq47-j5jp` shared
  transports delivering one client's messages to another, and `GHSA-46jr-4wx8-v453` memory exhaustion in one request;
  patched `>=2.3.0`, published 2026-10-02). Reached via `@nuxt/eslint > @eslint/config-inspector > devframe`
  (dev-time). Resolves to `2.3.1` together with `@modelcontextprotocol/core@2.3.1`.
- `launch-editor@<2.14.2` to `^2.14.2` (high `GHSA-587h-7wmj-h5pm`, `fs.existsSync()` check bypass on Windows; patched
  `>=2.14.2`, published 2026-10-06). Reached via `nuxt > @nuxt/devtools` (dev-time). Resolves to `2.14.2`.
- `vite@>=8.3.0 <8.3.3` to `^8.3.3` (the same `GHSA-587h-7wmj-h5pm`, reported against `vite@>=8.3.0 <=8.3.2` because
  vite bundles launch-editor; patched `>=8.3.3`, published 2026-10-06). Reached through 69 paths (`nuxt`,
  `@nuxtjs/color-mode`, `@nuxtjs/i18n`, `@nuxt/test-utils`, `vitest`, ...). Resolves to `8.3.5` (published
  2026-10-21, older than 24 hours), which moves its own dependencies with it: `rolldown` `1.2.8` to `1.2.14`
  (plus the `@rolldown/binding-*` binaries and `@oxc-project/types`), `postcss` `8.5.31` and `nanoid` `3.3.20`.

Every patched version exists on npm, so nothing is ignored and the two ignores of decision 056 are unchanged.

REMOVE-WHEN for every one of the three overrides: the parent dependency that pulls it (`@nuxt/eslint` /
`@eslint/config-inspector` for `@modelcontextprotocol/server`, `nuxt` / `@nuxt/devtools` for `launch-editor`, `nuxt` and
the packages that depend on `vite` for `vite`) ships a release whose own lockfile resolution is already at or above
the floor, then the override is deleted.

**Consequences.**

- `tests/arch/audit-overrides.spec.ts` was strengthened: the lockfile must resolve `@modelcontextprotocol/server`,
  `vite` and `launch-editor` only at or above their patched versions even if an override is later removed (a
  Dependabot lockfile regeneration cannot silently bring the vulnerable range back), and every decision that explains
  an override must carry a remove-when condition. The existing checks (caret floor at or above the patched version,
  a decision quoting selector and value, nothing in the vulnerable range) cover the three new keys.
- `pnpm audit --audit-level=high` exits 0: "3 vulnerabilities found, 1 low | 2 high (2 ignored)", only the two
  ignores of decision 056 remain.
- Risk: the vite bump (8.3.0 to 8.3.5, a patch line, with rolldown 1.2.8 to 1.2.14) changes the bundler used by
  `nuxt build`; covered by `pnpm gate:push` (build + e2e).
