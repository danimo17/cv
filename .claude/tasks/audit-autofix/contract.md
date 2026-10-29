# Contract: audit-autofix

**Story:** `story.md` · **Declared data sources (rule 02):** pnpm and GitHub documentation (public).

## Acceptance criteria

| #   | Given / When / Then                                                                                                                                                                                                                                                                                                                                                              | Test that covers it                                                                                                                                                                                                                                  |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Given `.github/workflows/audit-fix.yml`, When parsed, Then it triggers on a weekly `schedule` and `workflow_dispatch`, has `permissions` limited to `contents: write` and `pull-requests: write` (and `issues: write` only if it files an issue), uses no `pull_request_target`, and never contains `gh pr merge`, `--auto`, `auto-merge` or a push to `main`                    | `tests/arch/audit-fix-workflow.spec.ts` › "audit-fix workflow is scheduled, least-privilege and never merges"                                                                                                                                        |
| 2   | Given the workflow, When read, Then every third-party action is pinned by commit SHA (first-party `actions/*` may use version tags like `ci.yml`), the PR is opened with `secrets.AUDIT_FIX_TOKEN` (not the default token), and no secret value appears in the file                                                                                                              | same spec › "audit-fix workflow pins actions and uses the dedicated token"                                                                                                                                                                           |
| 3   | Given the steps, When read, Then the order is: install, `pnpm audit --fix`, `pnpm install`, re-run `pnpm audit --audit-level=high`, and a PR is only opened when that re-run passes and files changed; otherwise it fails or files an issue listing the remaining advisories (no ignore is ever written)                                                                         | same spec › "audit-fix opens a PR only after the audit passes and never writes an ignore"                                                                                                                                                            |
| 4   | Given the repo, When docs are read, Then decision 063 records the design (why a dedicated token, why no auto-merge, remove-when conditions), the catalog `ai-workflow.md` documents the workflow, and `.claude/docs/standards/` or the decision names the one manual step (creating `AUDIT_FIX_TOKEN`) without any token value                                                   | `tests/arch/workflow-steps.spec.ts` docs assertion (strengthened; search first)                                                                                                                                                                      |
| 5   | Given the workflow cannot be run locally, When the PR is reviewed, Then the handoff states the limit and gives a safe dry run the owner can trigger once (`workflow_dispatch`) after adding the secret                                                                                                                                                                           | handoff `## Not covered` + decision 063                                                                                                                                                                                                              |
| 6   | Given `pnpm audit --fix=override` emits `<=last-vulnerable` selectors and writes no decision, When the generated pull request runs `pnpm gate`, Then `tests/arch/audit-overrides.spec.ts` accepts a `<=X` selector whose floor is above `X`, and the workflow writes `.claude/docs/decisions/audit-fix-<date>.md` quoting every added selector and value with a REMOVE-WHEN line | `tests/arch/audit-overrides.spec.ts` › "audit override selectors may close the vulnerable range with <= when the floor is above it" and `tests/arch/audit-fix-workflow.spec.ts` › "audit-fix writes a decision that explains every override it adds" |
| 7   | Given `pnpm audit --fix` appends `minimumReleaseAgeExclude` entries and can propose overrides that cannot be installed, When the workflow runs, Then the exclude block is restored to its previous content, a failing install or audit opens or updates the issue and no ignore is written                                                                                       | `tests/arch/audit-fix-workflow.spec.ts` › "audit-fix keeps minimumReleaseAgeExclude as it was before pnpm audit --fix" and › "audit-fix opens a PR only after the audit passes and never writes an ignore"                                           |

## Amendments (scope shift found while verifying, 2026-10-29)

- Criteria 6 and 7 added: the verified behavior of `pnpm audit --fix` (decision 063) is neither `package.json` overrides nor
  age-respecting, and its output would fail `audit-overrides.spec.ts`.
- Criterion 1: the default `GITHUB_TOKEN` is `contents: read` plus `issues: write` (stricter than the contract); the branch
  push and the pull request use `AUDIT_FIX_TOKEN`. Criterion 4's docs assertion also checks decision 063 itself in
  `tests/arch/audit-fix-workflow.spec.ts` › "audit-fix decision 063 records the design and the one manual step without a token value".
- The Open question is resolved: overrides go to `pnpm-workspace.yaml`, bare `--fix` errors, `--fix=override` is required.

## Subagent assignments (rule 12)

| Subagent      | Scope                                           | Criteria |
| ------------- | ----------------------------------------------- | -------- |
| audit-autofix | workflow file, arch spec, decision 063, catalog | 1-5      |

## Standards to consult

- `.github/workflows/ci.yml`, `.github/workflows/security.yml`, `.github/dependabot.yml`; rule 01 (secrets); `.claude/docs/catalog/ai-workflow.md`

## Open questions (each with a destination)

- Whether `pnpm audit --fix` in pnpm 11 writes overrides to `pnpm-workspace.yaml` → decided by the build: verify with `pnpm audit --fix --help`/a local run in a throwaway copy of the repo; if it writes elsewhere, adapt and document.
