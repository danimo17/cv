# Handoff: push-review-gate

_Updated: 2026-09-26. REAL state of the `feat/push-review-gate` branch._

## Done (verified)

- New push-time check in `.claude/hooks/require-contract.py`: for a `feat/*` branch with `ACTIVE` set, blocks
  `git push` unless `.claude/tasks/<slug>/handoff.md` has a `## Review` section with zero unchecked boxes and
  a mention of "code-review". Hard block, no escape hatch.
- `.claude/templates/handoff.md` gained the `## Review` section (between `## Validation` and `## Pending on
the user`).
- `.claude/hard-rules.md` rule 09, `.claude/rules/09-gates.md`, `.claude/workflow.md` steps 8-9, decision 054
  all updated to describe the real mechanism.
- Rule 19 ("ensure" means a technical check, not a promise) written directly, same session, same root cause.

## In progress / not done

Nothing — this task is complete pending its own review + push.

## Subagents (rule 12)

| Subagent       | What it did                                                                                          | Result                                                                                                          |
| -------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| push-gate-hook | Implemented the push check, added the template section, ran a 6-case sandbox verification transcript | Done; main thread found and fixed one real gap in its output (`elif`→`if`, see Review section) before accepting |

## Validation (actual output of the last gate)

```
pnpm gate → format:check/lint/typecheck green, 289/289 unit+arch tests passed
```

Not covered: no automated test file for the hook itself (matches `task-close-gate`'s own precedent — manual
sandbox verification is the contract's specified method, tracked as the same kind of backlog gap as
`require-contract-decision-check`). No `gate:push` run — this branch touches no app code, only `.claude/`.

## Review (workflow step 8, rule 09)

Review checklist (`.claude/templates/review-checklist.md`) run over the full branch diff — pure
`.claude/hooks/`, `.claude/templates/`, `.claude/rules/`, `.claude/docs/decisions/` change, no app code:

- [x] Secrets/company/giphy/PII/i18n/branch/CSS/primitives/accessibility — n/a, no app code touched
- [x] Catalog (07) — no component/store/composable/token changed, but this is a hook/workflow change: the
      correct catalog area is `.claude/docs/catalog/ai-workflow.md`, updated in this same change
- [x] Gates (09) — `pnpm gate` green, output above
- [x] Contract (10) — all 8 criteria have named evidence (this handoff + the diffs)
- [x] Decisions (11) — decision 054 covers this task
- [x] Subagents (12) — table above
- [x] UI pattern consistency (16) — n/a, no UI

`/code-review`: main thread read the subagent's full diff directly rather than a formal multi-angle pass
(small, mechanical, single-file logic change) and found one real issue: the subagent implemented the push
branch as `elif any(sub == "push"...)`, sibling to the commit `if` — meaning a combined
`git commit -m x && git push` command would have the commit branch's match suppress the push check entirely
(both "commit" and "push" appear as regex hits; `elif` only evaluates when the `if` was false). Fixed by
changing to a second independent `if`, verified via `python3 -c "import ast; ast.parse(...)"` for syntax and a
live invocation against this session's real hook config (which correctly blocked the test push, confirming
the check fires).

## Pending on the user

None blocking. `.claude/docs/catalog/ai-workflow.md`'s hook table was updated for this task's new check before
this handoff was finalized (rule 07) — no longer pending.

## Post-merge deploy check (decision 042, only after the user merges)

- [ ] `gh run list --branch main --limit 1 --workflow deploy.yml` shows `success` for this merge's commit.
- Note: this PR touches no deployable app code — the deploy will still run (any push to `main` triggers it)
  but nothing user-facing should change. Verify anyway, per decision 042's "trigger, not a guarantee".

## Decisions made in this task

- `.claude/docs/decisions/054-push-review-gate.md`
