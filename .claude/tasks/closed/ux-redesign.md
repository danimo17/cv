# Close checklist: ux-redesign

Every box must be checked (`- [x]`) before `.claude/tasks/closed/<slug>.md` can be staged with this content —
the commit that closes the task is blocked by `require-contract.py` otherwise (task-close-gate).

- [x] Every acceptance criterion in `contract.md` is verified done, one by one (list them if it helps) — all
      17 criteria done (Phase 1 + Phase 2 + this session's follow-up fixes: stale e2e test, half-applied
      timeline fix on the `--compact` variant, dot overflowing horizontal padding, one-off certificate icon,
      first-person meme copy, recent-searches placement, project-wide button cursor)
- [x] `pnpm gate:push` real output confirmed green — the actual log tail, not a task-notification's reported
      exit code (that wrapper misreported once this session; always check the real log) — verified twice with
      real exit codes read from the log file directly (`/tmp/gp_final2.log`: 289/289 unit tests, build
      succeeded, 5/5 e2e passed)
- [x] PR merged into `main` (link + merge commit SHA) — [PR #9](https://github.com/danimo17/cv/pull/9),
      merge commit `dd87dc0`
- [x] Post-merge deploy verified green (decision 042): `gh run list --workflow deploy.yml` shows `success`
      for this merge's commit — run `36140016010`, conclusion `success`
- [x] Every decision made during this task is written to `.claude/docs/decisions/` — 043
      (locale-switcher-dropdown), 044 (header-active-nav-raised), both confirmed present
- [x] Every new/changed component, store, composable, token, or class is documented in
      `.claude/docs/catalog/` — `components.md` and `styles.md` updated throughout (including this session's
      `.experience-item`, `.education-section`, `.custom-button`, `EducationSection` entries)
- [x] Every relevant standard (`.claude/docs/standards/`) updated if a convention changed —
      `docs/standards/styling.md` updated (active-nav exception, no stale locale-switcher mention), confirmed
      via direct grep before closing
- [x] No flagged/unresolved rule-11 conflict left open (check the handoff's "Pending on the user") — the one
      flagged conflict (`header-nav`'s active-state override) resolved via decision 044; handoff's "Pending on
      the user" section is empty
- [x] `.claude/backlog.md` row for this task set to `done` with a pointer to the PR/merge commit
