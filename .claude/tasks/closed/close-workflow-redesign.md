# Close checklist: close-workflow-redesign

Closed on branch `feat/close-workflow-redesign` before the single push (decision 057), so the one PR carries the
feature and its own closing. Every item below was checked on 2026-10-06 on this branch; the `pnpm gate:push` run
was on `3ade528`, and the commits after it only touch `.claude/` (handoff progress block, this archive, the task
folder deletion, `ACTIVE`, the backlog row), which is why that run stays valid for the close commit.

- [x] Every acceptance criterion in `contract.md` is verified done, one by one. Evidence for 1-9 and 11-16:
      `pnpm exec vitest run tests/arch` run today, `Test Files  7 passed (7)`, `Tests  281 passed (281)`, and the
      named tests below appear as passing lines in the verbose log; `tests/unit` is `16 passed (16)` files,
      `134 passed (134)` tests (281 + 134 = 415, the `pnpm gate` total).
  - [x] 1. `tests/arch/require-contract-hook.spec.ts` › "blocks a close with no archive even when ACTIVE is already empty" passes.
  - [x] 2. `tests/arch/require-contract-hook.spec.ts` › "close archive: unchecked box blocks, fully checked passes" passes.
  - [x] 3. `tests/arch/workflow-steps.spec.ts` › "close checklist template has only pre-merge-provable items" passes.
  - [x] 4. `tests/arch/require-contract-hook.spec.ts` › "push gate with ACTIVE set: 054 behavior unchanged" passes.
  - [x] 5. `tests/arch/require-contract-hook.spec.ts` › "push gate with ACTIVE empty reads the closed archive" passes.
  - [x] 6. `tests/arch/workflow-steps.spec.ts` › "workflow.md, handoff template and gates table match workflow-steps.json" passes.
  - [x] 7. `tests/arch/require-contract-hook.spec.ts` › "ticking a progress step requires evidence" passes.
  - [x] 8. `tests/arch/require-contract-hook.spec.ts` › "push requires every pre-push step ticked with evidence" passes.
  - [x] 9. `tests/arch/workflow-steps.spec.ts` › "workflow.md orders close-out before push and deploy-check after merge" passes; rule docs checked in `## Review`.
  - [x] 10. Dogfooding: `35e6a39` closed `spacing-tokens` through the fixed hook (archive in `closed/`, folder deleted, hook did not block it), and this archive's own close commit is the second one; before committing it, `require-contract.py --commit` was run on the staged index and exited 0, and the commit itself only succeeds if the pre-commit hook (the same script, then `pnpm gate`) passes.
  - [x] 11. `tests/arch/workflow-steps.spec.ts` › "decision 057 and ai-workflow catalog exist" and `tests/arch/docs-sync.spec.ts` pass.
  - [x] 12. `tests/arch/require-contract-hook.spec.ts` › "slug comes from the feat branch name, ACTIVE is ignored on feat branches" passes.
  - [x] 13. `tests/arch/require-contract-hook.spec.ts` › "git pre-push mode gates the pushed ref" and `tests/arch/workflow-steps.spec.ts` › "git hooks and CI call the workflow gate script" pass.
  - [x] 14. `tests/arch/require-contract-hook.spec.ts` › "push gate follows the pushed refspec, not the checked-out branch" passes.
  - [x] 15. `tests/arch/require-contract-hook.spec.ts` › "evidence must be a real commit sha for commit/review/close-out" and "uppercase [X] ticks are parsed" pass.
  - [x] 16. `tests/arch/workflow-steps.spec.ts` › "arch specs have no test-only hook overrides" passes.
- [x] `pnpm gate:push` real output confirmed green, read from the actual log file (not a task-notification exit
      code), run 2026-10-06 on `3ade528`: `All matched files use Prettier code style!`, lint
      `1 problem (0 errors, 1 warning)` (the pre-existing `vue/require-default-prop` in `CustomInput.vue`),
      `Test Files  23 passed (23)`, `Tests  415 passed (415)`, nuxt `Build complete!`, e2e `5 passed (11.5s)`, final `EXIT=0`. The `workflow-gate`
      job of `ci.yml` has not been run: GitHub Actions cannot run locally, its first run is the first `feat/*` PR.
- [x] `/code-review` ran over the whole branch diff: `code-review` at high effort on 2026-10-05, 6 findings, all
      fixed in `15908bf` and `29cbbbd`; the gate-everywhere slice was written after that review and was not
      re-reviewed (stated in `## Review`, user pending 2).
- [x] Every decision made during this task is written to `.claude/docs/decisions/`:
      `057-close-out-before-single-push.md` (with its `Amendment 2026-10-05`) plus the "Superseded in part by 057"
      notes in `042-verify-deploy-after-merge.md` and `051-close-gate-checks-closing-before-disk-contract.md`
      (all three changed in `git diff origin/main...HEAD`).
- [x] Every new/changed component, store, composable, token, or class is documented in
      `.claude/docs/catalog/`: `catalog/ai-workflow.md` documents the hook modes, the step list, the progress
      block and the CI job (changed in this branch; `tests/arch/docs-sync.spec.ts` passes). No component, store,
      composable or token was touched.
- [x] Every relevant standard (`.claude/docs/standards/`) updated if a convention changed: no convention covered by
      the standards changed, and no file under `.claude/docs/standards/` is in `git diff origin/main...HEAD`; the
      workflow conventions live in `workflow.md`, `hard-rules.md` and rules 09/10, which are updated.
- [x] No flagged/unresolved rule-11 conflict left open: the handoff's pending table has the push permission, the
      optional fresh `/code-review`, the ruleset change for `workflow-gate`, and two info rows, none of them an
      unanswered directive conflict.
- [x] `.claude/backlog.md` row for this task set to `done`, pointer to the branch and this archive (no PR number
      yet: the PR does not exist before the push).

## Notes on the evidence

- `close-out` below cites `35e6a39`, the `spacing-tokens` close, because this task's own close commit cannot cite
  its own sha. The sha that closes this task is the commit that adds this file.
- The `spacing-tokens` archive was checked against the repository before this close (all shas it cites resolve,
  `c0955ce` is an ancestor of this branch, PR #16 is `MERGED` as `c0955ce`, `deploy.yml` run `37292348805`
  concluded `success`); its one detail worth knowing is that its `## Review` block says no `code-review` ran after
  `f3eeb38`, which is stated there, not hidden.

## Review

Review checklist (`.claude/templates/review-checklist.md`) run on 2026-10-05 over `git diff origin/main...HEAD`
(after `git fetch origin`): 28 files, +2513/-572, all under `.claude/`, `tests/arch/`, `.githooks/`,
`.github/workflows/ci.yml`, plus one-line changes in `CLAUDE.md` and `README.md`. No file under `app/`, `server/`,
`shared/`, `i18n/`, `public/` or `e2e/` is touched (checked with `git diff --name-only`).

- [x] **Secrets (01):** grep of the added lines for key/token/password assignments and `AKIA`/`ghp_`/`sk-` patterns:
      no match; the only tracked env file is `.env.example`; `tests/arch/secrets.spec.ts` is green in `pnpm gate`.
- [x] **Company (02):** the contract declares no external sources; the diff is own process code (Python hook, arch
      tests, docs). The only `PDPAOLA` string in the added lines is rule 02's own text in `hard-rules.md`.
- [x] **Giphy boundary (03):** n/a, no `app/` or `server/` file in the diff; no `api.giphy.com` in the added lines.
- [x] **PII (04):** n/a, no data, i18n or PDF changed; the only long digit runs in the added lines are GitHub
      Actions run ids, no phone number or postal address.
- [x] **i18n (05):** n/a, no template or locale file in the diff.
- [x] **Branch (06):** `git branch --show-current` is `feat/close-workflow-redesign`; nothing committed to `main`,
      nothing pushed.
- [x] **Catalog (07):** `.claude/docs/catalog/ai-workflow.md` (+159 lines) documents the hook modes, the step list,
      the progress block and the CI job in the same changes; `tests/arch/docs-sync.spec.ts` is green; no
      component, store or composable was touched.
- [x] **CSS (08):** n/a, no component or CSS file in the diff.
- [x] **Gates (09):** `pnpm gate` ran green at every commit through the pre-commit hook (last: `35e6a39`, 23 files,
      415 tests, lint 0 errors); `pnpm gate:push` real log on `0b2b180`: 415 tests, `Build complete!`,
      `5 passed (14.1s)` e2e, `EXIT=0`; the final run is recorded in `## Workflow progress`.
- [x] **Contract (10):** all 16 criteria have a named test or commit; grep confirmed that the 17 test names cited
      in `contract.md` exist verbatim under `tests/arch/`; criterion 10 is the closing commits themselves; the
      `CLAUDE.md`/`README.md` lines only restate criterion 12/13 behavior, nothing in the diff lacks a criterion.
- [x] **Decisions (11):** decision 057 (with its `Amendment 2026-10-05`) plus "Superseded in part by 057" notes in
      042 and 051; no open rule-11 conflict, the only user decision outstanding is in the table below.
- [x] **Primitives (026, 038):** n/a, no template in the diff.
- [x] **Living docs (027):** the catalog was read before changing the hook docs; every mode, step and gate is in
      `ai-workflow.md`; rules 09/10, `hard-rules.md` and `workflow.md` were read and describe the same order
      (close-out before `gate:push`/push, deploy check post-merge and non-blocking), which is also asserted by
      `workflow.md orders close-out before push and deploy-check after merge`.
- [x] **Subagents (12):** the Subagents table names `workflow-docs`, `hook-and-tests`, `gate-everywhere` and
      `closer`.
- [x] **Accessibility:** n/a, no UI.
- [x] **UI pattern consistency (16):** n/a for UI; the one repeated role in this diff is "entry point of the workflow
      gate", checked: `.githooks/pre-commit`, `.githooks/pre-push`, the `workflow-gate` CI job and the Claude hook
      all call `.claude/hooks/require-contract.py`.
- [x] **Rules 13/14/15 (not in the template):** English only; no code comments or lint suppressions added outside
      `.claude/` and `tests/` (grep of the added lines finds `eslint-disable` only as rule 15's own text).

`/code-review` result: `code-review` at high effort, 2026-10-05, 6 findings on the hook rewrite, all fixed, in
`15908bf` (script, tests, git hooks, CI) and `29cbbbd` (docs):

1. Slug read from `ACTIVE` blinded the gate on parallel branches: fixed, the slug is the `feat/<slug>` branch name
   and `ACTIVE` is ignored on feat branches (criterion 12).
2. The checks only ran inside Claude's Bash tool: fixed, the same script now runs from `.githooks/pre-commit`,
   `.githooks/pre-push` and the `workflow-gate` CI job (criterion 13).
3. Progress evidence was free text: fixed, `commit`, `review` and `close-out` evidence must contain a commit sha
   that resolves in the repository (criterion 15).
4. The push gate looked at the checked-out branch, not the pushed ref: fixed, it parses the refspec and gates the
   destination `feat/*` branch on the tip of its source ref (criterion 14).
5. `[X]` (uppercase) was not read as ticked: fixed (criterion 15).
6. `HOOK_UNDER_TEST` test-only override in the hook spec: fixed, removed and forbidden by
   `arch specs have no test-only hook overrides` (criterion 16).

Limit, stated plainly: the gate-everywhere slice (`15908bf`, `29cbbbd`, `0b2b180`) was written after that review,
so those fixes are covered by tests (`pnpm gate` 415 tests green, hook spec red first then green) but were not
re-reviewed. A fresh `/code-review` over the whole branch is recommended before merge (user's call, row 2 below).

## Workflow progress

Pasted from the handoff, after the last progress commit; `push-pr` stays open because it is ticked after the push and the PR exist.

- [x] story — evidence: 203496b (story.md, ACTIVE, backlog `doing`)
- [x] contract — evidence: 203496b (contract.md with 11 Given/When/Then criteria at that commit; criteria 12-16 added in 0b2b180)
- [x] build — evidence: 73871d8 (workflow docs slice) + b206a86 (hook rewrite + hook spec)
- [x] consolidate — evidence: pnpm gate green on b206a86: Test Files 23 passed (23), Tests 350 passed (350), lint 0 errors
- [x] validate — evidence: hook spec run against old hook 73871d8 (28 of 56 fail) and new hook (56 pass); see Validation
- [x] handoff — evidence: 3ade528 (handoff.md with Done, Validation, Review and Pending sections, last updated there)
- [x] commit — evidence: 3ade528 (latest commit on feat/close-workflow-redesign when this was written)
- [x] review — evidence: 3ade528 (checklist + `code-review` high-effort 2026-10-05 recorded in ## Review)
- [x] close-out — evidence: 35e6a39 (spacing-tokens close, the first close-out commit through the fixed hook; this task's own close commit cannot cite itself, so it is recorded in closed/close-workflow-redesign.md)
- [x] gate-push — evidence: pnpm gate:push on 3ade528, 2026-10-06: Prettier ok, lint 0 errors (1 warning), Test Files 23 passed (23), Tests 415 passed (415), Build complete!, e2e 5 passed (11.5s), EXIT=0
- [ ] push-pr — evidence:
