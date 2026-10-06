# Handoff: close-workflow-redesign

_Updated: 2026-10-05 (gate-everywhere slice). REAL state of the `feat/close-workflow-redesign` branch._

## Workflow progress

One line per `pre-push` step of `.claude/workflow-steps.json`, in order. Tick a step only when it is really
done: `- [x] <id> — evidence: <commit sha / gate output line / date>`. Evidence is mandatory once ticked
(blocked at commit time otherwise). `push-pr` is ticked last, after the push and the PR exist; the post-merge
steps (`merge`, `deploy-check`) are not listed here.

- [x] story — evidence: 203496b (story.md, ACTIVE, backlog `doing`)
- [x] contract — evidence: 203496b (contract.md with 11 Given/When/Then criteria)
- [x] build — evidence: 73871d8 (workflow docs slice) + b206a86 (hook rewrite + hook spec)
- [x] consolidate — evidence: pnpm gate green on b206a86: Test Files 23 passed (23), Tests 350 passed (350), lint 0 errors
- [x] validate — evidence: hook spec run against old hook 73871d8 (28 of 56 fail) and new hook (56 pass); see Validation
- [ ] handoff — evidence:
- [ ] commit — evidence:
- [ ] review — evidence:
- [ ] close-out — evidence:
- [ ] gate-push — evidence:
- [ ] push-pr — evidence:

## Done (verified)

- hook-and-tests slice (criteria 1, 2, 4, 5, 7, 8): `.claude/hooks/require-contract.py` rewritten (closing by
  staged deletions, HEAD/index-based reads, ACTIVE-empty push via branch slug, progress evidence + completeness)
  and `tests/arch/require-contract-hook.spec.ts` (56 tests, throwaway git repos). `story` gate flipped to
  `require-contract` (story.md now required by the hook); catalog `ai-workflow.md` describes the final behavior.
- workflow-docs slice (criteria 3, 6, 9, 11): `.claude/workflow-steps.json`, rewritten `.claude/workflow.md`,
  `templates/close-checklist.md`, `templates/handoff.md`, `hard-rules.md` rows 09/10, `rules/09-gates.md`,
  `rules/10-contract-first.md`, decision 057 (+ "Superseded in part by 057" notes on 042 and 051), catalog
  `ai-workflow.md`, `tests/arch/workflow-steps.spec.ts` (4 criterion tests + 1 json well-formedness test).

- gate-everywhere slice (criteria 12-16, from the 2026-10-05 high `/code-review`): `require-contract.py` rewritten
  into one script with four invocations (Claude stdin-JSON, `--commit`, `--pre-push`, `--ci <branch> <sha>`); slug
  comes from the `feat/<slug>` branch name and `ACTIVE` is ignored on feat branches; the Claude push gate parses
  the refspec and gates the tip of the source ref per `feat/*` destination; `commit`/`review`/`close-out` evidence
  must contain a real commit sha, `[X]` counts as ticked; `.githooks/pre-commit` and `.githooks/pre-push` call the
  script before the pnpm gates; `ci.yml` has a `workflow-gate` job; `HOOK_UNDER_TEST` removed and an arch test
  forbids it; decision 057 has an `Amendment 2026-10-05`; docs/rules/catalog/README/CLAUDE.md say `ACTIVE` is no
  longer needed on feat branches.

## In progress / not done

- closer slice (criterion 10): `spacing-tokens` closed in `35e6a39`; the close of this task follows the review
  commit through the same hook.
- Fresh `/code-review` of the whole branch, including the gate-everywhere slice: not run, recommended (Pending 2).
- Not run anywhere: the `workflow-gate` job of `ci.yml` (Actions can't be run locally; it was checked for YAML
  validity and by reading, its first real run is the first `feat/*` PR). If the ruleset should make it blocking,
  `workflow-gate` has to be added to the required checks (user action, see Pending).

## Subagents (rule 12)

| Subagent        | What it did                                                                                                                                                                                                                 | Result                                                                                                                                           |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| workflow-docs   | step list json, workflow.md, templates, rules 09/10, hard-rules, decision 057, catalog, workflow-steps arch test                                                                                                            | done in 73871d8 (see Validation)                                                                                                                 |
| hook-and-tests  | `require-contract.py` rewrite + hook spec (56 tests, written red first: 28 failed, then all green)                                                                                                                          | done in b206a86; interrupted once, a second agent reviewed, finished and verified the partial work (old-hook comparison, docs, handoff evidence) |
| gate-everywhere | criteria 12-16: branch-keyed slug, `--commit`/`--pre-push`/`--ci` modes + git hook and CI wiring, refspec-aware push gate, sha-verified evidence, `HOOK_UNDER_TEST` removed (spec written red first: 50 failed, then green) | done in 15908bf (script, tests, git hooks, CI) and 29cbbbd (docs); see Validation                                                                |

## Validation (actual output of the last gate)

```
pnpm gate (on 29cbbbd, gate-everywhere slice) → format:check ok, lint 0 errors (1 pre-existing warning), typecheck ok, Test Files 23 passed (23), Tests 415 passed (415)
local smoke of .githooks/pre-push with the pushed HEAD sha of this branch → exit 2, 2 problems named (## Review unchecked items; progress steps handoff, commit, review, close-out, gate-push not ticked), expected until review/close-out are done
pnpm gate (on b206a86) → format:check ok, lint 0 errors (1 pre-existing vue/require-default-prop warning),
typecheck ok, Test Files 23 passed (23), Tests 350 passed (350)
earlier agent: the then-current hook spec run against the pre-rewrite hook (`git show 73871d8:.claude/hooks/require-contract.py`) → 28 failed | 28 passed (56); against the rewritten hook → 56 passed (56). That override was removed afterwards (criterion 16).
```

The 28 cases that fail on the old hook cover every required behavior (close with ACTIVE emptied/other slug, archive
checklist boxes, ACTIVE-empty push via branch slug, progress evidence, fully-ticked pre-push steps, story.md
required). The 054 behavior cases (ACTIVE set) mostly pass on both hooks by design (unchanged behavior), except
"reads ACTIVE from HEAD, not from the working tree".

Not covered: the hook can't prove evidence is true (non-empty, and a resolvable commit sha for
`commit`/`review`/`close-out`), doesn't judge `story` content or `validate`; the Claude hook only sees commands
run through Claude's Bash tool, the git hooks can be skipped with `--no-verify` (CI `workflow-gate` is the
backstop, only blocking if it is a required check, and it has not run yet); review of the rule docs for
criterion 9 happens in `## Review`.

## Review (workflow step `review`, rule 09)

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

## Pending on the user

| #   | What                                                                                                                                                                                                                      | Blocks                             | Status  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ------- |
| 1   | Explicit permission for the single `git push` of `feat/close-workflow-redesign` (rule 06, decision 031); the AI then opens the PR                                                                                         | `push-pr`                          | pending |
| 2   | Run a fresh `/code-review` over the whole branch before merging: the gate-everywhere slice (`15908bf`, `29cbbbd`, `0b2b180`) was written after the 2026-10-05 high-effort review and is covered by tests, not re-reviewed | confidence in the merge            | pending |
| 3   | Add the `workflow-gate` CI job to the required checks of the `main` ruleset (a skipped job passes, so it is safe to add); until then the CI backstop for `git push --no-verify` is not blocking                           | making the CI backstop hard        | pending |
| 4   | Know that after the merge the new flow applies: `merge` is yours, `deploy-check` is post-merge and non-blocking (the AI reports `deploy.yml` in chat; a failed deploy is a new task, never a reopened one)                | nothing, awareness of the new flow | info    |
| 5   | `button-system`, `css-tailwind-first` and `workflow-integrity-hardening` stay `todo` in the backlog and were not touched by this branch                                                                                   | nothing                            | info    |

## Decisions made in this task

- → `.claude/docs/decisions/057-close-out-before-single-push.md`
