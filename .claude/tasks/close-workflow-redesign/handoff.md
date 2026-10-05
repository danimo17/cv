# Handoff: close-workflow-redesign

_Updated: 2026-10-05. REAL state of the `feat/close-workflow-redesign` branch._

## Workflow progress

One line per `pre-push` step of `.claude/workflow-steps.json`, in order. Tick a step only when it is really
done: `- [x] <id> — evidence: <commit sha / gate output line / date>`. Evidence is mandatory once ticked
(blocked at commit time otherwise). `push-pr` is ticked last, after the push and the PR exist; the post-merge
steps (`merge`, `deploy-check`) are not listed here.

- [x] story — evidence: 203496b (story.md, ACTIVE, backlog `doing`)
- [x] contract — evidence: 203496b (contract.md with 11 Given/When/Then criteria)
- [x] build — evidence: 73871d8 (workflow docs slice) + b206a86 (hook rewrite + hook spec)
- [x] consolidate — evidence: pnpm gate green on b206a86: Test Files 23 passed (23), Tests 350 passed (350), lint 0 errors
- [x] validate — evidence: hook spec run against old hook 73871d8 (28 of 56 fail) and new hook (56 pass); see Validation
- [ ] handoff — evidence:
- [ ] commit — evidence:
- [ ] review — evidence:
- [ ] close-out — evidence:
- [ ] gate-push — evidence:
- [ ] push-pr — evidence:

## Done (verified)

- hook-and-tests slice (criteria 1, 2, 4, 5, 7, 8): `.claude/hooks/require-contract.py` rewritten (closing by
  staged deletions, HEAD/index-based reads, ACTIVE-empty push via branch slug, progress evidence + completeness)
  and `tests/arch/require-contract-hook.spec.ts` (56 tests, throwaway git repos). `story` gate flipped to
  `require-contract` (story.md now required by the hook); catalog `ai-workflow.md` describes the final behavior.
- workflow-docs slice (criteria 3, 6, 9, 11): `.claude/workflow-steps.json`, rewritten `.claude/workflow.md`,
  `templates/close-checklist.md`, `templates/handoff.md`, `hard-rules.md` rows 09/10, `rules/09-gates.md`,
  `rules/10-contract-first.md`, decision 057 (+ "Superseded in part by 057" notes on 042 and 051), catalog
  `ai-workflow.md`, `tests/arch/workflow-steps.spec.ts` (4 criterion tests + 1 json well-formedness test).

## In progress / not done

- closer slice (criterion 10): close `spacing-tokens`, then this task, through the fixed hook.
- Review (`/code-review`) not run yet.

## Subagents (rule 12)

| Subagent       | What it did                                                                                                      | Result                                                                                                                                           |
| -------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| workflow-docs  | step list json, workflow.md, templates, rules 09/10, hard-rules, decision 057, catalog, workflow-steps arch test | done in 73871d8 (see Validation)                                                                                                                 |
| hook-and-tests | `require-contract.py` rewrite + hook spec (56 tests, written red first: 28 failed, then all green)               | done in b206a86; interrupted once, a second agent reviewed, finished and verified the partial work (old-hook comparison, docs, handoff evidence) |

## Validation (actual output of the last gate)

```
pnpm gate (on b206a86) → format:check ok, lint 0 errors (1 pre-existing vue/require-default-prop warning),
typecheck ok, Test Files 23 passed (23), Tests 350 passed (350)
HOOK_UNDER_TEST=<73871d8 hook> vitest run tests/arch/require-contract-hook.spec.ts → 28 failed | 28 passed (56)
vitest run tests/arch/require-contract-hook.spec.ts (new hook) → 56 passed (56)
```

The 28 cases that fail on the old hook cover every required behavior (close with ACTIVE emptied/other slug, archive
checklist boxes, ACTIVE-empty push via branch slug, progress evidence, fully-ticked pre-push steps, story.md
required). The 054 behavior cases (ACTIVE set) mostly pass on both hooks by design (unchanged behavior), except
"reads ACTIVE from HEAD, not from the working tree".

Not covered: the hook can't prove evidence is true (only non-empty), doesn't judge `story` content or `validate`,
only sees commands run through Claude's Bash tool, and reads the checked-out branch rather than a push refspec;
review of the rule docs for criterion 9 happens in `## Review`.

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
