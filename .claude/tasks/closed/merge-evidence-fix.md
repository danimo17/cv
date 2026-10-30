# Close checklist: merge-evidence-fix

Every box must be checked (`- [x]`) before `.claude/tasks/closed/merge-evidence-fix.md` can be staged with this content —
the commit that closes the task is blocked by `require-contract.py` otherwise (task-close-gate). The close-out
happens on the feature branch, before the single push (decision 057), so every item here must be provable
**before** the PR is merged. The merge and the post-merge deploy check are not archived: the deploy check is
reported in chat after merge, and a failed deploy opens a new task.

The only line allowed to stay unticked in this file is `push-pr` inside `## Workflow progress` (it is ticked
after the push, which comes after this commit).

This commit is the last commit before the push: take it only after the final review of the full diff (a
user-run `/code-review` included) and its fixes. A code change of the branch after the review (outside
`.claude/`, or in `.claude/hooks/` or `.claude/workflow-steps.json`; a merge of `main` does not count) makes the
review stale and the gates block (`/code-review high`, then re-record). To reopen after a later finding: `git revert <close-out sha>`
restores the task folder and removes this archive; fix, re-review, close again.

- [x] Every acceptance criterion in `contract.md` is verified done, one by one: (1) a real conflicted merge in a throwaway repo with an archive arriving from the other side commits (`tests/arch/require-contract-hook.spec.ts` › "a merge commit accepts evidence shas that are ancestors of MERGE_HEAD"); (2) the same archive staged with no merge is still rejected (› "the same archive staged with no merge in progress is rejected as outside the history of HEAD", plus the existing "a commit outside the history of the tip is rejected"); (3) a sha that is an ancestor of neither side is still rejected (› "a merge commit still rejects an evidence sha that is an ancestor of neither side"); (4) decision 057 amendment 2026-10-22 and the catalog sentence asserted in `tests/arch/workflow-steps.spec.ts` › "decision 057 and ai-workflow catalog exist". Freshness: two more tests cover the stale tip (no false stale for the incoming archive, true stale still blocked).
- [x] `pnpm gate:push` real output confirmed green from the log file, not a task notification: eslint 0 errors, 26 test files / 609 tests passed, "Build complete!", playwright "5 passed (14.4s)", exit=0 (2026-10-22, on 596b31e; later commits only touch `.claude/`).
- [x] `/code-review` ran over the whole branch diff: NOT run for this small hook fix (`code-review: not run`, stated in `## Review`); covered by the new tests and `gate:push`.
- [x] Every decision made during this task is written to `.claude/docs/decisions/`: amendment 2026-10-22 (merge-aware ancestry) in `057-close-out-before-single-push.md`.
- [x] Every new/changed component, store, composable, token, or class is documented in `.claude/docs/catalog/`: none changed besides `ai-workflow.md` (evidence-validation bullet).
- [x] Every relevant standard (`.claude/docs/standards/`) updated if a convention changed: no convention changed.
- [x] No flagged/unresolved rule-11 conflict left open: none; the known limit (Rule 10 docs-only check on a closing merge that also brings code) is noted in the handoff and the decision, outside this fix.
- [x] `.claude/backlog.md` row for this task set to `done`.

## Review (workflow step `review`, rule 09)

Review checklist (`.claude/templates/review-checklist.md`) run over the full branch diff (hook, two arch specs, decision 057,
catalog, backlog, task files):

- [x] Secrets (01), company (02), Giphy boundary (03), PII (04), i18n (05): n/a, no app, server or locale change; no external source.
- [x] Branch (06): on `feat/merge-evidence-fix`. Catalog (07): `ai-workflow.md` updated. Gates (09): `pnpm gate` green in the commit. Contract (10): criteria 1-4 each map to a test. Decisions (11): 057 amended, no conflict left open.
- [x] CSS (08), primitives (026, 038), living docs components (027), accessibility, UI consistency (16): n/a, no UI change. Subagents (12): the table above.

code-review: not run for this small hook fix; it is covered by the new tests in `tests/arch/require-contract-hook.spec.ts`
and `pnpm gate:push`. 2026-10-22, round 1, no effort level.

- findings: none

## Workflow progress

Pasted from the handoff, ticked with evidence for every step before `push-pr`.

- [x] story — evidence: 2473fd2 (story.md, backlog row)
- [x] contract — evidence: 2473fd2 (contract.md, criteria 1-4)
- [x] build — evidence: d7db3cb (hook change, 5 new tests, decision 057 amendment, catalog line)
- [x] consolidate — evidence: pnpm gate green on d7db3cb (26 test files, 609 tests passed, 0 lint errors, typecheck clean)
- [x] validate — evidence: 2026-10-22 the new tests failed before the hook change (3 of 5 red) and pass after it; the stale-tip hunk was reverted once to confirm two tests depend on it
- [x] handoff — evidence: 2026-10-22 this file
- [x] commit — evidence: d7db3cb
- [x] review — evidence: 596b31e (commit that recorded the Review section; code-review not run, small hook fix covered by the new tests and gate:push, findings: none)
- [x] close-out — evidence: 8c5aa63 (last commit before the close-out; the close-out commit itself archives this file, deletes the task folder and marks the backlog row done)
- [x] gate-push — evidence: 2026-10-22 pnpm gate:push exit 0 on 596b31e: eslint 0 errors, 26 test files / 609 tests passed, nuxt build complete, playwright 5 passed (14.4s)
- [ ] push-pr — evidence:
