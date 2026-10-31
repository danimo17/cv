# Handoff: audit-overrides-4

_Updated: 2026-10-31. REAL state of the `feat/audit-overrides-4` branch._

## Workflow progress

- [x] story — evidence: c5f8978 (story.md, contract.md and backlog row `doing`)
- [x] contract — evidence: c5f8978 (contract.md, criteria 1-4)
- [x] build — evidence: 0d9bc77 (three overrides, nuxt and vue bumps, patch removed, lockfile, decision 064, arch test, catalog)
- [x] consolidate — evidence: 0d9bc77 (pnpm gate green in the commit hook: 34 files / 698 tests)
- [x] validate — evidence: 2026-10-31 pnpm gate 34 files / 701 tests passed, 0 lint errors, typecheck clean; pnpm audit --audit-level=high exit 0
- [x] handoff — evidence: handoff.md rewritten 2026-10-31 after the reopen, Review round 1 and 2 recorded
- [x] commit — evidence: 872aa20 (last code commit; first was 0d9bc77)
- [x] review — evidence: 3d434f8 (commit that recorded the Review section: /code-review high, round 1 on the branch diff and round 2 on the delta, 14 findings, each with an outcome)
- [ ] close-out — evidence:
- [x] gate-push — evidence: 2026-10-31 pnpm gate:push exit 0 on 872aa20: 701 unit/arch tests passed (34 files), nuxt build complete, playwright 5 passed (10.8s)
- [ ] push-pr — evidence:

## Done (verified)

- `pnpm audit --audit-level=high` listed five high advisories, all `node-forge` `<=1.4.0` (via `listhen`). Every patched version exists on npm and is older than 24 hours, so nothing is ignored and no `minimumReleaseAgeExclude` entry was added.
- Overrides added in `pnpm-workspace.yaml`: `node-forge@<=1.4.0` to `^1.4.1` (resolves 1.4.2), `serialize-javascript@<7.1.3` to `^7.1.3` (7.1.4), `glob@>=9.0.0 <14.0.2` to `^14.0.2` (14.0.3).
- `package.json`: `nuxt` `^4.5.2` to `^4.6.3` (moves `@nuxt/nitro-server` and `@nuxt/vite-builder` to 4.6.3, clears the moderate and low `nuxt` family findings) and `vue` `^3.5.43` to `^3.5.44` (nuxt 4.6.3 needs it; two `vue` copies broke `nuxt typecheck`).
- Removed: the `@nuxt/devtools@3.4.2` patch and its file, and the `simple-git@<4.0.1` and `@simple-git/argv-parser@<2.0.1` overrides (devtools 3.4.4 no longer uses `simple-git`).
- `pnpm audit --audit-level=high` exits 0: "2 vulnerabilities found, Severity: 1 low | 1 moderate" (`deepmerge` low and `minimatch` moderate, see below).
- `tests/arch/audit-overrides.spec.ts` strengthened (red first, then green, 9 tests): lockfile floors for `node-forge`, `serialize-javascript`, `glob`, `nuxt`, `@nuxt/nitro-server`, `@nuxt/vite-builder`; `simple-git` no longer required to exist; no orphan file under `patches/`; single `vue` in the lockfile.
- Decision 064 written; catalog `ai-workflow.md` updated.
- Reopened with `git revert 4e17646` (604f00e) after the user's approval: the stale ignore `GHSA-86w9-cpqp-85rv` (node-forge, range `<=1.4.0`, lockfile resolves 1.4.2) was removed from `auditConfig.ignoreGhsas` (bf85676) with a dated amendment in decision 056 and an addendum in 064. `deepmerge` and `minimatch` stay open, not ignored (user decision). The `braces` ignore is untouched (GitHub shows its advisory as withdrawn).
- New arch test: an ignore must still match a version the lockfile resolves (red first on the node-forge ignore, then green).
- `/code-review high` ran twice (round 1 on the whole branch diff, round 2 on the delta); findings and fixes in `## Review (workflow step `review`, rule 09)

## In progress / not done

- Open findings, not fixable (the user decided to leave both open): `deepmerge` `GHSA-gcqx-w48m-w2h4` (low, no 4.3.2 on npm) and `minimatch` `GHSA-g3hv-75wg-m249` (moderate; the `^11.0.1` override breaks `eslint-plugin-import-x`, tried and reverted). Neither is ignored.
- Close-out is the last commit; the push is not done (needs the user's permission).

## Subagents (rule 12)

| Subagent          | What it did                                                                  | Result                                               |
| ----------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------- |
| audit-overrides-4 | Overrides, bumps, lockfile, decision 064, test strengthening, handoff, close | all of criteria 1-4 done on `feat/audit-overrides-4` |

## Validation (actual output of the last gate)

```
pnpm gate:push (2026-10-31, on 872aa20) → eslint 0 errors (1 pre-existing warning), nuxt typecheck clean, Test Files 34 passed (34), Tests 701 passed (701), "Build complete!", playwright "5 passed (10.8s)", EXIT=0
pnpm audit --audit-level=high → exit 0, "2 vulnerabilities found / Severity: 1 low | 1 moderate" (deepmerge low, minimatch moderate)
pnpm exec wrangler deploy --dry-run → bundle built (Total Upload 1121.74 KiB), exiting at --dry-run
```

Not covered: a real `pnpm cf:deploy` (only a `wrangler deploy --dry-run` was run); the `glob` major jump is exercised by the Nitro build (`@vercel/nft`), the unit suite and a check that the APIs the three consumers call exist in glob 14.0.3.

## Review (workflow step `review`, rule 09)

Review checklist (`.claude/templates/review-checklist.md`) run over the full branch diff (dependency and config
only: `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, one deleted patch, one arch test, decisions 056 and 064,
catalog, backlog, task files):

- [x] Secrets (01), company (02), Giphy boundary (03), PII (04), i18n (05): n/a, no app, server or locale change; sources are the public npm registry and GitHub advisories.
- [x] Branch (06): on `feat/audit-overrides-4`. Catalog (07): `ai-workflow.md` updated for the strengthened arch test. Gates (09): `pnpm gate` green in every commit, `gate:push` green. Contract (10): criteria 1-4 each map to the audit exit 0, the arch tests and `gate:push`. Decisions (11): 064 written, 056 amended with the user's approval to remove one ignore, no ignore added.
- [x] CSS (08), primitives (026, 038), living docs components (027), accessibility, UI consistency (16): n/a, no UI change. Subagents (12): the handoff names the single subagent.

code-review high, 2026-10-31. Round 1 over `origin/main...bf85676` (the first run of the skill reviewed the uncommitted
tree of the main checkout instead of this branch and its output was discarded; the rerun was pointed at the worktree).
Round 2 over the delta `bf85676..260ef0a` only. Fixes: 260ef0a (round 1) and 872aa20 (round 2).

- finding r1-1 — outcome: fixed — proof: strengthened tests/arch/audit-overrides.spec.ts › every patched dependency has an existing patch file that still matches the locked version
- finding r1-2 — outcome: no_change_needed — proof: the handoff and the Pending table were stale only until this re-close; this file is rewritten against the final tree and the close and push gates read it
- finding r1-3 — outcome: fixed — proof: new tests/arch/audit-overrides.spec.ts › the catalog paragraph on this arch test is well formed prose — searched: catalog paragraph, well formed — differs: docs-sync.spec.ts checks that each artifact has a catalog block, not the prose of this one paragraph
- finding r1-4 — outcome: fixed — proof: new tests/arch/audit-overrides.spec.ts › an ignore entry is read as its package and its full vulnerable range — searched: ignore entry, vulnerable range — differs: the existing ignore tests check documentation, this one tests the parser of the entry that the stale-ignore test relies on
- finding r1-5 — outcome: no_change_needed — proof: glob 14.0.3 keeps the CommonJS entry and exports `sync`, `glob`, `globSync` and `hasMagic`, the only APIs `archiver-utils`, `@vercel/nft` and `js-beautify` call; `pnpm gate:push` (Nitro build with `@vercel/nft`, 701 tests) and `wrangler deploy --dry-run` pass; the minimatch break was in `eslint-plugin-import-x` importing `makeRe`, which glob's own `minimatch` dependency does not involve
- finding r1-6 — outcome: no_change_needed — proof: prose-only correction in decision 064 (the audit figure is now "2 vulnerabilities, 1 low | 1 moderate", dated 2026-10-31); a snapshot of tool output cannot be asserted by a test
- finding r1-7 — outcome: fixed — proof: new tests/arch/audit-overrides.spec.ts › the lockfile resolves a single vue version so the Nuxt auto-import types augment it — searched: single vue, auto-import types
- finding r1-8 — outcome: no_change_needed — proof: this record replaces "code-review: not run"; both rounds of `/code-review high` are recorded here
- finding r2-1 — outcome: fixed — proof: new tests/arch/audit-overrides.spec.ts › the catalog paragraph on this arch test is well formed prose — searched: catalog paragraph, well formed — differs: docs-sync.spec.ts checks that each artifact has a catalog block, not the prose of this one paragraph
- finding r2-2 — outcome: fixed — proof: new tests/arch/audit-overrides.spec.ts › an ignore entry is read as its package and its full vulnerable range — searched: ignore entry, vulnerable range — differs: the existing ignore tests check documentation, this one tests the parser of the entry that the stale-ignore test relies on
- finding r2-3 — outcome: fixed — proof: new tests/arch/audit-overrides.spec.ts › an ignore entry is read as its package and its full vulnerable range — searched: ignore entry, vulnerable range — differs: the existing ignore tests check documentation, this one tests the parser of the entry that the stale-ignore test relies on
- finding r2-4 — outcome: no_change_needed — proof: the coupling between the `simple-git` override and a patch was removed on purpose in r1-1 (no patch exists any more); the remaining loop checks existence, locked version and decision for any future patch
- finding r2-5 — outcome: fixed — proof: new tests/arch/audit-overrides.spec.ts › an ignore entry is read as its package and its full vulnerable range — searched: ignore entry, vulnerable range — differs: the existing ignore tests check documentation, this one tests the parser of the entry that the stale-ignore test relies on
- finding r2-6 — outcome: no_change_needed — proof: the audit figure in decision 064 carries its date (2026-10-31) since 872aa20; prose only

## Pending on the user

| #   | What                                                                                                                                                                                                      | Blocks  | Status  |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------- |
| 1   | `deepmerge` `GHSA-gcqx-w48m-w2h4` (low) and `minimatch` `GHSA-g3hv-75wg-m249` (moderate) stay open and are not ignored (decided by the user); revisit when `eslint-plugin-import-x` supports minimatch 11 | nothing | decided |
| 2   | The `braces` ignore `GHSA-vfj7-8cjw-p6xm` is shown by GitHub as a withdrawn advisory: decide whether to remove it in a later task                                                                         | nothing | pending |

## Decisions made in this task

- → `.claude/docs/decisions/064-audit-overrides-2026-10-31.md` (with the 2026-10-31 addendum) and the amendment in `056-audit-overrides-and-ignored-advisories.md`
