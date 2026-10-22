# Contract: merge-evidence-fix

**Story:** `story.md` · **Declared data sources (rule 02):** none.

## Acceptance criteria

| #   | Given / When / Then                                                                                                                                                                                                                                                                                                                    | Test that covers it                                                                                                  |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| 1   | Given a conflicted merge in progress (`MERGE_HEAD` exists) that stages a closed archive or handoff whose `commit`/`review`/`close-out` evidence shas are ancestors of `MERGE_HEAD` but not of `HEAD`, When the commit-time hook runs, Then it passes; the ancestry test accepts a sha that is an ancestor of `HEAD` OR of `MERGE_HEAD` | `tests/arch/require-contract-hook.spec.ts` › "a merge commit accepts evidence shas that are ancestors of MERGE_HEAD" |
| 2   | Given NO merge in progress, When evidence cites a sha that is not an ancestor of `HEAD`, Then it is still rejected (the existing behavior is unchanged)                                                                                                                                                                                | existing sibling test of the evidence ancestry rule (strengthened if it does not cover this case; search first)      |
| 3   | Given a merge in progress whose staged archive cites a sha that is an ancestor of neither side, When the hook runs, Then it is still rejected                                                                                                                                                                                          | same spec, sub-case of the criterion-1 test                                                                          |
| 4   | Given the change, When docs are read, Then decision 057 carries a dated note and the catalog `ai-workflow.md` mentions the merge-aware ancestry                                                                                                                                                                                        | `tests/arch/workflow-steps.spec.ts` existing docs tests stay green (+ a strengthened assertion if one fits)          |

## Subagent assignments (rule 12)

| Subagent           | Scope                                      | Criteria |
| ------------------ | ------------------------------------------ | -------- |
| merge-evidence-fix | hook change, tests, decision note, catalog | 1-4      |

## Standards to consult

- `.claude/docs/standards/testing.md`; decisions 054, 057; `.claude/docs/catalog/ai-workflow.md`

## Open questions (each with a destination)

- None.
