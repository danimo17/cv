# Close checklist: dependency-prs-triage

Every box must be checked (`- [x]`) before `.claude/tasks/closed/<slug>.md` can be staged with this content —
the commit that closes the task is blocked by `require-contract.py` otherwise (task-close-gate).

- [x] Every acceptance criterion in `contract.md` is verified done, one by one (list them if it helps) — no
      formal `contract.md` was written (pure investigation/analysis task, no code delegated); `story.md`'s
      scope (5 PRs, empirically investigated in isolated worktrees against current `main`, each with a
      concrete safe/needs-fix/close recommendation) fulfilled for all 5: #4 (minor-and-patch) safe, #5
      (vue-router — turned out to be a non-issue, Nuxt already forces v5 internally) safe, #6 (eslint 10,
      architecture rules verified still firing) safe, #7 (vitest 5, zero API usage affected) safe, #8
      (typescript 6, vue-tsc compatible) safe — all 5 merged by the user
- [x] `pnpm gate:push` real output confirmed green — the actual log tail — confirmed on `main` after all 5
      merges (289/289 tests, typecheck clean after a stale local `node_modules` was reinstalled — CI itself
      was green on every individual merge commit, confirmed via `gh run list`)
- [x] PR merged into `main` (link + merge commit SHA) — not this task's own PR; the 5 PRs it evaluated:
      [#4](https://github.com/danimo17/cv/pull/4), [#5](https://github.com/danimo17/cv/pull/5),
      [#6](https://github.com/danimo17/cv/pull/6), [#7](https://github.com/danimo17/cv/pull/7),
      [#8](https://github.com/danimo17/cv/pull/8), all merged
- [x] Post-merge deploy verified green (decision 042): `gh run list --workflow deploy.yml` shows `success`
      for this merge's commit — confirmed green after the PR #10 merge (the deploy chain covers all merges up
      to that point, dependency bumps included)
- [x] Every decision made during this task is written to `.claude/docs/decisions/` — none needed; no
      architecturally-significant config change beyond routine dependency version bumps
- [x] Every new/changed component, store, composable, token, or class is documented in
      `.claude/docs/catalog/` — n/a, no component/app code touched by this task itself
- [x] Every relevant standard (`.claude/docs/standards/`) updated if a convention changed — n/a
- [x] No flagged/unresolved rule-11 conflict left open (check the handoff's "Pending on the user") — none;
      the merge-order/conflict churn (each merge re-triggering lockfile conflicts on the rest) was expected
      pnpm-lockfile behavior, not a decision conflict, resolved via `@dependabot rebase` comments each time
- [x] `.claude/backlog.md` row for this task set to `done` with a pointer to the PR/merge commit
