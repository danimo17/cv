# Handoff: close-workflow-redesign

_Updated: 2026-10-05. REAL state of the `feat/close-workflow-redesign` branch._

## Workflow progress

One line per `pre-push` step of `.claude/workflow-steps.json`, in order. Tick a step only when it is really
done: `- [x] <id> — evidence: <commit sha / gate output line / date>`. Evidence is mandatory once ticked
(blocked at commit time otherwise). `push-pr` is ticked last, after the push and the PR exist; the post-merge
steps (`merge`, `deploy-check`) are not listed here.

- [x] story — evidence: 203496b (story.md, ACTIVE, backlog `doing`)
- [x] contract — evidence: 203496b (contract.md with 11 Given/When/Then criteria)
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

- workflow-docs slice (criteria 3, 6, 9, 11): `.claude/workflow-steps.json`, rewritten `.claude/workflow.md`,
  `templates/close-checklist.md`, `templates/handoff.md`, `hard-rules.md` rows 09/10, `rules/09-gates.md`,
  `rules/10-contract-first.md`, decision 057 (+ "Superseded in part by 057" notes on 042 and 051), catalog
  `ai-workflow.md`, `tests/arch/workflow-steps.spec.ts` (4 criterion tests + 1 json well-formedness test).

## In progress / not done

- hook-and-tests slice (criteria 1, 2, 4, 5, 7, 8): `require-contract.py` rewrite and
  `tests/arch/require-contract-hook.spec.ts` — not started here; the catalog documents the intended behavior and
  marks it as not yet implemented.
- closer slice (criterion 10): close `spacing-tokens`, then this task, through the fixed hook.
- Review (`/code-review`) not run yet.

## Subagents (rule 12)

| Subagent       | What it did                                                                                                      | Result                              |
| -------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| workflow-docs  | step list json, workflow.md, templates, rules 09/10, hard-rules, decision 057, catalog, workflow-steps arch test | done; `pnpm gate` green (see below) |
| hook-and-tests | `require-contract.py` rewrite + hook spec                                                                        | pending (next agent)                |

## Validation (actual output of the last gate)

```
pnpm gate → format:check ok, lint 0 errors (1 pre-existing vue/require-default-prop warning), typecheck ok,
Test Files 22 passed (22), Tests 294 passed (294)
```

Not covered: the hook behavior itself (criteria 1, 2, 4, 5, 7, 8) until the hook rewrite lands; review of the rule
docs for criterion 9 happens in `## Review`.

## Review (workflow step `review`, rule 09)

Not run yet (runs over the full branch diff once the hook slice lands).

- [ ] Review checklist over the full branch diff
- [ ] `/code-review` effort level, date and outcome of each finding

## Pending on the user

| #   | What     | Blocks | Status |
| --- | -------- | ------ | ------ |
| -   | none yet | -      | -      |

## Decisions made in this task

- → `.claude/docs/decisions/057-close-out-before-single-push.md`
