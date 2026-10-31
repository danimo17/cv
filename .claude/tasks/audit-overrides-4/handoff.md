# Handoff: audit-overrides-4

_Updated: 2026-10-31. REAL state of the `feat/audit-overrides-4` branch._

## Workflow progress

- [x] story — evidence: c5f8978 (story.md, contract.md and backlog row `doing`)
- [x] contract — evidence: c5f8978 (contract.md, criteria 1-4)
- [x] build — evidence: 0d9bc77 (three overrides, nuxt and vue bumps, patch removed, lockfile, decision 064, arch test, catalog)
- [x] consolidate — evidence: 0d9bc77 (pnpm gate green in the commit hook: 34 files / 698 tests)
- [x] validate — evidence: 2026-10-31 pnpm gate 34 files / 698 tests passed, 0 lint errors, typecheck clean; pnpm audit --audit-level=high exit 0
- [x] handoff — evidence: b3b2c32 (handoff.md with Review committed)
- [x] commit — evidence: 0d9bc77
- [x] review — evidence: b3b2c32 (commit that recorded the Review section; code-review not run, dependency-only change, findings: none)
- [ ] close-out — evidence:
- [x] gate-push — evidence: 2026-10-31 pnpm gate:push exit 0 on the build tree: 34 files / 697 tests passed, nuxt build complete, playwright 5 passed (13.1s); the commit hook re-ran the gate on 0d9bc77 (698 tests)
- [ ] push-pr — evidence:

## Done (verified)

- `pnpm audit --audit-level=high` listed five high advisories, all `node-forge` `<=1.4.0` (via `listhen`). Every patched version exists on npm and is older than 24 hours, so nothing is ignored and no `minimumReleaseAgeExclude` entry was added.
- Overrides added in `pnpm-workspace.yaml`: `node-forge@<=1.4.0` to `^1.4.1` (resolves 1.4.2), `serialize-javascript@<7.1.3` to `^7.1.3` (7.1.4), `glob@>=9.0.0 <14.0.2` to `^14.0.2` (14.0.3).
- `package.json`: `nuxt` `^4.5.2` to `^4.6.3` (moves `@nuxt/nitro-server` and `@nuxt/vite-builder` to 4.6.3, clears the moderate and low `nuxt` family findings) and `vue` `^3.5.43` to `^3.5.44` (nuxt 4.6.3 needs it; two `vue` copies broke `nuxt typecheck`).
- Removed: the `@nuxt/devtools@3.4.2` patch and its file, and the `simple-git@<4.0.1` and `@simple-git/argv-parser@<2.0.1` overrides (devtools 3.4.4 no longer uses `simple-git`).
- `pnpm audit --audit-level=high` exits 0: "2 vulnerabilities found, Severity: 1 low | 1 moderate" (`deepmerge` low and `minimatch` moderate, see below).
- `tests/arch/audit-overrides.spec.ts` strengthened (red first, then green, 9 tests): lockfile floors for `node-forge`, `serialize-javascript`, `glob`, `nuxt`, `@nuxt/nitro-server`, `@nuxt/vite-builder`; `simple-git` no longer required to exist; no orphan file under `patches/`; single `vue` in the lockfile.
- Decision 064 written; catalog `ai-workflow.md` updated.

## In progress / not done

- Open findings, not fixable: `deepmerge` `GHSA-gcqx-w48m-w2h4` (low, no 4.3.2 on npm) and `minimatch` `GHSA-g3hv-75wg-m249` (moderate; the `^11.0.1` override breaks `eslint-plugin-import-x`, tried and reverted). Neither is ignored.
- Close-out is the last commit; the push is not done (needs the user's permission).

## Subagents (rule 12)

| Subagent          | What it did                                                                  | Result                                               |
| ----------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------- |
| audit-overrides-4 | Overrides, bumps, lockfile, decision 064, test strengthening, handoff, close | all of criteria 1-4 done on `feat/audit-overrides-4` |

## Validation (actual output of the last gate)

```
pnpm gate:push (2026-10-31) → eslint 0 errors (1 pre-existing warning), nuxt typecheck clean, Test Files 34 passed (34), Tests 697 passed (697), "Build complete!", playwright "5 passed (13.1s)", EXIT=0
pnpm gate in the commit hook on 0d9bc77 → Test Files 34 passed (34), Tests 698 passed (698)
pnpm audit --audit-level=high → exit 0, "2 vulnerabilities found / Severity: 1 low | 1 moderate"
```

Not covered: `wrangler` / `pnpm cf:deploy` (only runs in the deploy workflow); the `glob` major jump is exercised by the Nitro build (`@vercel/nft`) and the unit suite only.

## Review (workflow step `review`, rule 09)

Review checklist (`.claude/templates/review-checklist.md`) run over the full branch diff (dependency and config
only: `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, one deleted patch, one arch test, decision 064, catalog,
backlog, task files):

- [x] Secrets (01), company (02), Giphy boundary (03), PII (04), i18n (05): n/a, no app, server or locale change; sources are the public npm registry and GitHub advisories.
- [x] Branch (06): on `feat/audit-overrides-4`. Catalog (07): `ai-workflow.md` updated for the strengthened arch test. Gates (09): `pnpm gate` green in the commit, `gate:push` green. Contract (10): criteria 1-4 each map to the audit exit 0, the arch tests and `gate:push`. Decisions (11): 064 written, no ignore added.
- [x] CSS (08), primitives (026, 038), living docs components (027), accessibility, UI consistency (16): n/a, no UI change. Subagents (12): the handoff names the single subagent.

code-review: not run for this dependency-only change; covered by `pnpm audit --audit-level=high` exiting 0, the
arch tests (`tests/arch/audit-overrides.spec.ts`) and `pnpm gate:push` (typecheck, build + e2e). 2026-10-31, round 1,
no effort level.

- findings: none

## Pending on the user

| #   | What                                                                                                                                                                                                                      | Blocks  | Status  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------- |
| 1   | `deepmerge` `GHSA-gcqx-w48m-w2h4` (low) has no patched release: leave it open (recommended, below the `high` threshold) or approve an `ignoreGhsas` entry with a decision                                                 | nothing | pending |
| 2   | `minimatch` `GHSA-g3hv-75wg-m249` (moderate) cannot be overridden to 11.x without breaking ESLint: leave open (recommended) until `eslint-plugin-import-x` supports minimatch 11                                          | nothing | pending |
| 3   | The existing ignore `GHSA-86w9-cpqp-85rv` (node-forge) is now stale: its range is `<=1.4.0` and the lockfile resolves 1.4.2. Approve removing it from `auditConfig.ignoreGhsas` and from decision 056 (not done, rule 11) | nothing | pending |

## Decisions made in this task

- → `.claude/docs/decisions/064-audit-overrides-2026-10-31.md`
