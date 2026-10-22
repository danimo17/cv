# Contract: audit-overrides-2

**Story:** `story.md` · **Declared data sources (rule 02):** npm registry and GitHub advisories (public).

## Acceptance criteria

| #   | Given / When / Then                                                                                                                                                                                                                                                                                                                                                                                                          | Test that covers it                                                                                     |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 1   | Given main's lockfile has high advisories published 2026-10-2x, When `pnpm audit --audit-level=high` runs (the CI `audit` job), Then it exits 0 after `overrides` raise `@modelcontextprotocol/server`, `vite` (8.3.x) and `launch-editor` (and any other listed advisory with a patched version on npm) to their patched floors; an advisory with no patched version on npm is NOT ignored (the agent stops and reports it) | `pnpm audit --audit-level=high` exit 0 + `pnpm gate:push` green                                         |
| 2   | Given `pnpm-workspace.yaml`, When tests run, Then every override has a floor at or above its patched version, the lockfile resolves nothing inside the vulnerable range, and a decision (061) mentions each override key with a remove-when condition                                                                                                                                                                        | `tests/arch/audit-overrides.spec.ts` (existing tests strengthened with the new overrides; search first) |
| 3   | Given the new overrides, When the build and e2e run, Then they pass (nuxt, eslint config inspector and vite still work with the raised floors)                                                                                                                                                                                                                                                                               | `pnpm gate:push`                                                                                        |

## Subagent assignments (rule 12)

| Subagent          | Scope                                                 | Criteria |
| ----------------- | ----------------------------------------------------- | -------- |
| audit-overrides-2 | overrides, lockfile, decision 061, test strengthening | 1-3      |

## Standards to consult

- Decisions 056, 058; `tests/arch/audit-overrides.spec.ts`; `.claude/docs/catalog/ai-workflow.md`

## Open questions (each with a destination)

- Advisories with no patched version → owner: user (ignore needs explicit approval).
