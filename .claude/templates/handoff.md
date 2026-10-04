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

## Review (workflow step 8, rule 09)

Review checklist (`.claude/templates/review-checklist.md`) run over the full branch diff:

- [ ] Secrets/company/giphy/PII/i18n/branch/catalog/CSS/gates/contract/decisions/primitives/living-docs/
      subagents/accessibility/UI-consistency — go through every line of the template, mark n/a where a
      category doesn't apply to this diff, otherwise checked

`/code-review` result: <effort level>, <N findings, outcome of each — fixed / no_change_needed / left as
backlog with a reason>.

## Pending on the user

| #   | What | Blocks | Status  |
| --- | ---- | ------ | ------- |
| 1   | …    | …      | pending |

## Post-merge deploy check (decision 042, only after the user merges)

- [ ] `gh run list --branch main --limit 1 --workflow deploy.yml` shows `success` for this merge's commit.
- If not: this is an open bug on this task, not a footnote — fix before closing.

## Decisions made in this task

- → `.claude/docs/decisions/NNN-….md`
