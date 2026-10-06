# Handoff: <slug>

_Updated: YYYY-MM-DD HH:MM. REAL state of the `feat/<slug>` branch._

## Workflow progress

One line per `pre-push` step of `.claude/workflow-steps.json`, in order. Tick a step only when it is really
done: `- [x] <id> — evidence: <commit sha / gate output line / date>`. Evidence is mandatory once ticked
(blocked at commit time otherwise), and for `commit`, `review` and `close-out` it must contain a real commit
sha (7-40 hex characters that exist in the repository and are ancestors of the branch tip); the `review` sha is
the commit that recorded the review in this file (its diff must change the content of `## Review` below; a
progress tick or Pending edit does not count). A code change of the branch after that sha (outside `.claude/`,
or in `.claude/hooks/` or `.claude/workflow-steps.json`; merging `main` does not count) makes the review stale:
re-run `/code-review high`, record it, and re-point the evidence. `push-pr` is ticked last, after the push and the PR exist; the post-merge
steps (`merge`, `deploy-check`) are not listed here.

- [ ] story — evidence:
- [ ] contract — evidence:
- [ ] build — evidence:
- [ ] consolidate — evidence:
- [ ] validate — evidence:
- [ ] handoff — evidence:
- [ ] commit — evidence:
- [ ] review — evidence:
- [ ] close-out — evidence:
- [ ] gate-push — evidence:
- [ ] push-pr — evidence:

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

## Review (workflow step `review`, rule 09)

Review checklist (`.claude/templates/review-checklist.md`) run over the full branch diff:

- [ ] Secrets/company/giphy/PII/i18n/branch/catalog/CSS/gates/contract/decisions/primitives/living-docs/
      subagents/accessibility/UI-consistency — go through every line of the template, mark n/a where a
      category doesn't apply to this diff, otherwise checked

`/code-review` result: <effort level>, <date>, <N findings, outcome of each — fixed / no_change_needed / left as
backlog with a reason>.

## Pending on the user

| #   | What | Blocks | Status  |
| --- | ---- | ------ | ------- |
| 1   | …    | …      | pending |

## Decisions made in this task

- → `.claude/docs/decisions/NNN-….md`

At close-out, `## Review` and `## Workflow progress` are copied into `.claude/tasks/closed/<slug>.md`. The
close-out is the last commit before the push, taken only after the final review of the full diff (a user-run
`/code-review` included) and its fixes; to reopen after a later finding: `git revert <close-out sha>`, fix,
re-review, close again. The deploy check after merge is reported in chat, not tracked here.
