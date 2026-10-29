# Story: audit-autofix

**Slug:** `audit-autofix` · **Branch:** `feat/audit-autofix` · **Status:** doing

As the repo owner I want a weekly workflow that fixes new `pnpm audit` advisories by itself so that the red `audit`
check stops blocking every PR (three manual override tasks in two weeks: PRs #26 and the next one).

Decision of 2026-10-29 (user): automate the overrides instead of loosening the gate.

## Behavior

- `.github/workflows/audit-fix.yml`, schedule weekly (Monday, after Dependabot) plus `workflow_dispatch`.
- It runs `pnpm audit --fix` (adds `overrides` to `pnpm-workspace.yaml`), `pnpm install`, then re-runs
  `pnpm audit --audit-level=high`; only if that exits 0 and files changed it opens a pull request from a fresh
  branch `chore/audit-fix-<date>`. It never merges, never ignores an advisory, never pushes to `main`.
- The PR is created with the repository secret `AUDIT_FIX_TOKEN` (a fine-grained token of the owner, contents and
  pull requests write on this repo only): PRs opened with the default `GITHUB_TOKEN` do not trigger the CI, so the
  required checks would never run.
- If `pnpm audit --fix` cannot clear the advisories, it opens a GitHub issue (or fails loudly) listing what is left
  so the owner decides (rule 11: ignores need explicit approval).

## Out of scope

- Merging the generated PR (rule 06: the user merges).
- Fixing today's advisories (task `audit-overrides-3`).

## External dependencies

- The owner creates the secret `AUDIT_FIX_TOKEN` (never pasted in chat, rule 01).
