# Handoff: audit-overrides-3

_Updated: 2026-10-29. REAL state of the `feat/audit-overrides-3` branch._

## Workflow progress

- [x] story — evidence: eefb2bb (story.md and backlog row `doing`)
- [x] contract — evidence: eefb2bb (contract.md, criteria 1-3)
- [x] build — evidence: 99b499f (nine overrides, lockfile, decision 062, arch test, catalog)
- [x] consolidate — evidence: 99b499f (pnpm gate green in the commit hook)
- [x] validate — evidence: 2026-10-29 pnpm gate 26 files / 604 tests passed, 0 lint errors; pnpm audit --audit-level=high exit 0
- [ ] handoff — evidence:
- [x] commit — evidence: 99b499f
- [ ] review — evidence:
- [ ] close-out — evidence:
- [ ] gate-push — evidence:
- [ ] push-pr — evidence:

## Done (verified)

- `pnpm audit --audit-level=high` listed eleven high advisories on eight packages (`zod`, `happy-dom`, `undici` 7.x and 8.x, `seroval`, `@intlify/shared`, `@intlify/core`, `@intlify/core-base`, `vue-i18n`). Every patched version exists on npm and is older than 24 hours, so nothing is ignored and no `minimumReleaseAgeExclude` entry was added.
- Nine overrides added in `pnpm-workspace.yaml` (existing overrides, patch and the two ignores untouched): `zod@>=4.0.0 <4.6.6` to `^4.6.6` (4.6.7), `happy-dom@<21.0.4` to `^21.0.4` (21.0.4), `undici@>=8.0.0 <8.12.2` to `^8.12.2` (8.12.3), `undici@>=7.29.1 <7.30.1` to `^7.30.1` (7.30.1), `seroval@<1.6.8` to `^1.6.8` (1.7.2), `@intlify/{shared,core,core-base}@>=11.1.10 <11.4.14` and `vue-i18n@>=11.1.10 <11.4.14` to `^11.4.14` (11.4.16).
- `pnpm audit --audit-level=high` exits 0: "8 vulnerabilities found, 4 low | 3 moderate | 1 high (1 ignored)".
- `tests/arch/audit-overrides.spec.ts` strengthened (red first, then green): the lockfile-floor test now covers the new packages (7 tests passing).
- Decision 062 written; catalog `ai-workflow.md` updated.

## In progress / not done

- Nothing in the code. Review, close-out and gate-push are recorded in the progress block above.

## Subagents (rule 12)

| Subagent          | What it did                                                                   | Result                                               |
| ----------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------- |
| audit-overrides-3 | Overrides, lockfile, decision 062, test strengthening, handoff, review, close | all of criteria 1-3 done on `feat/audit-overrides-3` |

## Validation (actual output of the last gate)

```
pnpm gate:push (2026-10-29) → eslint 0 errors (1 pre-existing warning), Test Files 26 passed (26), Tests 604 passed (604), "Build complete!", playwright "5 passed (14.2s)", exit 0
pnpm audit --audit-level=high → exit 0, "8 vulnerabilities found / Severity: 4 low | 3 moderate | 1 high (1 ignored)"
```

Not covered: the `happy-dom` direct devDependency in `package.json` still says `^20.0.11` while the override resolves it to 21.0.4 (pnpm accepts it with `--frozen-lockfile`); the remaining moderate and low advisories (`nuxt` <4.6.2, `serialize-javascript`, `deepmerge`) are below the audit level.

## Review (workflow step `review`, rule 09)

Review checklist (`.claude/templates/review-checklist.md`) run over the full branch diff (dependency and config
only: `pnpm-workspace.yaml`, `pnpm-lock.yaml`, one arch test, decision 062, catalog, backlog, task files):

- [x] Secrets (01), company (02), Giphy boundary (03), PII (04), i18n (05): n/a, no app, server or locale change; sources are the public npm registry and GitHub advisories.
- [x] Branch (06): on `feat/audit-overrides-3`. Catalog (07): `ai-workflow.md` updated for the strengthened arch test. Gates (09): `pnpm gate` green in the commit. Contract (10): criteria 1-3 each map to the audit exit 0, the arch tests and `gate:push`. Decisions (11): 062 written, no ignore added.
- [x] CSS (08), primitives (026, 038), living docs components (027), accessibility, UI consistency (16): n/a, no UI change. Subagents (12): the handoff names the single subagent.

code-review: not run for this dependency-only change; covered by `pnpm audit --audit-level=high` exiting 0, the
arch tests (`tests/arch/audit-overrides.spec.ts`) and `pnpm gate:push` (build + e2e). 2026-10-29, round 1, no
effort level.

- findings: none

## Pending on the user

| #   | What                                                                                                                           | Blocks  | Status  |
| --- | ------------------------------------------------------------------------------------------------------------------------------ | ------- | ------- |
| 1   | Optional: raise the `happy-dom` specifier in `package.json` to `^21.0.4` so it matches the override (decision 062 remove-when) | nothing | pending |

## Decisions made in this task

- → `.claude/docs/decisions/062-audit-overrides-2026-10-29.md`
