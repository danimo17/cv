# Close checklist: push-review-gate

Every box must be checked (`- [x]`) before `.claude/tasks/closed/<slug>.md` can be staged with this content —
the commit that closes the task is blocked by `require-contract.py` otherwise (task-close-gate).

- [x] Every acceptance criterion in `contract.md` is verified done, one by one (list them if it helps) — all 8
      criteria done, verified via a 6-case sandbox transcript plus a high-effort `/code-review` pass (5
      subagents, 8 angles, 10 findings, 3 real bugs fixed before merge)
- [x] `pnpm gate:push` real output confirmed green — the actual log tail, not a task-notification's reported
      exit code — confirmed before push (289/289 tests, build, 6/6 e2e)
- [x] PR merged into `main` (link + merge commit SHA) — [PR #12](https://github.com/danimo17/cv/pull/12),
      merge commit `307732784729e797186e484f8e3d038a9eaff295`
- [x] Post-merge deploy verified green (decision 042): `gh run list --workflow deploy.yml` shows `success` for
      this merge's commit — run `36241524943`, conclusion `success`
- [x] Every decision made during this task is written to `.claude/docs/decisions/` — 054 (push-review-gate),
      confirmed present
- [x] Every new/changed component, store, composable, token, or class is documented in
      `.claude/docs/catalog/` — n/a, pure hook/process change; documented in
      `.claude/docs/catalog/ai-workflow.md` instead (rule 07's correct area for hooks), confirmed updated
- [x] Every relevant standard (`.claude/docs/standards/`) updated if a convention changed — n/a, this is a
      `.claude/hooks/`/`.claude/rules/`/`workflow.md` change, not an app-code standard
- [x] No flagged/unresolved rule-11 conflict left open (check the handoff's "Pending on the user") — the one
      pending item (composable-store-regions needing a handoff.md) was tracked and resolved separately, not
      left open
- [x] `.claude/backlog.md` row for this task set to `done` with a pointer to the PR/merge commit

## Note on this task's own close (2026-09-26)

This task's close required its own separate PR (#11 chore/close-task-close-gate pattern repeated) — exactly
the two-PR problem the user flagged right after this closing commit was drafted. Root cause: the close-
checklist requires "PR merged" and "deploy verified" evidence that can't exist until AFTER the feature PR
already merged, forcing close-out into a second, later PR every time. Fix queued in
`.claude/tasks/close-workflow-redesign/story.md` — not applied retroactively here, this closure follows the
process as it existed when the work was done.
