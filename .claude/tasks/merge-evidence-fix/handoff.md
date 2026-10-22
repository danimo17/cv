# Handoff: merge-evidence-fix

_Updated: 2026-10-22. REAL state of the `feat/merge-evidence-fix` branch._

## Workflow progress

One line per `pre-push` step of `.claude/workflow-steps.json`, in order. Tick a step only when it is really
done: `- [x] <id> — evidence: <commit sha / gate output line / date>`. Evidence is mandatory once ticked
(blocked at commit time otherwise), and for `commit`, `review` and `close-out` it must contain a real commit
sha.

- [x] story — evidence: 2473fd2 (story.md, backlog row)
- [x] contract — evidence: 2473fd2 (contract.md, criteria 1-4)
- [x] build — evidence: d7db3cb (hook change, 5 new tests, decision 057 amendment, catalog line)
- [x] consolidate — evidence: pnpm gate green on d7db3cb (26 test files, 609 tests passed, 0 lint errors, typecheck clean)
- [x] validate — evidence: 2026-10-22 the new tests failed before the hook change (3 of 5 red) and pass after it; the stale-tip hunk was reverted once to confirm two tests depend on it
- [x] handoff — evidence: 2026-10-22 this file
- [x] commit — evidence: d7db3cb
- [x] review — evidence: 596b31e (commit that recorded the Review section; code-review not run, small hook fix covered by the new tests and gate:push, findings: none)
- [ ] close-out — evidence:
- [x] gate-push — evidence: 2026-10-22 pnpm gate:push exit 0 on 596b31e: eslint 0 errors, 26 test files / 609 tests passed, nuxt build complete, playwright 5 passed (14.4s)
- [ ] push-pr — evidence:

## Done (verified)

- `.claude/hooks/require-contract.py`: new `merge_head(tip)` (only when the tip is `HEAD`, i.e. commit time); `step_commit` accepts
  a sha that is an ancestor of `HEAD` or of `MERGE_HEAD`; `stale_review_problem` uses `MERGE_HEAD` as the tip for a review commit that
  is not an ancestor of `HEAD` but is one of `MERGE_HEAD`. Push gate and CI (explicit sha tips) untouched.
- `tests/arch/require-contract-hook.spec.ts`: describe "a merge in progress takes evidence from both sides of the merge" builds a real
  merge (conflicting backlog edits, resolved and staged, `MERGE_HEAD` present) with an archive that arrives from the other side.
- `tests/arch/workflow-steps.spec.ts`: strengthened "decision 057 and ai-workflow catalog exist" (amendment heading, `MERGE_HEAD`,
  catalog sentence).
- Decision 057 amendment 2026-10-22; catalog `ai-workflow.md` evidence-validation bullet; backlog row `merge-evidence-fix`.

## In progress / not done

- Push and PR (needs the user's permission for that push); PRs #24 and #25 can absorb `main` once this is merged.
- Known limit, unchanged: a merge that closes a task folder from the other side and also brings code outside `.claude/` is still refused
  by the Rule 10 docs-only check (closing commits are not exempt). Not part of this fix.

## Subagents (rule 12)

| Subagent           | What it did                                                         | Result                        |
| ------------------ | ------------------------------------------------------------------- | ----------------------------- |
| merge-evidence-fix | hook change, tests, decision 057 amendment, catalog, handoff, close | criteria 1-4 done, gate green |

## Validation (actual output of the last gate)

```
pnpm gate on d7db3cb → format ok, eslint 0 errors (1 pre-existing warning: CustomInput modelValue), typecheck ok,
vitest: Test Files 26 passed (26), Tests 609 passed (609)
```

Not covered: the real Claude-hook path during a merge in the author's own repo (the tests run the hook as a Claude hook and as
`--commit` against throwaway repos); octopus merges (only the first `MERGE_HEAD` line is used).

## Review (workflow step `review`, rule 09)

Review checklist (`.claude/templates/review-checklist.md`) run over the full branch diff (hook, two arch specs, decision 057,
catalog, backlog, task files):

- [x] Secrets (01), company (02), Giphy boundary (03), PII (04), i18n (05): n/a, no app, server or locale change; no external source.
- [x] Branch (06): on `feat/merge-evidence-fix`. Catalog (07): `ai-workflow.md` updated. Gates (09): `pnpm gate` green in the commit. Contract (10): criteria 1-4 each map to a test. Decisions (11): 057 amended, no conflict left open.
- [x] CSS (08), primitives (026, 038), living docs components (027), accessibility, UI consistency (16): n/a, no UI change. Subagents (12): the table above.

code-review: not run for this small hook fix; it is covered by the new tests in `tests/arch/require-contract-hook.spec.ts`
and `pnpm gate:push`. 2026-10-22, round 1, no effort level.

- findings: none

## Pending on the user

| #   | What                                                                        | Blocks     | Status  |
| --- | --------------------------------------------------------------------------- | ---------- | ------- |
| 1   | Permission to push `feat/merge-evidence-fix` and open the PR; then merge it | PRs 24, 25 | pending |

## Decisions made in this task

- → `.claude/docs/decisions/057-close-out-before-single-push.md` (amendment 2026-10-22)
