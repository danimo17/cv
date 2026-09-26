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

`/code-review` (high effort, full 8-angle run via 5 parallel subagents, verified by the main thread) over the
full `main...HEAD` diff. 10 findings survived verification, ranked by severity in `ReportFindings`:

- **Fixed**: push-gate read `handoff.md` off the working tree, so an uncommitted edit could satisfy it while
  the pushed history stayed empty — changed to `git show HEAD:<path>` (reads what was actually committed).
- **Fixed**: `git rev-parse`/`git show` subprocess calls and the handoff read had no error handling, unlike
  the rest of the file — both now guard `OSError` and decode failures.
- **Fixed**: rule 19 itself used the Catalan word "assegura't", violating rule 13 (English-only) — removed.
- **Documented as an accepted limitation, not fixed** (decision 054): the "code-review ran" check is a bare
  substring match with no polarity check — this task's own first handoff wording happened to satisfy it while
  describing a lighter manual pass, not a real `/code-review` run (ironic, self-caught); the branch-prefix gate
  keys off checked-out HEAD not the actual push target (detached-HEAD/explicit-refspec bypass, and a
  `chore/close-*` window before `ACTIVE` clears); two pre-existing regex limitations (whitespace-sensitive
  unchecked-box pattern, `git <flags> push` not matching the top-level command regex) that this task inherited
  rather than introduced. All four are deliberate, honestly-stated trade-offs for a solo-maintainer project,
  not gaps found later.
- **Flagged, not this task's to fix**: `feat/composable-store-regions` (a live branch from earlier this
  session) has `ACTIVE` set and no `handoff.md` at all — its next push will be blocked by this new gate. Noted
  under Pending below rather than fixed here (cross-branch, rule 18 — asking before touching another branch's
  files mid-task).
- 6 lower-severity code-quality findings (duplicated section-extraction/unchecked-box logic between the
  commit-side and push-side checks, a few redundant syscalls) were reported but not fixed — real, but cosmetic;
  tracked as a `require-contract.py` refactor opportunity, not blocking.

## Pending on the user

| #   | What                                                                                                                                                                 | Blocks              | Status  |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ------- |
| 1   | `feat/composable-store-regions` needs a `handoff.md` with a filled `## Review` section before it can be pushed under this new gate — separate branch, not fixed here | pushing that branch | pending |

## Post-merge deploy check (decision 042, only after the user merges)

- [ ] `gh run list --branch main --limit 1 --workflow deploy.yml` shows `success` for this merge's commit.
- Note: this PR touches no deployable app code — the deploy will still run (any push to `main` triggers it)
  but nothing user-facing should change. Verify anyway, per decision 042's "trigger, not a guarantee".

## Decisions made in this task

- `.claude/docs/decisions/054-push-review-gate.md`
