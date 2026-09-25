# Contract: composable-store-regions

**Story:** `story.md` · **Declared data sources (rule 02):** none (pure code-organization convention).

## Acceptance criteria

| #   | Given / When / Then                                                                                                                                                  | Test that covers it                    |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| 1   | Given `.claude/rules/14-no-code-comments.md`, When read, Then it exempts exactly `// #region`/`// #endregion` markers in composables/stores, not comments generally  | manual review of the diff              |
| 2   | Given `.claude/docs/standards/state.md`, When read, Then it lists the exact region names and order for composables and stores                                        | manual review of the diff              |
| 3   | Given `app/stores/giphy.ts` and `app/stores/hero.ts`, When read, Then their `ref`/`computed`/functions are grouped under State/Getters/Methods regions in that order | manual review; `pnpm gate` still green |
| 4   | Given `app/composables/useMessageList.ts`, When read, Then it correctly carries no region markers (every region would be empty for this file)                        | manual review                          |
| 5   | Given `.claude/hard-rules.md` rule 14's row, When read, Then it mentions the new exception                                                                           | manual review of the diff              |

## Subagent assignments (rule 12)

None — pure decision-writing + a mechanical, already-fully-specified 2-file edit (main thread, rule 12
exception for trivial/already-drafted content).

## Standards to consult

- `.claude/docs/standards/state.md` (this task's own edit)
- `.claude/rules/14-no-code-comments.md`

## Open questions (each with a destination)

None — fully specified by the user's request, decided and logged in `.claude/docs/decisions/052-composable-store-regions.md`.
