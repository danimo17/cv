# Handoff: spacing-tokens

**Branch:** `feat/spacing-tokens` · **Base:** merged with `main` at `3e9d66d` on 2026-10-04 (previously `3c52325` on 2026-09-25) ·
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
| `1d63df4` | root-cause fix: rename `--spacing-sm/lg` → `--spacing-custom-sm/lg` and every        |
|           | generated utility (decision 053); catalog/standards updated; `pnpm gate:push` green  |
| `0b09ba0` | review pass (workflow step 8), one stale catalog cross-reference fixed               |
| `85ec463` | merge `main` at `3e9d66d` (2026-10-04), no conflicts                                 |
| `cc99091` | handoff note for the 2026-10-04 merge                                                |
| `13626c2` | review fixes 1-3: decision 055 mapping, micro gaps reverted, `pages.css` migrated    |
| `0918657` | handoff update for the 2026-10-04 high-effort review                                 |
| `a5eca98` | queued two workflow stories (docs only)                                              |
| audit fix | overrides + ignored advisories, decision 056, criterion 6 (2 commits, see below)     |

Working tree clean. The debug spec `e2e/_debug-tmp.spec.ts` was deleted by the user.

## Scope addition: CI `audit` fix (2026-10-04)

User decision (rule 11, not asked again): fix the red CI `audit` job inside this branch. Advisories published
2026-10-01/02 for transitive deps (`brace-expansion`, `devalue`, `undici`, `node-forge`, `braces`) turned
`pnpm audit --audit-level=high` red on `main`-based code and on this PR, which touches no dependencies.
Contract criterion 6 added first (`contract.md`, plus a scope note in `story.md`).

- `pnpm-workspace.yaml`: 3 `overrides` (`brace-expansion@>=2.0.0 <2.1.6`, `devalue@<5.9.3`,
  `undici@>=7.0.0 <7.29.1`) and `auditConfig.ignoreGhsas` for `GHSA-86w9-cpqp-85rv` (`node-forge`, dev server
  `listhen` only) and `GHSA-vfj7-8cjw-p6xm` (`braces`, build-time globbing only). Neither has a patched version
  on npm (verified 2026-10-04: `node-forge` latest `1.4.0`, `braces` latest `3.0.3`).
- `pnpm-lock.yaml`: only `brace-expansion` 2.1.4 to 2.1.7, `devalue` 5.9.2 to 5.9.4, `undici` 7.29.0 to 7.30.0
  moved, plus the new `overrides:` block.
- Decision 056 written (with a REMOVE-WHEN per ignore); `catalog/ai-workflow.md` notes the audit config (rule 07).
- Audit output after the change: `pnpm audit --audit-level=high` exits 0, summary `3 vulnerabilities found` /
  `Severity: 1 low | 2 high (2 ignored)`.

## Merge with main (2026-10-04)

`git merge origin/main` (PRs #13 and #14: composable-store-regions, push-review-gate, task closes, rules 18/19)
completed with **no conflicts**. Main's diff since the last merge touched only `.claude/` docs/tasks/rules and the
`// #region` markers in `app/stores/giphy.ts` and `app/stores/hero.ts`; no CSS, token, `tests/arch` or lockfile
changes. Grep of `app/assets/css` found no new in-scope raw `gap-`/`mb-`/`mt-`/`space-` values introduced by main
(the remaining raw values are the documented exceptions from decision 050). `.claude/tasks/ACTIVE` still
`spacing-tokens`. Reviewed diff (`main...HEAD`) is materially unchanged, so `## Review` below stays valid.
`pnpm gate:push`: format/lint/typecheck green (1 pre-existing `CustomInput.vue` warning), 21 test files / 289
unit+arch tests passed, build green, 5/5 e2e passed.

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

2026-10-04, `/code-review` (high effort) re-run over the whole `main...HEAD` diff after the merge with `main`
at `3e9d66d` (this block supersedes the 2026-09-26 one as the fresh review). 5 findings:

- Finding 1, `pages.css` meme-page sibling spacing not migrated: fixed (`.meme-page__kicker`/`__intro`/
  `__how-title`/`__steps`/`__how-cta` now use `custom-sm`/`custom-lg`; `gap-8`, `py-*`, `.home-page` `pb-16`
  stay raw as page rhythm). Docs no longer exclude `pages.css` wholesale.
- Finding 2, two-tier rounding doubled the tightest gaps: fixed by decision 055. Micro gaps below 0.5rem stay
  raw again: `custom-badge` `gap-1`, `app-header__nav` `gap-1`, `app-footer__links` `gap-1`, `experience-item`
  base `gap-1` / `__body` `gap-1` / `__bullets` `space-y-1` / `__tags` `gap-1.5`, `hero-section__meta-item`
  `gap-1.5`, `meme-preview__meta` `mt-1`. In-range shifts (step 3 to 0.5rem, step 4 to 1.5rem) are now stated.
- Finding 3, ambiguous bucket rule in the catalog: fixed (decision 055 plus an unambiguous step-to-token table
  in `catalog/styles.md`, exceptions list re-verified against the CSS, `standards/styling.md` aligned).
- Finding 4, `ACTIVE` left set on `main` forces a second close PR: not fixed here, deferred to the queued story
  `close-workflow-redesign` (backlog row exists).
- Finding 5, push gate accepted the stale pre-merge review: not fixed here, deferred to the story
  `workflow-integrity-hardening` (review-freshness gate; this block is itself the fresh review).

Review checklist items for this re-run: secrets/company/giphy/PII/i18n n/a (CSS and docs only); branch correct;
catalog, standards, decision 055 and contract updated in the same change (rule 07); UI consistency (16) is the
purpose of decision 055, every migrated and reverted utility derived mechanically from a diff against
`origin/main`; `pnpm gate:push` green after the fixes.

Review of the audit fix (added after the blocks above): the commit(s) for contract criterion 6 (`pnpm-workspace.yaml`,
`pnpm-lock.yaml`, decision 056, `catalog/ai-workflow.md`) were added AFTER the high-effort `/code-review` block
above, are dependency/config-only, and are not covered by it. They need their own fresh review before merge; whether
to run `/code-review` again is the user's call.

## Contract criteria

| #   | State | Evidence                                                                                           |
| --- | ----- | -------------------------------------------------------------------------------------------------- |
| 1   | done  | `tokens.css` defines both tokens next to `--radius-*` (now `--spacing-custom-sm/lg`, decision 053) |
| 2   | done  | ~20 component CSS files use `gap-custom-sm`/`gap-custom-lg`/`mb-custom-sm`/`mb-custom-lg`/etc.     |
| 3   | done  | `pnpm gate:push` green — 5/5 e2e passing, `getByTestId('hero-image')` included                     |
| 4   | done  | `docs/catalog/styles.md` row for `--spacing-custom-sm/lg` + decisions 050, 053                     |
| 5   | done  | `docs/standards/styling.md` covers sibling-element spacing with the `custom-sm`/`custom-lg` names  |
| 6   | done  | `pnpm audit --audit-level=high` exit 0 (2 high ignored per decision 056) + `pnpm gate:push` green  |

## Decisions taken here

- `--spacing-tight` / `--spacing-loose` rename was started in the working tree and **reverted** (2026-09-25,
  user's call): `sm`/`lg` already matches `--radius-sm/md/lg` and `--shadow-neu-sm/lg` in the same file and is
  what decision 050 records. Not revisited.
- `--spacing-sm`/`--spacing-lg` → `--spacing-custom-sm`/`--spacing-custom-lg`, and every generated utility
  renamed to match (decision 053, 2026-09-25): the plain `sm`/`lg` keys collided with Tailwind v4's own default
  spacing-scale keys shared across `w-*`/`max-w-*`/`h-*`/etc., which is what broke `hero-section.css`'s
  unrelated `max-w-sm`. This amends decision 050's naming only, not its scope or values.

- Explicit step-to-token mapping (decision 055, 2026-10-04): raw steps 2-3 to `custom-sm`, 4-6 to `custom-lg`;
  micro gaps (0.5-1.5) and gaps from step 8 up stay raw; padding is never migrated. Amends decision 050's scope
  text only. Also migrated the in-range `gap` utilities in `custom-button.css`/`custom-input.css` that the old
  "control padding" exception had over-covered.

- Audit overrides and two ignored advisories (decision 056, 2026-10-04): 3 `overrides` plus
  `auditConfig.ignoreGhsas` for `node-forge` and `braces`, which have no patched version on npm. Re-evaluate the
  ignores when upstream publishes a fix.

## User pendings

- Push `feat/spacing-tokens` and open the PR (rule 06: push needs explicit permission, merge is user-only) —
  the branch is green end to end now, holding only on the user's explicit go-ahead to push.
