# Contract: push-review-gate

**Story:** `story.md` · **Declared data sources (rule 02):** none (pure `.claude/` process/hook change).

## Acceptance criteria

| #   | Given / When / Then                                                                                                                                                | Test that covers it              |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------- |
| 1   | Given a `feat/*` branch with `ACTIVE` set, When `git push` is attempted and `handoff.md` has no `## Review` section, Then the push is blocked with a clear message | manual sandbox test              |
| 2   | Given the same, When `## Review`'s section text contains any `- [ ]`, Then the push is blocked, naming what's unchecked                                            | manual sandbox test              |
| 3   | Given the same, When `## Review`'s section text has no unchecked boxes but never mentions "code-review", Then the push is blocked                                  | manual sandbox test              |
| 4   | Given the same, When `## Review` is fully checked and mentions "code-review", Then the push proceeds                                                               | manual sandbox test              |
| 5   | Given `ACTIVE` is empty, When `git push` is attempted, Then this check does not apply (existing empty-ACTIVE rule governs instead)                                 | manual sandbox test (regression) |
| 6   | Given a commit-only invocation (`git commit`), When run, Then this new check never fires (push-only)                                                               | manual sandbox test (regression) |
| 7   | Given `.claude/templates/handoff.md`, When read, Then it has a `## Review` section positioned between `## Validation` and `## Pending on the user`                 | manual review                    |
| 8   | Given `.claude/hard-rules.md` rule 09 and `.claude/workflow.md` steps 8-9, When read, Then both describe the new mechanism                                         | manual review                    |

## Subagent assignments (rule 12)

| Subagent       | Scope                                                                                                                                                                                      | Criteria |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| push-gate-hook | Implement the new push check in `require-contract.py`, add the `## Review` section to `templates/handoff.md`, run a manual sandbox verification transcript for all 6 test criteria, report | 1-6      |

Docs updates (7, 8) done by the main thread (decision-writing, small).

## Standards to consult

- `.claude/hooks/require-contract.py` (existing `task-close-gate` section resolution pattern — the `## Review`
  extraction is structurally identical: find a heading, take text until the next `## ` heading)
- `.claude/templates/handoff.md`

## Open questions (each with a destination)

None — fully specified by the grill-me in `story.md`.
