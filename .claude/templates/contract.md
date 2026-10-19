# Contract: <title>

**Story:** `story.md` · **Declared data sources (rule 02):** …

## Acceptance criteria

| #   | Given / When / Then   | Test that covers it          |
| --- | --------------------- | ---------------------------- |
| 1   | Given … When … Then … | `tests/unit/….spec.ts` › "…" |

## Subagent assignments (rule 12)

| Subagent | Scope | Criteria |
| -------- | ----- | -------- |
| …        | …     | …        |

## Standards to consult

If the task changes a file under `app/components/shared/` (rule 16, enforced at commit time), add a
`## Shared component consumers` section above: the result of `grep -rn "ComponentName" app/` and the decision
(only here / everywhere). The hook blocks the commit while that section is missing or empty.

- `.claude/docs/standards/….md`

## Open questions (each with a destination)

- … → `decided:` … / `.claude/docs/decisions/NNN-….md` / `owner: <name>`
