# Handoff: close-workflow-redesign

_Updated: 2026-10-05 (gate-everywhere slice). REAL state of the `feat/close-workflow-redesign` branch._

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

- gate-everywhere slice (criteria 12-16, from the 2026-10-05 high `/code-review`): `require-contract.py` rewritten
  into one script with four invocations (Claude stdin-JSON, `--commit`, `--pre-push`, `--ci <branch> <sha>`); slug
  comes from the `feat/<slug>` branch name and `ACTIVE` is ignored on feat branches; the Claude push gate parses
  the refspec and gates the tip of the source ref per `feat/*` destination; `commit`/`review`/`close-out` evidence
  must contain a real commit sha, `[X]` counts as ticked; `.githooks/pre-commit` and `.githooks/pre-push` call the
  script before the pnpm gates; `ci.yml` has a `workflow-gate` job; `HOOK_UNDER_TEST` removed and an arch test
  forbids it; decision 057 has an `Amendment 2026-10-05`; docs/rules/catalog/README/CLAUDE.md say `ACTIVE` is no
  longer needed on feat branches.

## In progress / not done

- closer slice (criterion 10): close `spacing-tokens`, then this task, through the fixed hook. When closing, the
  `commit`, `review` and `close-out` progress lines now need a real commit sha as evidence.
- Review (`/code-review`) of the whole branch, including this slice, not run yet.
- Not run anywhere: the `workflow-gate` job of `ci.yml` (Actions can't be run locally; it was checked for YAML
  validity and by reading, its first real run is the first `feat/*` PR). If the ruleset should make it blocking,
  `workflow-gate` has to be added to the required checks (user action, see Pending).

## Subagents (rule 12)

| Subagent        | What it did                                                                                                                                                                                                                 | Result                                                                                                                                           |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| workflow-docs   | step list json, workflow.md, templates, rules 09/10, hard-rules, decision 057, catalog, workflow-steps arch test                                                                                                            | done in 73871d8 (see Validation)                                                                                                                 |
| hook-and-tests  | `require-contract.py` rewrite + hook spec (56 tests, written red first: 28 failed, then all green)                                                                                                                          | done in b206a86; interrupted once, a second agent reviewed, finished and verified the partial work (old-hook comparison, docs, handoff evidence) |
| gate-everywhere | criteria 12-16: branch-keyed slug, `--commit`/`--pre-push`/`--ci` modes + git hook and CI wiring, refspec-aware push gate, sha-verified evidence, `HOOK_UNDER_TEST` removed (spec written red first: 50 failed, then green) | done in 15908bf (script, tests, git hooks, CI) and 29cbbbd (docs); see Validation                                                                |

## Validation (actual output of the last gate)

```
pnpm gate (on 29cbbbd, gate-everywhere slice) → format:check ok, lint 0 errors (1 pre-existing warning), typecheck ok, Test Files 23 passed (23), Tests 415 passed (415)
local smoke of .githooks/pre-push with the pushed HEAD sha of this branch → exit 2, 2 problems named (## Review unchecked items; progress steps handoff, commit, review, close-out, gate-push not ticked), expected until review/close-out are done
pnpm gate (on b206a86) → format:check ok, lint 0 errors (1 pre-existing vue/require-default-prop warning),
typecheck ok, Test Files 23 passed (23), Tests 350 passed (350)
earlier agent: the then-current hook spec run against the pre-rewrite hook (`git show 73871d8:.claude/hooks/require-contract.py`) → 28 failed | 28 passed (56); against the rewritten hook → 56 passed (56). That override was removed afterwards (criterion 16).
```

The 28 cases that fail on the old hook cover every required behavior (close with ACTIVE emptied/other slug, archive
checklist boxes, ACTIVE-empty push via branch slug, progress evidence, fully-ticked pre-push steps, story.md
required). The 054 behavior cases (ACTIVE set) mostly pass on both hooks by design (unchanged behavior), except
"reads ACTIVE from HEAD, not from the working tree".

Not covered: the hook can't prove evidence is true (non-empty, and a resolvable commit sha for
`commit`/`review`/`close-out`), doesn't judge `story` content or `validate`; the Claude hook only sees commands
run through Claude's Bash tool, the git hooks can be skipped with `--no-verify` (CI `workflow-gate` is the
backstop, only blocking if it is a required check, and it has not run yet); review of the rule docs for
criterion 9 happens in `## Review`.

## Review (workflow step `review`, rule 09)

Not run yet (runs over the full branch diff once the hook slice lands).

- [ ] Review checklist over the full branch diff
- [ ] `/code-review` effort level, date and outcome of each finding

## Pending on the user

| #   | What                                                                                                                       | Blocks                      | Status |
| --- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------- | ------ |
| 1   | Decide whether `workflow-gate` becomes a required check in the `main` ruleset (a skipped job passes, so it is safe to add) | making the CI backstop hard | open   |

## Decisions made in this task

- → `.claude/docs/decisions/057-close-out-before-single-push.md`
