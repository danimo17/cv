# Contract: audit-autofix

**Story:** `story.md` · **Declared data sources (rule 02):** pnpm and GitHub documentation (public).

## Acceptance criteria

| #   | Given / When / Then                                                                                                                                                                                                                                                                                                                                           | Test that covers it                                                                                           |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 1   | Given `.github/workflows/audit-fix.yml`, When parsed, Then it triggers on a weekly `schedule` and `workflow_dispatch`, has `permissions` limited to `contents: write` and `pull-requests: write` (and `issues: write` only if it files an issue), uses no `pull_request_target`, and never contains `gh pr merge`, `--auto`, `auto-merge` or a push to `main` | `tests/arch/audit-fix-workflow.spec.ts` › "audit-fix workflow is scheduled, least-privilege and never merges" |
| 2   | Given the workflow, When read, Then every third-party action is pinned by commit SHA (first-party `actions/*` may use version tags like `ci.yml`), the PR is opened with `secrets.AUDIT_FIX_TOKEN` (not the default token), and no secret value appears in the file                                                                                           | same spec › "audit-fix workflow pins actions and uses the dedicated token"                                    |
| 3   | Given the steps, When read, Then the order is: install, `pnpm audit --fix`, `pnpm install`, re-run `pnpm audit --audit-level=high`, and a PR is only opened when that re-run passes and files changed; otherwise it fails or files an issue listing the remaining advisories (no ignore is ever written)                                                      | same spec › "audit-fix opens a PR only after the audit passes and never writes an ignore"                     |
| 4   | Given the repo, When docs are read, Then decision 063 records the design (why a dedicated token, why no auto-merge, remove-when conditions), the catalog `ai-workflow.md` documents the workflow, and `.claude/docs/standards/` or the decision names the one manual step (creating `AUDIT_FIX_TOKEN`) without any token value                                | `tests/arch/workflow-steps.spec.ts` docs assertion (strengthened; search first)                               |
| 5   | Given the workflow cannot be run locally, When the PR is reviewed, Then the handoff states the limit and gives a safe dry run the owner can trigger once (`workflow_dispatch`) after adding the secret                                                                                                                                                        | handoff `## Not covered` + decision 063                                                                       |

## Subagent assignments (rule 12)

| Subagent      | Scope                                           | Criteria |
| ------------- | ----------------------------------------------- | -------- |
| audit-autofix | workflow file, arch spec, decision 063, catalog | 1-5      |

## Standards to consult

- `.github/workflows/ci.yml`, `.github/workflows/security.yml`, `.github/dependabot.yml`; rule 01 (secrets); `.claude/docs/catalog/ai-workflow.md`

## Open questions (each with a destination)

- Whether `pnpm audit --fix` in pnpm 11 writes overrides to `pnpm-workspace.yaml` → decided by the build: verify with `pnpm audit --fix --help`/a local run in a throwaway copy of the repo; if it writes elsewhere, adapt and document.
