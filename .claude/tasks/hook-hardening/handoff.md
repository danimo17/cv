# Handoff: hook-hardening

_Updated: 2026-10-19. REAL state of the `feat/hook-hardening` branch (based on `cbba912`; origin/main has moved by one commit since, merge at PR time)._

## Workflow progress

- [x] story — evidence: 535061c story.md (re-authored from the test identity)
- [x] contract — evidence: 535061c contract.md, criteria 1-6
- [x] build — evidence: edb3b66 hook, specs, decision 059, docs, backlog, vitest GIT\_\* isolation
- [x] consolidate — evidence: pre-commit pnpm gate of edb3b66: 26 files, 621 tests passed, lint 0 errors
- [x] validate — evidence: 2026-10-19 full tests/arch/require-contract-hook.spec.ts green inside the gate (17 new tests red against the old hook first)
- [x] handoff — evidence: 2026-10-19 this file
- [x] commit — evidence: edb3b66 build commit (535061c story and contract)
- [ ] review — evidence:
- [ ] close-out — evidence:
- [ ] gate-push — evidence:
- [ ] push-pr — evidence:

## Done (verified)

- Criterion 1: `claude_hook` resolves the repo from the payload `cwd` (`git -C <cwd> rev-parse --show-toplevel`), then `CLAUDE_PROJECT_DIR`, then `.`. Tests: "hook resolves the repo from the payload cwd" plus a real `git worktree` case and the fallbacks.
- Criterion 2: branch creation (`checkout -b/-B`, `switch -c/-C/--create`, `branch`) of `feat/*` is blocked by orphaned unmerged local or remote `feat/*` branches; a slug that is a `doing` row (working-tree backlog or the branch's own tip) is tolerated; `ALLOW_UNMERGED_FEAT=1` prefix is the escape hatch. Test: "new feat branch is blocked by orphaned unmerged branches, not by parallel doing tasks" plus three variants.
- Criterion 3: rule 12 delegation check (more than 1 file or 15 changed lines under app/ server/ shared/, staged handoff `## Subagents` needs a data row). Test: "multi-file code commits need a subagent row in the handoff" plus variants.
- Criterion 4: rule 11 widened to the structural config list, `package.json` compared as parsed JSON on the dependency keys. Test: "structural config changes need a decision record" plus variants. Sibling strengthened: "a change to the gate itself is code too" now stages a decision first.
- Criterion 5: shared component consumers section. Test: "shared component changes need a consumers section in the contract" plus variants.
- Criterion 6: decision 059, catalog `ai-workflow.md` section "Hook hardening (decision 059)", "How it's checked" of rules 06, 11, 12 and 16, contract template hint. Test: "decision 059 and the hardening rules are documented" in `tests/arch/workflow-steps.spec.ts`.
- Carried from `arch-rule-gates` (`f5a2bfd`): `tests/setup/clean-git-env.ts`, `tests/arch/test-env-isolation.spec.ts` and the `setupFiles` entry in `vitest.config.ts` (worktree pollution incident of 2026-10-19), documented in decision 059.
- Backlog: `hook-hardening` row added as `doing`; `require-contract-decision-check` set to `doing` (covered by this task).

## In progress / not done

- Review, close-out, gate-push and push-pr are not done (see Workflow progress).
- Limits (decision 059): the branch check sees only branch creation typed in a Claude Bash command (`git worktree add -b`, terminal and editor are not covered); a `doing` row left behind hides an abandoned branch; unmerged is by ancestry, so a squash-merged branch is reported until deleted.
- The live Claude hook in a session started on another checkout still runs the old logic until the session restarts; the git hooks in `.githooks/` are the real gate.
- Merge conflicts with sibling tasks are likely in `.claude/backlog.md`, the rules, `ai-workflow.md` and `tests/arch/workflow-steps.spec.ts`; the `vitest.config.ts` isolation change is identical to `f5a2bfd`.

## Subagents (rule 12)

| Subagent                      | What it did                                                                          | Result                                         |
| ----------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------- |
| hook-hardening (own worktree) | hook changes, specs (red then green), decision 059, catalog, rules, backlog, handoff | criteria 1-6 green in the gate; review pending |

## Validation (actual output of the last gate)

```
pnpm gate (pre-commit of edb3b66) → Test Files 26 passed (26), Tests 621 passed (621), eslint 0 errors (1 pre-existing warning in CustomInput.vue)
```

Not covered: the end-to-end behavior of the live Claude PreToolUse hook (the specs run it as a subprocess with the same stdin payload); `pnpm gate:push` is recorded below once run.

## Review (workflow step `review`, rule 09)

Pending. The review checklist and `/code-review high` over the full branch diff have not run yet; the user runs `/code-review high` on the final diff and the result, with one line per finding, is recorded here afterwards.

## Pending on the user

| #   | What                                                                       | Blocks            | Status  |
| --- | -------------------------------------------------------------------------- | ----------------- | ------- |
| 1   | Run `/code-review high` on the branch diff and record the result in Review | review, close-out | pending |
| 2   | Decide push and PR after review, close-out and `pnpm gate:push`            | push-pr           | pending |

## Decisions made in this task

- → `.claude/docs/decisions/059-hook-hardening.md`
