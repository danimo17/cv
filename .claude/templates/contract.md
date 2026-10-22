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

## Shared component consumers

Only when the task changes a file under `app/components/shared/` (rule 16, enforced at commit time; otherwise
delete this section): the result of `grep -rn "ComponentName" app/` and the decision (only here / everywhere).
The hook blocks the commit while this section is empty.

- …

## Standards to consult

- `.claude/docs/standards/….md`

## Open questions (each with a destination)

- … → `decided:` … / `.claude/docs/decisions/NNN-….md` / `owner: <name>`
