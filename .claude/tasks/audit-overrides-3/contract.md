# Contract: audit-overrides-3

**Story:** `story.md` · **Declared data sources (rule 02):** npm registry and GitHub advisories (public).

## Acceptance criteria

| #   | Given / When / Then                                                                                                                                                                                                                                                                                                                                                                          | Test that covers it                                                                               |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| 1   | Given main's lockfile has high advisories published 2026-10-2x, When `pnpm audit --audit-level=high` runs (the CI `audit` job), Then it exits 0 after `overrides` raise `zod`, `happy-dom`, `undici` 8.x and `undici` 7.x (and any other listed advisory with a patched version on npm) to their patched floors; an advisory with no patched version on npm is NOT ignored (stop and report) | `pnpm audit --audit-level=high` exit 0 + `pnpm gate:push` green                                   |
| 2   | Given `pnpm-workspace.yaml`, When tests run, Then every override has a floor at or above its patched version, the lockfile resolves nothing inside the vulnerable range, and a decision (062) mentions each override key with a remove-when condition                                                                                                                                        | `tests/arch/audit-overrides.spec.ts` (existing tests strengthened for the new keys; search first) |
| 3   | Given the new overrides, When the build and e2e run, Then they pass (nuxt, eslint config inspector, vitest with happy-dom and wrangler still work)                                                                                                                                                                                                                                           | `pnpm gate:push`                                                                                  |

## Subagent assignments (rule 12)

| Subagent          | Scope                                                 | Criteria |
| ----------------- | ----------------------------------------------------- | -------- |
| audit-overrides-3 | overrides, lockfile, decision 062, test strengthening | 1-3      |

## Standards to consult

- Decisions 056, 058, 061; `tests/arch/audit-overrides.spec.ts`; `.claude/docs/catalog/ai-workflow.md`

## Open questions (each with a destination)

- Advisories with no patched version → owner: user.
- Whether the audit job should keep blocking on advisories younger than N days → owner: user, asked in chat.
