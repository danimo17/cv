# Handoff: <slug>

_Updated: YYYY-MM-DD HH:MM. REAL state of the `feat/<slug>` branch._

## Done (verified)

- …

## In progress / not done

- …

## Subagents (rule 12)

| Subagent | What it did | Result |
| -------- | ----------- | ------ |

## Validation (actual output of the last gate)

```
pnpm gate → …
```

Not covered: …

## Pending on the user

| #   | What | Blocks | Status  |
| --- | ---- | ------ | ------- |
| 1   | …    | …      | pending |

## Post-merge deploy check (decision 042, only after the user merges)

- [ ] `gh run list --branch main --limit 1 --workflow deploy.yml` shows `success` for this merge's commit.
- If not: this is an open bug on this task, not a footnote — fix before closing.

## Decisions made in this task

- → `.claude/docs/decisions/NNN-….md`
