# Close checklist: composable-store-regions

Every box must be checked (`- [x]`) before `.claude/tasks/closed/<slug>.md` can be staged with this content —
the commit that closes the task is blocked by `require-contract.py` otherwise (task-close-gate).

- [x] Every acceptance criterion in `contract.md` is verified done, one by one (list them if it helps) — all 4
      criteria done: rule 14 exception for `// #region` markers, `docs/standards/state.md` region order
      documented, `giphy.ts`/`hero.ts` retrofitted, `useMessageList.ts` correctly carries no regions
- [x] `pnpm gate:push` real output confirmed green — the actual log tail, not a task-notification's reported
      exit code — confirmed twice (before push, and after merging main to resolve PR #13's conflicts): 289/289
      unit tests, build succeeded, 6/6 e2e passed
- [x] PR merged into `main` (link + merge commit SHA) — [PR #13](https://github.com/danimo17/cv/pull/13),
      merge commit `115e2bef2e5cc3c72a6f34baf337a25f8460d51e`
- [x] Post-merge deploy verified green (decision 042): `gh run list --workflow deploy.yml` shows `success` for
      this merge's commit — run `36241548634` (or `36241524943`), conclusion `success`
- [x] Every decision made during this task is written to `.claude/docs/decisions/` — 052
      (composable-store-regions), confirmed present
- [x] Every new/changed component, store, composable, token, or class is documented in
      `.claude/docs/catalog/` — n/a, regions are internal organization, not part of either store's public
      surface (confirmed in the task's own handoff Review section)
- [x] Every relevant standard (`.claude/docs/standards/`) updated if a convention changed —
      `docs/standards/state.md` updated with the exact region order
- [x] No flagged/unresolved rule-11 conflict left open (check the handoff's "Pending on the user") — none
- [x] `.claude/backlog.md` row for this task set to `done` with a pointer to the PR/merge commit
