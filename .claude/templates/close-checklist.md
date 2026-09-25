# Close checklist: <slug>

Every box must be checked (`- [x]`) before `.claude/tasks/closed/<slug>.md` can be staged with this content —
the commit that closes the task is blocked by `require-contract.py` otherwise (task-close-gate).

- [ ] Every acceptance criterion in `contract.md` is verified done, one by one (list them if it helps)
- [ ] `pnpm gate:push` real output confirmed green — the actual log tail, not a task-notification's reported
      exit code (that wrapper misreported once this session; always check the real log)
- [ ] PR merged into `main` (link + merge commit SHA)
- [ ] Post-merge deploy verified green (decision 042): `gh run list --workflow deploy.yml` shows `success`
      for this merge's commit
- [ ] Every decision made during this task is written to `.claude/docs/decisions/`
- [ ] Every new/changed component, store, composable, token, or class is documented in
      `.claude/docs/catalog/`
- [ ] Every relevant standard (`.claude/docs/standards/`) updated if a convention changed
- [ ] No flagged/unresolved rule-11 conflict left open (check the handoff's "Pending on the user")
- [ ] `.claude/backlog.md` row for this task set to `done` with a pointer to the PR/merge commit
