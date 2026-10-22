# Story: merge-evidence-fix

**Slug:** `merge-evidence-fix` · **Branch:** `feat/merge-evidence-fix` · **Status:** doing

As the repo owner I want a conflicted `git merge origin/main` into a closed feature branch to be committable, so
that the open PRs #24 and #25 can absorb `main`.

Defect found 2026-10-22: the commit-time progress check (`check_progress_evidence`) requires every `commit`,
`review` and `close-out` evidence sha of a staged handoff or archive to be an ancestor of `HEAD`. During a merge
the closed archives that arrive from the other side (for example `.claude/tasks/closed/audit-overrides-2.md`)
cite shas that are ancestors of `MERGE_HEAD`, not yet of `HEAD`, so the merge commit is blocked with "not an
ancestor of the tip being checked". Merges that complete without conflicts never reach the hook, which is why
PR #23 was not affected.

## Out of scope

- Any other hook behavior (task `hook-hardening`, PR #25, rewrites the same file; the fix must be small so it
  can be ported when that PR merges `main`).

## External dependencies

None. Own worktree; must merge before PRs #24 and #25 can be updated.
