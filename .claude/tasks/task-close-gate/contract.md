# Contract: task-close-gate

**Story:** `story.md` · **Declared data sources (rule 02):** none (pure `.claude/` process/hook change).

## Acceptance criteria

| #   | Given / When / Then                                                                                                                                                                                                                                                                                                                                       | Test that covers it                                                                                                                                |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Given `.claude/tasks/ACTIVE` is empty/whitespace-only, When a commit is staged with every file under `.claude/`, Then the commit is allowed (no contract required)                                                                                                                                                                                        | manual: empty ACTIVE + docs-only staged commit succeeds                                                                                            |
| 2   | Given `.claude/tasks/ACTIVE` is empty/whitespace-only, When a commit is staged that touches any file under `app/`, `server/`, or `shared/`, Then the commit is blocked with a clear message (needs an active contract)                                                                                                                                    | manual: empty ACTIVE + a staged `app/` file is rejected                                                                                            |
| 3   | Given `.claude/tasks/ACTIVE` names slug `X`, When a commit's staged changes delete `.claude/tasks/X/` entirely, Then the commit is blocked unless `.claude/tasks/closed/X.md` is also staged as a new file in the same commit with zero unchecked `- [ ]` boxes                                                                                           | manual: close-commit without the archive file is rejected; with an archive containing an unchecked box is rejected; fully-checked archive succeeds |
| 4   | Given `.claude/templates/close-checklist.md`, When read, Then it lists: contract criteria verified, real `gate:push` output confirmed (not a task-notification wrapper), PR merged (link+SHA), deploy verified green (decision 042, run ID), decisions promoted, catalog promoted, standards updated, no open rule-11 conflict, backlog row set to `done` | manual review of the template                                                                                                                      |
| 5   | Given `.claude/hard-rules.md` rule 10's row and `.claude/rules/10-contract-first.md`, When read, Then both describe the new empty-ACTIVE + close-archive behavior, not just "no code without a contract"                                                                                                                                                  | manual review of the diff                                                                                                                          |
| 6   | Given `workflow.md` step 13, When read, Then it points at the real mechanism (`close-checklist.md` → archived to `closed/<slug>.md`, hook-verified) instead of prose-only "promote what is durable"                                                                                                                                                       | manual review of the diff                                                                                                                          |

## Subagent assignments (rule 12)

| Subagent        | Scope                                                                                                                                                                                                                                                                                                                                            | Criteria   |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| close-gate-hook | Implement the two new checks in `.claude/hooks/require-contract.py` (empty-ACTIVE docs-only allowance; close-commit archive requirement), write `.claude/templates/close-checklist.md`, write/run a manual verification of each acceptance criterion (git sandbox commits, not the real repo state), report exact diff + verification transcript | 1, 2, 3, 4 |

Docs updates (criteria 5, 6) done by the main thread (rule 12 — decision-writing, small, no research needed).

## Standards to consult

- `.claude/hooks/require-contract.py` (existing pattern to extend, not replace)
- `.claude/docs/catalog/ai-workflow.md` (where hook behavior is documented, rule 07)

## Open questions (each with a destination)

- Exact close-checklist item wording and empty-ACTIVE sentinel (empty file vs. a literal token) → decided by
  the AI per the grill-me in `story.md`, logged as a decision once built (`.claude/docs/decisions/`), not
  asked back.
