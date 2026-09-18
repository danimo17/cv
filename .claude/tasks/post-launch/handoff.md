# Handoff: post-launch

_Updated: 2026-09-18 (mid-session pause, user stepping away). Real state of `feat/post-launch`: **contract
12/12 done, committed (`3fbfbdd`), pushed to `origin` with explicit per-push permission (decision 031),
code review IN PROGRESS — not finished, PR NOT opened yet.**_

## Status: contract done, review interrupted before completion

The contract's 12 criteria are all ✅ (see `contract.md`) and `pnpm gate`/`pnpm gate:push` are green
(committed at `3fbfbdd`, pushed). Per decision 039, the workflow is: Review (checklist + `/code-review`) →
fix what's needed → `pnpm gate:push` again → open the PR (`gh pr create`) → user merges from GitHub.
**We are mid-Review, stopped by explicit user request** ("stop everything") before it finished. Nothing was
left half-applied — no uncommitted code changes exist on this branch right now (working tree clean).

## What to do next session (in order)

1. Read `CLAUDE.md` → `hard-rules.md` → `workflow.md` → this file.
2. **Finish the `/code-review medium` pass** on `git diff main...feat/post-launch` (195 files, the whole
   branch since the last merge — includes older work: Custom-primitive rename, meme recent-searches +
   pagination, plus this session's English migration / no-comments / auto-import pass). 8 finder angles were
   launched in parallel; **5 completed and produced real findings** (see below), **3 were killed before
   finishing** (angle A "line-by-line diff scan", angle B "removed-behavior auditor", "conventions/CLAUDE.md")
   — re-run just those 3, the diff is still valid (nothing changed since). The diff was saved to
   `/tmp/pr-review.diff` (9008 lines) — that's an ephemeral scratch file, regenerate it with
   `git diff main...feat/post-launch > /tmp/pr-review.diff` if it's gone.
3. Run the Phase 2 verify step (1-vote, CONFIRMED/PLAUSIBLE/REFUTED) on the findings below plus whatever the
   3 re-run angles add, then decide fixes.
4. Apply the fixes that verify as real (see "Findings so far" — the `resolveComponent()` one in particular
   looks like a genuine simplification worth taking), re-run `pnpm gate:push`, commit.
5. Update the checklist in `.claude/templates/review-checklist.md` mentally (not a file to edit) — go through
   it for real before opening the PR.
6. Open the PR with `gh pr create`, following decision 039's title/body convention (English title, no prefix;
   `Summary`/`Acceptance criteria`/`Review`/`Test plan` sections). Give the user the PR URL — **they merge
   from GitHub themselves, the AI never merges to `main` (rule 06, no exception)**.

## Findings so far (from the 5 completed review angles) — NOT yet verified (Phase 2 skipped)

Ranked roughly by how actionable they look; none of these are correctness bugs (no CONFIRMED crash/wrong-output
found), all are simplification/reuse/altitude/efficiency:

1. **Likely worth fixing — `app/pages/index.vue`'s `SECTION_COMPONENTS` map** (altitude angle): keeps 5
   explicit component imports that decision 041 called "unavoidable" because Nuxt's component auto-import
   allegedly doesn't resolve components used as plain JS values. The altitude reviewer makes a strong
   counter-case: `HeroSection` is used as a bare `<HeroSection />` template tag a few lines above with zero
   explicit import (proving it's globally registered), and `app/ui-config/cv/sections.ts` already types
   `component` as the literal string union Vue's `resolveComponent(name: string)` needs. Proposed fix:
   replace `SECTION_COMPONENTS[section.component]` with `resolveComponent(section.component)` in the
   template, dropping all 5 imports, the `Record` map, and the `import type { Component }` line — and it
   generalizes (a 6th home section needs no matching edit in `index.vue`). **If this pans out, decision 041's
   "still explicit, by design" note about `index.vue` needs correcting**, not just the code.
2. **`app/stores/giphy.ts`/`app/stores/hero.ts` duplicate a "push to bounded, deduped history" algorithm**
   (reuse angle): both stores independently implement `[item, ...history.filter(x => x !== item)].slice(0, N)`
   with their own `HISTORY_SIZE` constant. Proposed: extract a small shared helper (e.g. under
   `app/domain/`) both call.
3. **`app/stores/giphy.ts` offset/page duality** (simplification angle): the store exposes `offset`
   (0-indexed), forcing `meme.vue` to carry a `computed({get,set})` converting to/from `CustomPagination`'s
   1-indexed `page` prop. Proposed: have the store own `page` directly and compute `offset` internally right
   before the fetch call.
4. **`search()` and `goToOffset()` both reset/set offset but only one goes through a shared path**
   (simplification angle): `search()` sets `offset.value = 0` directly instead of calling `goToOffset(0)`,
   so the "changing offset always re-fetches" invariant is maintained by convention across two functions
   instead of one. Minor.
5. **Two missing no-op guards in the giphy store** (efficiency angle, both low severity): `search()` always
   refetches even for the exact already-active query; `goToOffset()` has no `newOffset === offset.value`
   guard (currently unreachable from the UI since `CustomPagination.go()` already guards it, but the store's
   own contract doesn't).
6. **`require-contract.py`'s new rule-11 check hardcodes only `nuxt.config.ts`/`eslint.config.mjs`**
   (altitude angle): doesn't cover `playwright.config.ts`, `vitest.config.ts`, `wrangler.jsonc`, or
   `package.json` dependency changes, which are arguably just as "architecturally significant." Also: no
   `tests/arch/*.spec.ts` asserts this hook's behavior, unlike other arch rules. Worth generalizing the
   `DECISION_WORTHY` tuple into a broader/more principled check, and/or adding a test for it.
7. **Decision 041 references `imports.presets` for excluding FontAwesome from auto-import, but no such config
   key exists in `nuxt.config.ts`** (altitude angle) — the actual enforcement today is just the pre-existing
   `no-restricted-imports` ESLint rule (which does generalize fine to future packages). Not a code bug, but
   the decision doc oversells what's actually configured — worth a small doc correction so decision 041 says
   "enforced via the existing `no-restricted-imports` rule, no new `imports.presets` needed" instead of
   implying a preset exclusion was set up.
8. Cross-file tracer (angle C) found **no breaking issues** in the giphy pagination wiring, the App→Custom
   rename (zero leftover references anywhere in the repo, grepped), or `SourceBanner.vue`'s restructure — but
   flagged one non-bug worth knowing: `SourceBanner.vue` now resolves `profile` purely via the new
   `nuxt.config.ts` auto-import (its own explicit import was removed in the same diff) — a silent cross-file
   dependency between two diff hunks. Not wrong, just something a partial revert of either hunk alone would
   break.

`CustomPagination.vue`'s defensive `go()` clamp was flagged as technically-dead-code-today by two angles
independently (simplification + reuse) — low priority, arguably fine to leave as a safety net with a one-line
note.

## Contract

`.claude/tasks/post-launch/contract.md` — **12/12 criteria ✅** (8 original + 4 added mid-session for the
no-comments/zero-suppression/auto-import/English-migration scope). Nothing pending on the user for the
contract itself.

## Commits (this branch, all pushed)

Latest: `3fbfbdd` "docs+chore: migrate repo to English (rule 13), remove code comments (rule 14), zero lint
suppressions (rule 15), aggressive auto-import" — 150 files. Everything before that was already pushed in
earlier sessions (see `git log feat/post-launch` for the full list; not re-copied here to avoid this file
going stale again).

## Decisions from this task

- → `.claude/docs/decisions/034` through `039` (meme features, rename, PR conventions) — see earlier handoff
  history in git if needed, not repeated here.
- → `.claude/docs/decisions/040-english-only.md` — the English migration, executed and closed this session.
- → `.claude/docs/decisions/041-code-comments-zero-suppressions-autoimport.md` — no-comments/zero-suppression/
  auto-import policy, executed this session. **May need a small correction** re: `imports.presets` per
  finding 7 above.

## Pendents de l'usuari (things only the user can decide/do)

| #   | What                                                                                                                                    | Blocks            | Status  |
| --- | --------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------- |
| 1   | Approve opening the PR once review fixes land (a fresh ask each time per rule 06/decision 031 — pushing again needs new permission too) | closing this task | pending |
| 2   | Merge the PR on GitHub once CI + security are green — **only the user can do this, ever**                                               | production deploy | pending |

## Related work

A second task/branch, `feat/ux-redesign` (`.claude/tasks/ux-redesign/`), was started in parallel this session
for a large batch of UX/content changes the user requested (header, dropdowns, timeline, elevation, footer,
meme page copy, CV content fixes — 17 criteria). It's independent of this task's remaining Review/PR step —
see its own handoff for status. `.claude/tasks/ACTIVE` currently points to `ux-redesign` (that branch's task
files are stashed on top of `feat/post-launch`'s clean tree right now — see git stash list — pop it back
after switching to `feat/ux-redesign`).
