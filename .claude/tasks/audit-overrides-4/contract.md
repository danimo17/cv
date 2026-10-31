# Contract: audit-overrides-4

**Story:** `story.md` · **Declared data sources (rule 02):** npm registry and GitHub advisories (public).

## Acceptance criteria

| #   | Given / When / Then                                                                                                                                                                                                                                                                                                                         | Test that covers it                                                                               |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| 1   | Given main's lockfile has high `node-forge` advisories, When `pnpm audit --audit-level=high` runs (the CI `audit` job), Then it exits 0 after the overrides and the `nuxt` bump; every patched version exists on npm and is older than 24 hours; an advisory with no patched version on npm (`deepmerge`) is NOT ignored and is reported    | `pnpm audit --audit-level=high` exit 0 + `pnpm gate:push` green                                   |
| 2   | Given `pnpm-workspace.yaml`, When tests run, Then every override has a floor at or above its patched version, the lockfile resolves nothing inside the vulnerable range (node-forge, serialize-javascript, glob, minimatch, nuxt family included), and a decision (064) mentions each override key with a remove-when condition             | `tests/arch/audit-overrides.spec.ts` (existing tests strengthened for the new keys; search first) |
| 3   | Given `nuxt` is raised to `^4.6.3` and `@nuxt/devtools` 3.4.4 no longer depends on `simple-git`, When the workspace is read, Then the `@nuxt/devtools@3.4.2` patch, its patch file and the `simple-git` and `@simple-git/argv-parser` overrides are gone, and the lockfile holds no `simple-git` below 4.0.1 (and nothing is left to patch) | `tests/arch/audit-overrides.spec.ts`                                                              |
| 4   | Given the new versions (`nuxt` 4.6.3, `glob` 14, `minimatch` 11, `node-forge` 1.4.2, `serialize-javascript` 7.1.4), When lint, typecheck, unit and arch tests, the build and e2e run, Then they pass                                                                                                                                        | `pnpm gate:push`                                                                                  |

## Subagent assignments (rule 12)

| Subagent          | Scope                                                                   | Criteria |
| ----------------- | ----------------------------------------------------------------------- | -------- |
| audit-overrides-4 | overrides, nuxt bump, lockfile, decision 064, test strengthening, close | 1-4      |

## Standards to consult

- Decisions 056, 058, 061, 062, 063; `tests/arch/audit-overrides.spec.ts`; `.claude/docs/catalog/ai-workflow.md`

## Open questions (each with a destination)

- `deepmerge` `GHSA-gcqx-w48m-w2h4` (low) has no patched release on npm (latest 4.3.1) → owner: user; not ignored.
