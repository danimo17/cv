# Contract: orphan-refs-and-scope

**Story:** `story.md` · **Declared data sources (rule 02):** none.

## Acceptance criteria

| #   | Given / When / Then                                                                                                                                                                                                                                                                                                                                                                                                                           | Test that covers it                                                                                                                                            |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Given every `data-testid` referenced in `e2e/**/*.spec.ts` and `tests/unit/**` (via `getByTestId(...)`, `[data-testid="..."]`, `findByTestId`), When scanned, Then each exists as a literal `data-testid="..."` (or a documented dynamic prefix) in `app/**/*.vue`; the spec lists any dynamic prefix with a reason                                                                                                                           | `tests/arch/no-orphan-testids.spec.ts` › "every test id used in tests exists in a component"                                                                   |
| 2   | Given the current tree, When criterion 1 runs, Then it passes because every orphan it finds was fixed in the test or the component (no behavior change)                                                                                                                                                                                                                                                                                       | `pnpm test:arch` + `pnpm gate:push` green                                                                                                                      |
| 3   | Given `.claude/rules/`, When read, Then a new rule 20 "synchronized change: no orphaned references" exists as a file and as a `hard-rules.md` row (short row), stating that a change to a public surface updates catalog, tests (unit and e2e) and docs in the same change, and naming `no-orphan-testids.spec.ts` as its check                                                                                                               | `tests/arch/orphan-refs-docs.spec.ts` › "rule 20 exists in hard-rules and rules and names its spec"                                                            |
| 4   | Given `.claude/rules/12-orchestration.md`, When read, Then the subagent-brief guidance carries the mandatory line: any assignment that removes or renames something must grep the whole repo (`app/`, `tests/`, `e2e/`, `.claude/docs/`) and update every reference in the same change                                                                                                                                                        | `tests/arch/orphan-refs-docs.spec.ts` › "rule 12 brief requires a repo-wide reference grep"                                                                    |
| 5   | Given `.claude/templates/contract.md` and `.claude/workflow.md`'s Story/Contract steps, When read, Then the contract template has a `## Shared component consumers` section (grep result of consumers, and the user's answer: only here / everywhere) and the workflow says to ask that question before writing the contract for any component under `app/components/shared/` or used from more than one parent; rule 11's text references it | `tests/arch/orphan-refs-docs.spec.ts` › "contract template and workflow require the shared component consumers question"                                       |
| 6   | Given the catalog, When read, Then `ai-workflow.md` documents the new spec and rule 20 (rule 07)                                                                                                                                                                                                                                                                                                                                              | `tests/arch/docs-sync.spec.ts` (existing) + criterion 3/5 specs + `tests/arch/orphan-refs-docs.spec.ts` › "the catalog documents rule 20 and the orphan specs" |

## Subagent assignments (rule 12)

| Subagent              | Scope                                                                     | Criteria |
| --------------------- | ------------------------------------------------------------------------- | -------- |
| orphan-refs-and-scope | the specs, rule 20, rule 12 line, template/workflow/rule 11 text, catalog | 1-6      |

## Standards to consult

- `.claude/docs/standards/testing.md`, rule 07, rule 16 text

## Open questions (each with a destination)

- Whether to fold rule 20 into rule 07 → decided: separate rule 20 (hard rules stay one concern each), short row.
