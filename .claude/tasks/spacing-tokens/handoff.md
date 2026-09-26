# Handoff: spacing-tokens

**Branch:** `feat/spacing-tokens` · **Base:** merged with `main` at `3c52325` on 2026-09-25 (was `e96aa05`) ·
**Status:** root cause of the e2e failure found and fixed (2026-09-25, see below) — `--spacing-sm`/`--spacing-lg`
collided with Tailwind v4's own default `sm`/`lg` scale keys shared across all spacing-scale utility families.
Tokens and every generated utility renamed to `custom-sm`/`custom-lg`. `pnpm gate:push` green, 5/5 e2e passing.
Ready to push once the user gives explicit go-ahead (rule 06).

## Real state

| Commit    | What                                                                                 |
| --------- | ------------------------------------------------------------------------------------ |
| `b4c4fac` | `--spacing-sm: 0.5rem` / `--spacing-lg: 1.5rem` in `@theme`                          |
| `c18d3ba` | inter-element gaps/margins migrated to `*-sm` / `*-lg`                               |
| `3c741d5` | merge `main` (36 commits ahead, incl. UX-redesign + 5 Dependabot bumps)              |
| `4afc7d1` | handoff note (later corrected below) mis-attributing the e2e failure to `main` alone |
| _(this)_  | root-cause fix: rename `--spacing-sm/lg` → `--spacing-custom-sm/lg` and every        |
|           | generated utility (decision 053); catalog/standards updated; `pnpm gate:push` green  |

Working tree clean except one untracked scratch file (see pendings).

## Merge with main (2026-09-25)

`git merge main` produced 4 real conflicts, resolved by reapplying the spacing-token substitution to main's
current (post-UX-redesign) content rather than main's old diff:

- `app/assets/css/components/locale-switcher.css` — UX-redesign replaced the whole file (now `w-32` only, no
  pill-row structure left); took main's version as-is, nothing to migrate.
- `app/assets/css/components/experience-item.css` — kept UX-redesign's `ml-2`/`pb-8`/`::before` additions;
  applied `gap-1`→`gap-sm`, `sm:gap-6`→`sm:gap-lg` on `.experience-item` only (the rest of the file's
  `__body`/`__org`/`__bullets`/`__tags` had already auto-merged cleanly). `pb-8` left untouched on both
  `--detailed` and `--compact` per the original story's scope.
- `app/assets/css/components/education-section.css` — kept this session's continuous-timeline structure
  (`__list` has no gap anymore, `li:last-child .experience-item--compact { pb-0 }`); only `mb-6`→`mb-lg` on
  `__subtitle` still applied.
- `.claude/tasks/ACTIVE` — kept `spacing-tokens` (main's side was empty after the ux-redesign close-out).

`app/assets/css/components/meme-search.css`, `app-header.css`, `.claude/docs/catalog/styles.md`, and
`.claude/docs/standards/styling.md` auto-merged cleanly; verified their content matches the intended
resolution (token substitution kept, both sides' doc additions present). `pnpm-lock.yaml` auto-merged clean;
`pnpm install` after the merge reported "Already up to date" — no lockfile drift from the 5 Dependabot bumps.

## Gate status after the merge

- `pnpm gate` (format/lint/typecheck/unit): green both at commit time (pre-commit hook) and standalone —
  289/289 unit tests, 1 pre-existing ESLint warning (`CustomInput.vue` `modelValue` default), 0 errors.
- `nuxt build`: green.
- `pnpm test:e2e` (Playwright, 5 tests): **2 failing** — `home renders CV sections` and `search, pick and wear
a meme`, both on `expect(getByTestId('hero-image')).toBeVisible()` timing out with "Received: hidden".

### Root cause — corrected (2026-09-25)

The previous version of this handoff (commit `4afc7d1`) called this a pre-existing `main`-only Tailwind v4
dev-JIT defect and left it unfixed as out of scope. **That was wrong** and was re-verified before writing this
correction, not taken on faith:

- `pnpm gate:push` on plain `main` (no spacing-token changes at all): **5/5 e2e green**.
- `pnpm gate:push` on `main` merged with this branch's spacing-token changes: **2/5 e2e failing**, same
  `hero-image` hidden failure.

The regression is caused by this branch, not `main`. Tailwind v4 generates a utility for every key under
`--spacing-*` across **every** utility family that draws from the shared spacing scale — not just
`gap-*`/`p-*`/`m-*`, but also `w-*`, `max-w-*`, `min-w-*`, `h-*`, `inset-*`, etc. `sm`/`lg` are also
Tailwind's own default named scale keys for those other families, so decision 050's `--spacing-sm: 0.5rem` /
`--spacing-lg: 1.5rem` silently redefined what `max-w-sm` (and friends) resolve to everywhere, including
`hero-section.css`'s pre-existing, unrelated `.hero-section__figure { max-w-sm }` (the hero photo frame's
width) — collapsing it to 0.5rem instead of Tailwind's built-in container-scale value, which is why the
`hero-image` test-id resolved as hidden.

**Fix:** renamed the tokens and every generated utility this branch introduced from `sm`/`lg` to
`custom-sm`/`custom-lg` (`--spacing-custom-sm`/`--spacing-custom-lg` in `tokens.css`; `gap-custom-sm`,
`mb-custom-lg`, etc. across the same ~20 component CSS files) — full reasoning in
`.claude/docs/decisions/053-spacing-tokens-avoid-tailwind-scale-collision.md`. This is an amendment to decision
050's naming choice only; the two-tier concept, values and scope are unchanged. After the rename,
`pnpm gate:push` is green end to end, `getByTestId('hero-image')` included — see the log snippet the AI
reported alongside this commit.

## Subagents (rule 12)

| Subagent              | What it did                                                                                                                                                    | Result                                                                                                                                         |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| spacing-migration     | Grepped every component CSS file for in-scope `gap-`/`mb-`/`mt-`/`space-y-`/`space-x-` values, replaced with `-sm`/`-lg` (original naming, pre-rename)         | Done, `c18d3ba`                                                                                                                                |
| spacing-tokens-merge  | Merged `main` (36 commits ahead) into this branch, resolved 4 real conflicts by reapplying the token substitution to main's current content                    | Done, `3c741d5`; wrongly attributed the resulting e2e failure to `main` alone in its own handoff note (corrected by the main thread afterward) |
| spacing-tokens-rename | Renamed `--spacing-sm/lg` → `--spacing-custom-sm/lg` and every generated utility across ~20 files, updated docs, wrote decision 053, verified `pnpm gate:push` | Done, `1d63df4`; verified independently by the main thread (not taken on faith) before being accepted                                          |

## Review (workflow step 8, rule 09)

Review checklist (`.claude/templates/review-checklist.md`) run 2026-09-26 over the full `main...HEAD` diff:
secrets/company/giphy/PII/i18n — n/a (pure CSS token + docs change); branch correct; catalog/decisions updated
(confirmed, one stale cross-reference found and fixed — see below); gates green; contract criteria each have
named evidence above; primitives/accessibility — n/a (no template or color changes); UI pattern consistency
(16) — the whole point of this task is one consistent convention applied everywhere.

`/code-review` (medium effort) result: 1 finding — `.claude/docs/catalog/styles.md`'s spacing-token exceptions
list still cited `experience-section.css`'s `gap-8`, which no longer exists there (removed by the unrelated
`ux-redesign` timeline fix after decision 050 was written, cross-reference never updated). Fixed in this same
commit.

## Contract criteria

| #   | State | Evidence                                                                                           |
| --- | ----- | -------------------------------------------------------------------------------------------------- |
| 1   | done  | `tokens.css` defines both tokens next to `--radius-*` (now `--spacing-custom-sm/lg`, decision 053) |
| 2   | done  | ~20 component CSS files use `gap-custom-sm`/`gap-custom-lg`/`mb-custom-sm`/`mb-custom-lg`/etc.     |
| 3   | done  | `pnpm gate:push` green — 5/5 e2e passing, `getByTestId('hero-image')` included                     |
| 4   | done  | `docs/catalog/styles.md` row for `--spacing-custom-sm/lg` + decisions 050, 053                     |
| 5   | done  | `docs/standards/styling.md` covers sibling-element spacing with the `custom-sm`/`custom-lg` names  |

## Decisions taken here

- `--spacing-tight` / `--spacing-loose` rename was started in the working tree and **reverted** (2026-09-25,
  user's call): `sm`/`lg` already matches `--radius-sm/md/lg` and `--shadow-neu-sm/lg` in the same file and is
  what decision 050 records. Not revisited.
- `--spacing-sm`/`--spacing-lg` → `--spacing-custom-sm`/`--spacing-custom-lg`, and every generated utility
  renamed to match (decision 053, 2026-09-25): the plain `sm`/`lg` keys collided with Tailwind v4's own default
  spacing-scale keys shared across `w-*`/`max-w-*`/`h-*`/etc., which is what broke `hero-section.css`'s
  unrelated `max-w-sm`. This amends decision 050's naming only, not its scope or values.

## User pendings

- Delete the leftover debug spec `e2e/_debug-tmp.spec.ts` (untracked; the `delete-test` hook blocks the AI
  from removing test files).
- Push `feat/spacing-tokens` and open the PR (rule 06: push needs explicit permission, merge is user-only) —
  the branch is green end to end now, holding only on the user's explicit go-ahead to push.
