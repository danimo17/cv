# Contract: hook-hardening

**Story:** `story.md` · **Declared data sources (rule 02):** none.

All tests go in `tests/arch/require-contract-hook.spec.ts` (search first: strengthen siblings, titles unique).

## Acceptance criteria

| #   | Given / When / Then                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Test that covers it                                                                         |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 1   | Given a Claude hook payload with a `cwd` inside a git worktree, When the hook runs, Then it evaluates the repo that contains `cwd` (branch, index, tasks), not the checkout named by `CLAUDE_PROJECT_DIR`; with no `cwd` it falls back to `CLAUDE_PROJECT_DIR` then `.`                                                                                                                                                                                                                                     | "hook resolves the repo from the payload cwd"                                               |
| 2   | Given `git checkout -b feat/x`, `git switch -c feat/x` or `git branch feat/x`, When another local or remote `feat/*` branch is not merged into main and is NOT a `doing` row of `.claude/backlog.md`, Then the command is blocked listing those branches (name + last commit subject); a branch whose slug is a `doing` row (a task legitimately running in parallel) does not block; the escape hatch is the command-prefix variable `ALLOW_UNMERGED_FEAT=1`, documented                                   | "new feat branch is blocked by orphaned unmerged branches, not by parallel doing tasks"     |
| 3   | Given a commit that stages more than 1 file or more than 15 changed lines under `app/`, `server/` or `shared/` on a `feat/<slug>` branch, When the task handoff's `## Subagents` table has no data row, Then the commit is blocked with a rule 12 reminder; at or under the threshold it passes                                                                                                                                                                                                             | "multi-file code commits need a subagent row in the handoff"                                |
| 4   | Given a commit staging any structural config (`playwright.config.ts`, `vitest.config.ts`, `wrangler.jsonc`, `pnpm-workspace.yaml`, `package.json` dependency keys, `.github/workflows/*`, `.githooks/*`, `.claude/hooks/*`, `.claude/hard-rules.md`, `.claude/rules/*.md`) besides today's `nuxt.config.ts`/`eslint.config.mjs`, When no file under `.claude/docs/decisions/` is staged, Then it is blocked (rule 11); a `package.json` change that only touches `version`/`scripts` text is not structural | "structural config changes need a decision record"                                          |
| 5   | Given a commit staging a file under `app/components/shared/`, When the active task's `contract.md` has no `## Shared component consumers` section listing the grep result and the decision (only here / everywhere), Then it is blocked (rule 16, reusable-component scope)                                                                                                                                                                                                                                 | "shared component changes need a consumers section in the contract"                         |
| 6   | Given the new checks, When docs are read, Then rules 06, 11, 12 "How it's checked" and the catalog `ai-workflow.md` describe them; decision 059 records that the unmerged-branch check tolerates `doing` tasks (deviating from the original story text because of the parallel-task decision of 2026-10-13)                                                                                                                                                                                                 | `tests/arch/workflow-steps.spec.ts` › "decision 059 and the hardening rules are documented" |

## Subagent assignments (rule 12)

| Subagent       | Scope                                      | Criteria |
| -------------- | ------------------------------------------ | -------- |
| hook-hardening | hook changes + specs + docs + decision 059 | 1-6      |

## Standards to consult

- `.claude/docs/standards/testing.md`; decisions 054, 057, 058; `.claude/docs/catalog/ai-workflow.md`

## Open questions (each with a destination)

- Threshold for criterion 3 (1 file / 15 lines) → decided: from the story; revisit in a decision if it blocks legitimate small multi-file edits.
