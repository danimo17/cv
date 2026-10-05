# Close checklist: <slug>

Every box must be checked (`- [x]`) before `.claude/tasks/closed/<slug>.md` can be staged with this content —
the commit that closes the task is blocked by `require-contract.py` otherwise (task-close-gate). The close-out
happens on the feature branch, before the single push (decision 057), so every item here must be provable
**before** the PR is merged. The merge and the post-merge deploy check are not archived: the deploy check is
reported in chat after merge, and a failed deploy opens a new task.

The only line allowed to stay unticked in this file is `push-pr` inside `## Workflow progress` (it is ticked
after the push, which comes after this commit).

- [ ] Every acceptance criterion in `contract.md` is verified done, one by one (list them if it helps)
- [ ] `pnpm gate:push` real output confirmed green — the actual log tail, not a task-notification's reported
      exit code (that wrapper misreported once; always check the real log)
- [ ] `/code-review` ran over the whole branch diff: `code-review` effort level and date noted in `## Review`
      below
- [ ] Every decision made during this task is written to `.claude/docs/decisions/`
- [ ] Every new/changed component, store, composable, token, or class is documented in
      `.claude/docs/catalog/`
- [ ] Every relevant standard (`.claude/docs/standards/`) updated if a convention changed
- [ ] No flagged/unresolved rule-11 conflict left open (check the handoff's "Pending on the user")
- [ ] `.claude/backlog.md` row for this task set to `done`

## Review

Paste the handoff's `## Review` section here (checklist fully checked, `/code-review` effort level, date and
the outcome of each finding). It must mention `code-review`: the push gate reads it from this archive.

- [ ] …

## Workflow progress

Paste the handoff's `## Workflow progress` block here, ticked with evidence for every step before `push-pr`
(same line format as `.claude/templates/handoff.md`).

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
