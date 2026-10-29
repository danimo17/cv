# Handoff: audit-autofix

_Updated: 2026-10-29 13:00. REAL state of the `feat/audit-autofix` branch (based on `origin/main` d3f4d3a)._

## Workflow progress

- [x] story — evidence: a1f8f56 (story.md, contract.md, backlog row `doing`)
- [x] contract — evidence: a1f8f56 (criteria 1-5; amended with 6-7 in ece3af7)
- [x] build — evidence: 3f28ea3 (workflow, arch spec, decision 063, catalog) and 0075581 (decision file name fix)
- [x] consolidate — evidence: 0075581 (pnpm gate green inside the commit: 27 files, 611 tests)
- [x] validate — evidence: 0075581 (real gate output below)
- [x] handoff — evidence: 0075581 (this file written after the build commits)
- [x] commit — evidence: 0075581
- [ ] review — evidence:
- [ ] close-out — evidence:
- [ ] gate-push — evidence:
- [ ] push-pr — evidence:

## Done (verified)

- Verified `pnpm audit --fix` in a throwaway copy of the repo (never in the worktree), pnpm 11.17.0: a bare `--fix`
  fails with `ERR_PNPM_INVALID_FIX_OPTION`; `--fix=override` writes overrides to `pnpm-workspace.yaml` (26 overrides for
  19 high advisories that day, exit 0, lockfile untouched), appends a `minimumReleaseAgeExclude` entry per patched
  version (ignores `minimumReleaseAge`, even for a version that is not published), emits `<=` selectors, and its
  overrides were not installable (`deepmerge@^4.3.2` does not exist; the `nuxt` override unmatched the
  `@nuxt/devtools` patch). `--fix=update` fails on the same patch. Details in decision 063.
- `.github/workflows/audit-fix.yml`: Monday 07:30 UTC plus `workflow_dispatch`; `permissions: {}` at workflow level,
  `contents: read` + `issues: write` on the job; `AUDIT_FIX_TOKEN` for checkout (`persist-credentials: false`), the
  branch push (`gh auth setup-git`) and `gh pr create`; `pnpm/action-setup` pinned by SHA; frozen install with
  `--ignore-scripts`, baseline audit, `--fix=override`, restore of `minimumReleaseAgeExclude`, a non-frozen install
  with `--ignore-scripts`, second audit; PR `chore/audit-fix-<date>` with a generated decision file; on failure one
  issue `audit: advisories left after auto-fix`. Never merges, never ignores.
- `tests/arch/audit-fix-workflow.spec.ts` (criteria 1-3, 6, 7 and decision 063), `tests/arch/audit-overrides.spec.ts`
  (accepts `<=` selectors), `tests/arch/workflow-steps.spec.ts` (every workflow file is in the catalog).
- Decision 063, catalog `ai-workflow.md` (workflow table, Secrets table, audit auto-fix paragraph), backlog row.
- The shell/awk programs that touch `pnpm-workspace.yaml` were exercised locally against the real output of
  `pnpm audit --fix=override` in the throwaway copy (26 overrides extracted, excludes restored, generated decision file
  and `pnpm-workspace.yaml` already prettier-clean).

## In progress / not done

- Nothing in the code. Waiting on the owner for the secret (Pending 1) and the review/close/push steps below.

## Subagents (rule 12)

| Subagent                      | What it did                                                                                                      | Result                                     |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| audit-autofix (this subagent) | Everything: pnpm behavior verification in a throwaway copy, workflow, arch specs, decision 063, catalog, handoff | commits a1f8f56, ece3af7, 3f28ea3, 0075581 |

## Validation (actual output of the last gate)

```
pnpm gate (pre-commit of 0075581) → eslint 0 errors (1 pre-existing warning vue/require-default-prop in CustomInput.vue),
nuxt typecheck clean, vitest: Test Files 27 passed (27), Tests 611 passed (611)
```

Red then green: before the workflow existed `tests/arch/audit-fix-workflow.spec.ts` failed 6 of 6 ("missing
.github/workflows/audit-fix.yml" / "decision 063 file"); the decision-file-name finding (a re-run on the same day would
overwrite an earlier merged decision file) was a red test first, then the fix in 0075581.

Not covered: the workflow itself cannot run locally (no `act`, it needs the repository secret, `gh` and GitHub-hosted
runners). What is covered: the file text and ordering by the arch spec, the two awk filters by fixtures, and the whole
fix/install/audit sequence by hand in a throwaway copy. Not exercised: `gh auth setup-git` plus `git push` with the
fine-grained token, `gh pr create`, and the issue REST calls. Safe dry run once the owner has added the secret:
trigger `workflow_dispatch` on the default branch once and check the result: a pull request from a
`chore/audit-fix-<date>` branch with the required checks running, or the issue `audit: advisories left after
auto-fix`, or a green "nothing to fix". Expect the issue on the first run (see decision 063): today's `--fix` output
has an unpublished `deepmerge` version and breaks the `@nuxt/devtools` patch.

## Review (workflow step `review`, rule 09)

Review checklist (`.claude/templates/review-checklist.md`) run over the full branch diff (one workflow file, three arch
specs, decision 063, catalog, backlog, task files):

- [x] Secrets (01): no token value anywhere, the workflow only references `secrets.AUDIT_FIX_TOKEN` (asserted by the spec). Company (02): sources are pnpm and GitHub documentation plus the public npm registry. Giphy (03), PII (04), i18n (05): n/a, no app, server or locale change.
- [x] Branch (06): on `feat/audit-autofix`, no push. Catalog (07): `ai-workflow.md` updated (workflow, secret, behavior). Gates (09): `pnpm gate` green in every commit. Contract (10): criteria 1-7 each map to a named test (1-3, 6, 7 in `audit-fix-workflow.spec.ts` and `audit-overrides.spec.ts`; 4 in `workflow-steps.spec.ts` plus the decision 063 test; 5 in this handoff and decision 063). Decisions (11): 063 written; no ignore added, and the workflow can never add one.
- [x] CSS (08), primitives (026, 038), living docs components (027), accessibility, UI consistency (16): n/a, no UI change; the pnpm/node setup steps match `ci.yml` except the SHA pin of the non-first-party action. Subagents (12): the table above.

code-review: not run (no `/code-review` round was run for this workflow-only change); it is covered by
`tests/arch/audit-fix-workflow.spec.ts`, the fixture runs of the awk programs, the manual run of the fix/install/audit
sequence in a throwaway copy, and `pnpm gate:push`. 2026-10-29, round 1, no effort level. A self-review of the diff found
one issue (a same-day re-run could overwrite an earlier merged decision file), fixed in 0075581 with a failing test first.

- findings: none

## Pending on the user

| #   | What                                                                                                                                                                                                    | Blocks                                   | Status  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ------- |
| 1   | Create a fine-grained token (resource owner `danimo17`, only `danimo17/cv`, Contents read/write and Pull requests read/write) and add it as repository secret `AUDIT_FIX_TOKEN`; never paste it in chat | the first successful run of the workflow | pending |
| 2   | After adding the secret, trigger `audit-fix` once with `workflow_dispatch` and check the pull request or the issue it produces                                                                          | knowing the unexercised steps work       | pending |
| 3   | Today's advisories (19 high) are not fixed by this task; expect the issue `audit: advisories left after auto-fix` on the first run, or fix them by hand in task `audit-overrides-3`                     | the red `audit` check on open PRs        | pending |

## Decisions made in this task

- → `.claude/docs/decisions/063-audit-autofix-workflow.md`
