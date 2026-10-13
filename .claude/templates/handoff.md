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

`/code-review` result: <effort level>, <date>, round <1|2>. One line per finding, written as real list items
outside the fence below (an empty review says `- findings: none`); the gate checks every such line at push and at
close (decision 057, third amendment; search first: strengthen an existing test, create a new one only when none
exists). The formats, kept in a fence so that this template's own examples are not counted as findings:

```
- finding <id> — outcome: fixed — proof: strengthened <tests/file> › <test name>
- finding <id> — outcome: fixed — proof: new <tests/file> › <test name> — searched: <term>[, <term>...]
- finding <id> — outcome: fixed — proof: new <tests/file> › <test name> — searched: <terms> — differs: <why a new test is needed>
- finding <id> — outcome: queued — proof: <backlog slug | tasks/<slug> folder | closed archive> and the reason
- finding <id> — outcome: no_change_needed — proof: <reason>
```

`strengthened`: the test already exists at the base ref (`origin/main`) and its file differs from the base. `new`:
the title is not at the base, and the gate searches every test/describe/it title under `tests/` and `e2e/` for each
`searched:` term; any other match blocks unless `— differs:` gives the reason.

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
