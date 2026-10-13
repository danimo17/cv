# Close checklist: close-workflow-redesign

Closed on the feature branch `feat/close-workflow-redesign` before the single push (decision 057), on 2026-10-13, as
the last commit of the branch. This is the second close of the task: the first close, `aee06c5`, was reverted by
`8c03345` (task folder and `ACTIVE` restored) to add the audit fix (contract criteria 35-36, decision 058, commits
`7fccc18`, `faa5f7c`, `62fb72e`, `c2e4615`). Verified on the tree of `afce55e` (the last commit before this one,
whose code tree is identical to `c2e4615`); the last code commits of the branch are `7fccc18` and `62fb72e` (the audit
fix, each with its test in `tests/arch/audit-overrides.spec.ts`), the last code commit of the hook/workflow work is
`562b5cb`, and every commit after `62fb72e` only touches `.claude/`. The merge and the post-merge deploy check are not
archived: the deploy check is reported in chat after merge. The only open line is `push-pr`.

- [x] Every acceptance criterion in `contract.md` is verified done, one by one (36 criteria). `pnpm test:arch` run
      today on `c2e4615`: `Test Files  9 passed (9)`, `Tests  464 passed (464)`; every test title cited below was
      searched for in `tests/` and found (a script over the quoted titles of this list: 0 missing). The criteria and the
      test or commit that proves each:
  - [x] 1. `tests/arch/require-contract-hook.spec.ts` › "blocks a close with no archive even when ACTIVE is already empty"
  - [x] 2. `tests/arch/require-contract-hook.spec.ts` › "close archive: unchecked box blocks, fully checked passes"
  - [x] 3. `tests/arch/workflow-steps.spec.ts` › "close checklist template has only pre-merge-provable items"
  - [x] 4. `tests/arch/require-contract-hook.spec.ts` › "push gate with ACTIVE set: 054 behavior unchanged"
  - [x] 5. `tests/arch/require-contract-hook.spec.ts` › "push gate with ACTIVE empty reads the closed archive"
  - [x] 6. `tests/arch/workflow-steps.spec.ts` › "workflow.md, handoff template and gates table match workflow-steps.json"
  - [x] 7. `tests/arch/require-contract-hook.spec.ts` › "ticking a progress step requires evidence"
  - [x] 8. `tests/arch/require-contract-hook.spec.ts` › "push requires every pre-push step ticked with evidence"
  - [x] 9. `tests/arch/workflow-steps.spec.ts` › "workflow.md orders close-out before push and deploy-check after merge"; rule docs checked in review (`## Review`)
  - [x] 10. `.claude/tasks/closed/spacing-tokens.md` closed through the fixed hook in `35e6a39` (2026-10-05); this task's own archive is this file, committed last and accepted by the same hook (two earlier close attempts were reverted: `ebeb029` by `c1d0785` because the review was not final, and `aee06c5` by `8c03345` to add the audit fix)
  - [x] 11. `tests/arch/docs-sync.spec.ts` (existing) + `tests/arch/workflow-steps.spec.ts` › "decision 057 and ai-workflow catalog exist"
  - [x] 12. `tests/arch/require-contract-hook.spec.ts` › "slug comes from the feat branch name, ACTIVE is ignored on feat branches"
  - [x] 13. `tests/arch/require-contract-hook.spec.ts` › "git pre-push mode gates the pushed ref"; `tests/arch/workflow-steps.spec.ts` › "git hooks and CI call the workflow gate script"
  - [x] 14. `tests/arch/require-contract-hook.spec.ts` › "push gate follows the pushed refspec, not the checked-out branch"
  - [x] 15. `tests/arch/require-contract-hook.spec.ts` › "evidence must be a real commit sha for commit/review/close-out" and "uppercase [X] ticks are parsed"
  - [x] 16. `tests/arch/workflow-steps.spec.ts` › "arch specs have no test-only hook overrides"
  - [x] 17. `tests/arch/require-contract-hook.spec.ts` › "a code commit after the review evidence makes the review stale"
  - [x] 18. `tests/arch/require-contract-hook.spec.ts` › "merge, rebase and revert commits are not blocked by the docs-only rule"
  - [x] 19. `tests/arch/workflow-steps.spec.ts` › "ci runs the base branch copy of the workflow gate"; `--ci ... --base <ref>` case in `tests/arch/require-contract-hook.spec.ts`
  - [x] 20. `tests/arch/require-contract-hook.spec.ts` › "global git options do not hide commit or push from the hook"
  - [x] 21. `tests/arch/require-contract-hook.spec.ts` › "evidence sha is tied to its step"
  - [x] 22. `tests/arch/require-contract-hook.spec.ts` › "unchecked scan ignores fenced code and prose"
  - [x] 23. `tests/arch/workflow-steps.spec.ts` › "hard-rules rows stay short"
  - [x] 24. `tests/arch/workflow-steps.spec.ts` › "workflow.md puts close-out last and documents reopening"
  - [x] 25. `tests/arch/require-contract-hook.spec.ts` › "review evidence must be a commit that changed the Review section"
  - [x] 26. `tests/arch/require-contract-hook.spec.ts` › "merging main after the review does not make it stale" (and the existing stale cases still pass)
  - [x] 27. `tests/arch/require-contract-hook.spec.ts` › "edits to the gate itself make the review stale"
  - [x] 28. `tests/arch/require-contract-hook.spec.ts` › "core.hooksPath override is refused like --no-verify"
  - [x] 29. `tests/arch/workflow-steps.spec.ts` › "ci falls back unless the base copy supports --ci and --base"
  - [x] 30. `tests/arch/require-contract-hook.spec.ts` › "unchecked scan covers every list marker"
  - [x] 31. `tests/arch/require-contract-hook.spec.ts` › "a later code commit with a test does not stale the review, without a test it does" and "after a recorded review a code commit without a test is blocked at commit time"
  - [x] 32. `tests/arch/require-contract-hook.spec.ts` › "review findings must cite proof: a strengthened test, a new test after a real search, a backlog slug or a reason"; `tests/arch/no-duplicate-test-titles.spec.ts` › "no spec file repeats a test title"
  - [x] 33. search first: the cases sit next to their siblings in `tests/arch/require-contract-hook.spec.ts` — "core.hooksPath override is refused like --no-verify" (config/env cases), "commit rules that predate decision 057 still hold" (`-nm`/`-anm`), "global git options do not hide commit or push from the hook" (env prefix with digits), "a code commit after the review evidence makes the review stale" (freshness fails closed)
  - [x] 34. `tests/arch/workflow-steps.spec.ts` › "workflow.md states the review convergence policy"
  - [x] 35. `pnpm audit --audit-level=high` run today on `c2e4615`: `3 vulnerabilities found`, `Severity: 1 low | 2 high (2 ignored)`, exit code 0 (commits `7fccc18` and `62fb72e`: five new `overrides`, eight in total with the three of decision 056, and the `@nuxt/devtools@3.4.2` patch, no new ignore; the two ignores are those of decision 056); `tests/arch/audit-overrides.spec.ts` › "every audit override has a patched floor and every ignored advisory is documented", plus "the lockfile resolves simple-git only at or above the 4.0.1 advisory fix", "every patched dependency has an existing patch file that still matches the locked version" and "every patched dependency is documented in a decision with a remove-when condition"
  - [x] 36. `tests/arch/audit-overrides.spec.ts` › "every ignored advisory is documented in a decision"
- [x] `pnpm gate:push` real output confirmed green, read from the actual log (not a task-notification exit code),
      run today on `c2e4615` (the code tree is identical on `afce55e`): `All matched files use Prettier code style!`,
      lint `1 problem (0 errors, 1 warning)` (the pre-existing `vue/require-default-prop` in `CustomInput.vue`),
      typecheck ok, `Test Files  25 passed (25)`, `Tests  598 passed (598)`, nuxt build `Build complete!`, e2e
      `5 passed (11.9s)`, final `EXIT=0`. The pre-commit run of `afce55e` repeated gate: `Test Files  25 passed (25)`,
      `Tests  598 passed (598)`.
- [x] `/code-review` ran over the whole branch diff: `code-review` at high effort, user-run, 2026-10-05 (round 0) and
      three times on 2026-10-06 (rounds 1 to 3; round 3 is the final one: 6 findings, 3 fixed with new tests, 2
      behavior-preserving refactors with no test that can fail first, 1 queued to `workflow-integrity-hardening` item
      8); every finding line is in `## Review` below and is checked by the gate. The audit fix (criteria 35-36,
      commits `7fccc18` and `62fb72e`) came after round 3 and was NOT reviewed by a new `/code-review` round (policy:
      at most two rounds per task): it is dependency and config work plus one arch test and docs, covered by
      `pnpm audit --audit-level=high` exit 0 (run locally; the CI `audit` job has not run on it yet),
      `tests/arch/audit-overrides.spec.ts` and `pnpm gate:push`, and it carries its test so the recorded review does
      not go stale (`require-contract.py --pre-push` smoke on `afce55e`: exit 0). The devtools UI git panel was not
      exercised in a browser (rule 17).
- [x] Every decision made during this task is written to `.claude/docs/decisions/`:
      `057-close-out-before-single-push.md` with its four amendments (2026-10-05; 2026-10-06; 2026-10-06 second review;
      2026-10-06 third review: findings become tests, search first), `058-audit-overrides-2026-10-13.md` (the five
      new audit overrides and the `@nuxt/devtools@3.4.2` patch, with their remove-when conditions), plus the "Superseded
      in part by 057" notes on `042-verify-deploy-after-merge.md` and
      `051-close-gate-checks-closing-before-disk-contract.md`.
- [x] Every new/changed component, store, composable, token, or class is documented in
      `.claude/docs/catalog/`: no component, store, composable, token or class was created or changed; the script,
      gates, hook behavior and workflow are in `.claude/docs/catalog/ai-workflow.md` (258 lines added and 18 removed on
      this branch, including the `audit-overrides` arch test and the devtools patch; `tests/arch/docs-sync.spec.ts` is
      green in the 464 arch tests above).
- [x] Every relevant standard (`.claude/docs/standards/`) updated if a convention changed: no code convention changed
      (no standard touched); the process conventions are in `.claude/workflow.md` (steps and `## Review policy`),
      `.claude/rules/09-gates.md`, `.claude/rules/10-contract-first.md`, `.claude/hard-rules.md` rows 09/10,
      `.claude/templates/{close-checklist,handoff}.md`, `.claude/workflow-steps.json` and `CLAUDE.md`. The audit fix adds
      `patches/@nuxt__devtools@3.4.2.patch` (documented in decision 058, not a code convention).
- [x] No flagged/unresolved rule-11 conflict left open: the handoff's pending list holds only the permission for the
      single push (rule 06) (the `simple-git` question, row 6, was decided by the user: real fix, no ignore, decision 058), the ruleset change for the `workflow-gate` check and two informational items; the
      deliberate-evasion finding of round 3 (`r3-6`) was queued by the user's decision of 2026-10-06, not left as an
      open question.
- [x] `.claude/backlog.md` row for this task set to `done`, pointer to the branch `feat/close-workflow-redesign` and
      this archive (the PR does not exist yet; no PR number is claimed).

## Review

Status: the final review of the diff is round 3 below, the user-run `/code-review` at high effort of 2026-10-06
(six findings, every one with its outcome and proof line). It is recorded by the commit that last changed this
section (criterion 25); no code change was made after it. Rounds 0-3 are the reviews run on this branch: round 3 is
the last full review under the new policy (workflow.md `## Review policy`: a finding becomes a test, search first,
at most two rounds per task, the second only the delta). The close-out follows it as the last commit before the
push.

- [x] review-checklist (`.claude/templates/review-checklist.md`) run over the full branch diff on 2026-10-05 (28 files); the changes since are the hook, its specs and `.claude/` docs
- [x] `code-review` ran at high effort on 2026-10-05 and three times on 2026-10-06 (rounds 0 to 3 below); every finding has its outcome and proof, checked by the gate

Proof format (decision 057, third amendment): all the spec files cited below were created on this branch, so the
base ref (`origin/main`) has no earlier test to strengthen and every `fixed` proof is a `new` test; where the
search finds sibling tests of the same gate, the `differs` reason says why. The three findings whose fix is not a
new test are explained in their line (`no_change_needed` for behavior-preserving refactors, `queued` for the
deliberate-evasion finding).

### Round 0 — first `/code-review` at high effort, 2026-10-05 (criteria 12-16)

- finding r0-1 — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › slug comes from the feat branch name, ACTIVE is ignored on feat branches — searched: ACTIVE, slug, branch name — differs: the spec file does not exist at the base (created on this branch), so no earlier test can be strengthened; the matches are siblings of the same gate
- finding r0-2 — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › git pre-push mode gates the pushed ref — searched: pre-push, pushed ref — differs: the spec file does not exist at the base (created on this branch), so no earlier test can be strengthened; the matches are siblings of the same gate
- finding r0-3 — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › evidence must be a real commit sha for commit/review/close-out — searched: real commit sha, evidence — differs: the spec file does not exist at the base (created on this branch), so no earlier test can be strengthened; the matches are siblings of the same gate
- finding r0-4 — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › push gate follows the pushed refspec, not the checked-out branch — searched: refspec, checked-out — differs: the spec file does not exist at the base (created on this branch), so no earlier test can be strengthened; the matches are siblings of the same gate
- finding r0-5 — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › uppercase [X] ticks are parsed — searched: uppercase, ticks — differs: the spec file does not exist at the base (created on this branch), so no earlier test can be strengthened; the matches are siblings of the same gate
- finding r0-6 — outcome: fixed — proof: new tests/arch/workflow-steps.spec.ts › arch specs have no test-only hook overrides — searched: HOOK_UNDER_TEST, hook overrides

### Round 1 — user full-branch `/code-review` at high effort, 2026-10-06 (criteria 17-24)

- finding r1-1 — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › a code commit after the review evidence makes the review stale — searched: stale, review evidence — differs: the spec file does not exist at the base (created on this branch), so no earlier test can be strengthened; the matches are siblings of the same gate
- finding r1-2 — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › merge, rebase and revert commits are not blocked by the docs-only rule — searched: merge, rebase, revert — differs: the spec file does not exist at the base (created on this branch), so no earlier test can be strengthened; the matches are siblings of the same gate
- finding r1-3 — outcome: fixed — proof: new tests/arch/workflow-steps.spec.ts › ci runs the base branch copy of the workflow gate — searched: base branch copy, workflow gate — differs: the spec file does not exist at the base (created on this branch), so no earlier test can be strengthened; the matches are siblings of the same gate
- finding r1-4 — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › global git options do not hide commit or push from the hook — searched: global git options — differs: the spec file does not exist at the base (created on this branch), so no earlier test can be strengthened; the matches are siblings of the same gate
- finding r1-5 — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › unchecked scan ignores fenced code and prose — searched: fenced, prose, unchecked scan — differs: the spec file does not exist at the base (created on this branch), so no earlier test can be strengthened; the matches are siblings of the same gate
- finding r1-6 — outcome: fixed — proof: new tests/arch/workflow-steps.spec.ts › hard-rules rows stay short — searched: hard-rules

### Round 2 — user second `/code-review` at high effort, 2026-10-06 (criteria 25-30)

- finding r2-1 — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › review evidence must be a commit that changed the Review section — searched: Review section, review evidence — differs: the spec file does not exist at the base (created on this branch), so no earlier test can be strengthened; the matches are siblings of the same gate
- finding r2-2 — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › merging main after the review does not make it stale — searched: merging main — differs: the spec file does not exist at the base (created on this branch), so no earlier test can be strengthened; the matches are siblings of the same gate
- finding r2-3 — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › edits to the gate itself make the review stale — searched: gate itself — differs: the spec file does not exist at the base (created on this branch), so no earlier test can be strengthened; the matches are siblings of the same gate
- finding r2-4 — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › core.hooksPath override is refused like --no-verify — searched: hooksPath, no-verify — differs: the spec file does not exist at the base (created on this branch), so no earlier test can be strengthened; the matches are siblings of the same gate
- finding r2-5 — outcome: fixed — proof: new tests/arch/workflow-steps.spec.ts › ci falls back unless the base copy supports --ci and --base — searched: falls back, base copy — differs: the spec file does not exist at the base (created on this branch), so no earlier test can be strengthened; the matches are siblings of the same gate
- finding r2-6 — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › unchecked scan covers every list marker — searched: list marker — differs: the spec file does not exist at the base (created on this branch), so no earlier test can be strengthened; the matches are siblings of the same gate

### Round 3 — user third `/code-review` at high effort, 2026-10-06 (criteria 31-34); the last full review under the new policy

- finding r3-1 — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › a chained git config write or GIT_CONFIG_KEY env prefix is refused too: %s — searched: chained git config, GIT_CONFIG_KEY — differs: the spec file does not exist at the base (created on this branch), so no earlier test can be strengthened; the matches are siblings of the same gate
- finding r3-2 — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › --no-verify and -n are blocked, also as a short-flag cluster (-nm, -anm, -sn, a trailing -n) — searched: short-flag cluster, -nm — differs: the spec file does not exist at the base (created on this branch), so no earlier test can be strengthened; the matches are siblings of the same gate
- finding r3-3 — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › freshness fails closed when git diff errors: two unreadable diffs are not "equal" — searched: fails closed, git diff errors — differs: the spec file does not exist at the base (created on this branch), so no earlier test can be strengthened; the matches are siblings of the same gate
- finding r3-4 — outcome: no_change_needed — proof: the three names for the comparison ref (`steps_ref`, `base`, `base_ref`) were unified to `base_ref`/`resolve_base`; a behavior-preserving rename has no test that can fail before and pass after, the behavior stays covered by `--ci --base reads the step list from the base ref` and `a later code commit with a test does not stale the review, without a test it does` (both green)
- finding r3-5 — outcome: no_change_needed — proof: the two commit walks for the first later code commit were merged into one helper (`code_changes_after`); behavior-preserving refactor, covered by `a code commit after the review evidence makes the review stale` and `merging main after the review does not make it stale` (both green)
- finding r3-6 — outcome: queued — proof: workflow-integrity-hardening item 8 (editing the `## Review` text after later code changes resets freshness; residual risk accepted by the user decision 2026-10-06, mitigated by the test requirement and the finding proof)

Counting note: the earlier prose history named the 2026-10-05 review as the "first" and the two 2026-10-06 user
reviews as the "full-branch" and "second" ones; with today's they are rounds 0, 1, 2 and 3.

## Workflow progress

One line per `pre-push` step of `.claude/workflow-steps.json`, in order. Tick a step only when it is really
done: `- [x] <id> — evidence: <commit sha / gate output line / date>`. Evidence is mandatory once ticked
(blocked at commit time otherwise). `push-pr` is ticked last, after the push and the PR exist; the post-merge
steps (`merge`, `deploy-check`) are not listed here.

- [x] story — evidence: 203496b (story.md, ACTIVE, backlog `doing`)
- [x] contract — evidence: 203496b (contract.md with 11 Given/When/Then criteria at that commit; criteria 12-16 added in 0b2b180, 17-24 in 7f0ceea)
- [x] build — evidence: 73871d8 (workflow docs slice) + b206a86 (hook rewrite + hook spec) + 15908bf (gate-everywhere) + 959bb0c and 6c2bd7f (review-fixes: criteria 17-24) + 49ba305 and d196717 (review-fixes-2: criteria 25-30) + 7fccc18 and 62fb72e (audit fix: criteria 35-36, decision 058)
- [x] consolidate — evidence: pnpm gate (first stage of the gate:push run on c2e4615, 2026-10-13, real log read): format check ok, lint 0 errors (1 warning), typecheck ok, Test Files 25 passed (25), Tests 598 passed (598)
- [x] validate — evidence: audit fix checked red first (tests/arch/audit-overrides.spec.ts failed before the lockfile, the decision and the patch existed, plus mutation checks), then green on c2e4615 with `pnpm audit --audit-level=high` exit 0 ("3 vulnerabilities found, Severity: 1 low | 2 high (2 ignored)") and `pnpm test:arch` Test Files 9 passed (9), Tests 464 passed (464); earlier slices (review-fixes-2: hook spec 32 failed then 232 passed) and the old-hook comparison are in Validation
- [x] handoff — evidence: c2e4615 (the last commit before this progress update that touched this file: scope addition for the audit fix and the simple-git note; the Review section is unchanged since cbde39a)
- [x] commit — evidence: c2e4615 (last commit of the branch before this progress update; the last code commits are 7fccc18 and 62fb72e, the audit fix, each carrying its test in tests/arch/audit-overrides.spec.ts)
- [x] review — evidence: cbde39a (the commit that last changed the `## Review` section: round 3, the user-run `/code-review` at high effort of 2026-10-06, six findings each with outcome and proof; no code change after it)
- [x] close-out — evidence: 35e6a39 (spacing-tokens, the first close made through the fixed hook, 2026-10-05); this task's own close commit is the last commit of the branch and cannot cite itself, its archive is `.claude/tasks/closed/close-workflow-redesign.md`; a first close, aee06c5, was reverted by 8c03345 to add the audit fix
- [x] gate-push — evidence: pnpm gate:push on c2e4615 (2026-10-13, real log read, EXIT=0): Test Files 25 passed (25), Tests 598 passed (598), nuxt build "Build complete!", e2e 5 passed (11.9s)
- [ ] push-pr — evidence:
