# Handoff: post-launch

_Updated: 2026-09-18. Real state of `feat/post-launch`: **contract 12/12 done, code review FINISHED, pushed,
PR OPEN: https://github.com/danimo17/cv/pull/2. Waiting on CI + the user's merge.**_

Note: `gh pr create` initially failed with "must be a collaborator" — `gh` was authenticated as
`danimoralespdp`, a different GitHub account than the repo owner `danimo17` (the SSH push worked because git
uses a separate SSH key/host alias for that account, unrelated to `gh`'s API token). Fixed by the user running
`gh auth login` and switching the active `gh` account to `danimo17`; both accounts stay logged in
(`gh auth status` lists both, `danimo17` active) so this shouldn't recur.

## Status: review done, fixes applied, ready for push + PR

All 8 review angles ran to completion (5 in the first pass, 3 re-run after being interrupted mid-session —
the diff hadn't changed, so re-running was safe). One real, verified bug was found and fixed; everything else
was either refuted or judged not worth the churn right now (logged to backlog instead of silently dropped).

### Fixed

- **`app/stores/giphy.ts` `goToOffset` — phantom page after a failed page change.** `offset` was updated
  optimistically before the fetch resolved and never rolled back on failure, so `CustomPagination` could show
  something like "Page 6 of 5" — a page number with no successfully-loaded data behind it — after a failed
  "next page" click. Fixed: `goToOffset` now captures the previous offset and restores it if `status` comes
  back `'error'`. `search()` was simplified to call `goToOffset(0)` instead of duplicating the offset-reset
  logic (this also addressed a smaller "two code paths do the same reset" finding from the simplification
  angle). New test: `tests/unit/stores/giphy.spec.ts` › "a failed page change rolls back to the previous
  offset instead of leaving a phantom page" (271/271 tests green). Catalog (`docs/catalog/state.md`) updated
  in the same commit (rule 07).

### Tried and refuted (documented so it isn't re-suggested)

- **`app/pages/index.vue`'s `resolveComponent(section.component)` instead of the explicit `SECTION_COMPONENTS`
  import map** — the altitude angle argued Nuxt's auto-import should make this work, since `HeroSection`
  renders fine as a bare template tag with no import. **Tested live in the browser: it throws at runtime**
  (`Cannot read properties of undefined (reading 'AboutSection')`) — `resolveComponent()` only resolves at
  compile time for a literal string argument, not a runtime variable. Reverted; decision 041 corrected to
  record this was actually tried, not just assumed impossible.

### Judged real but not worth doing now (logged to `.claude/backlog.md`, not silently dropped)

- `require-contract.py`'s rule-11 check only hardcodes `nuxt.config.ts`/`eslint.config.mjs` — should
  generalize to other structural config and get its own test. → backlog `require-contract-decision-check`.
- `app/stores/giphy.ts`/`app/stores/hero.ts` independently implement the same "bounded, deduped history"
  algorithm — worth a shared helper eventually, not urgent (both are 3-line implementations, low drift risk
  right now).
- `CustomPagination.vue`'s defensive `go()` clamp is currently unreachable dead code (two angles flagged it
  independently) — harmless safety net, left as-is.
- Minor no-op-guard efficiency suggestions in the giphy store (skip a refetch for the exact same
  query/offset) — real but low severity, not applied.

### Corrected in the same pass (documentation accuracy, no code change)

- Decision 041 claimed FontAwesome was "excluded from `imports.presets`" — there is no `imports.presets` key
  in `nuxt.config.ts` at all (no external package is auto-imported, only the project's own `app/` subfolders).
  Corrected the decision text: the actual protection is just the pre-existing `no-restricted-imports` ESLint
  rule, nothing else was needed.
- `docs/catalog/state.md` still said `app/data/cv` used "explicit import from `~/data/cv`" (the barrel that
  was deleted this session) and similarly for `app/services/`, `app/domain/cv/`, `app/ui-config/` — all
  updated to say "auto-import — decision 041".

## What's left

PR open: https://github.com/danimo17/cv/pull/2. Wait for CI (gate + build + e2e + security) to go green, then
**the user merges from GitHub themselves — the AI never merges to `main`, no exception.**

## Contract

`.claude/tasks/post-launch/contract.md` — **12/12 criteria ✅**. Nothing pending on the user for the contract
itself.

## Decisions from this task

- → `.claude/docs/decisions/034` through `039` (meme features, rename, PR conventions).
- → `.claude/docs/decisions/040-english-only.md` — English migration, executed and closed.
- → `.claude/docs/decisions/041-code-comments-zero-suppressions-autoimport.md` — no-comments/
  zero-suppression/auto-import policy, executed and corrected (see "Corrected" above) this session.

## Pendents de l'usuari

| #   | What                                                                     | Blocks            | Status  |
| --- | ------------------------------------------------------------------------ | ----------------- | ------- |
| 1   | Merge PR #2 on GitHub once CI + security are green — only the user, ever | production deploy | pending |

## Related work

A second task/branch, `feat/ux-redesign` (`.claude/tasks/ux-redesign/`), is scaffolded (story + 17-criteria
contract, zero implementation) for a large UX/content redesign — independent of this task, see its own
handoff.
