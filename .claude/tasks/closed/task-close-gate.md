# Close checklist: task-close-gate

Every box must be checked (`- [x]`) before `.claude/tasks/closed/<slug>.md` can be staged with this content —
the commit that closes the task is blocked by `require-contract.py` otherwise (task-close-gate).

- [x] Every acceptance criterion in `contract.md` is verified done, one by one (list them if it helps) — all 6
      criteria done: empty-ACTIVE docs-only commits allowed (1), empty-ACTIVE + code blocked (2), closing
      commit requires a fully-checked archive (3), `close-checklist.md` template written matching spec (4),
      `hard-rules.md`/`rules/10-contract-first.md` updated (5), `workflow.md` step 13 rewritten (6) — verified
      via a 5-case manual sandbox test transcript (empty-ACTIVE docs-only → exit 0; empty-ACTIVE+app file →
      exit 2; closing without archive → exit 2; closing with 1 unchecked box, named → exit 2; closing fully
      checked → exit 0) plus 2 regression checks (normal contract commit, decision-worthy config commit) both
      unchanged
- [x] `pnpm gate:push` real output confirmed green — the actual log tail, not a task-notification's reported
      exit code — confirmed before push (289 tests, build, 5/5 e2e)
- [x] PR merged into `main` (link + merge commit SHA) — [PR #10](https://github.com/danimo17/cv/pull/10),
      merge commit `3c523258bce0979f0e9b480adc46c0bba231f793`
- [x] Post-merge deploy verified green (decision 042): `gh run list --workflow deploy.yml` shows `success`
      for this merge's commit — run `36151789194`, conclusion `success`
- [x] Every decision made during this task is written to `.claude/docs/decisions/` — 051
      (close-gate-checks-closing-before-disk-contract), confirmed present
- [x] Every new/changed component, store, composable, token, or class is documented in
      `.claude/docs/catalog/` — n/a (pure hook/process change, no component/store/token); the hook itself is
      documented in `.claude/docs/catalog/ai-workflow.md` (the correct catalog area for hooks/workflows, rule
      07), confirmed updated
- [x] Every relevant standard (`.claude/docs/standards/`) updated if a convention changed — n/a, this is a
      `.claude/hooks/` + `.claude/rules/` + `.claude/workflow.md` change, not an app-code standard
- [x] No flagged/unresolved rule-11 conflict left open (check the handoff's "Pending on the user") — one
      deviation flagged by the implementing subagent (check-ordering, disk contract vs. closing detection),
      resolved via decision 051, not left open
- [x] `.claude/backlog.md` row for this task set to `done` with a pointer to the PR/merge commit
