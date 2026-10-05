# Close checklist: spacing-tokens

Archive written after the PR was already merged: `spacing-tokens` was merged into `main` as PR #16 (`c0955ce`) under
the legacy flow, and is closed here inside the `close-workflow-redesign` branch (criterion 10 of that task). The
items below are the pre-merge-provable ones of the new template; merge and deploy facts are recorded separately
under "Post-merge facts". Verified on 2026-10-05 on branch `feat/close-workflow-redesign` at `0b2b180`, which
contains `c0955ce` (`git merge-base --is-ancestor c0955ce HEAD`).

- [x] Every acceptance criterion in `contract.md` is verified done, one by one (list them if it helps):
  - [x] 1. `app/assets/css/tokens.css` lines 6-7 define `--spacing-custom-sm: 0.5rem` and
        `--spacing-custom-lg: 1.5rem` in `@theme`, above `--radius-sm/md/lg` (lines 9-11).
  - [x] 2. `grep` over `app/assets/css`: 20 files use `custom-sm`/`custom-lg` spacing utilities (8 `gap-custom-lg`,
        21 `gap-custom-sm`, 1 `gap-x-custom-lg`, 1 `gap-x-custom-sm`, 1 `gap-y-custom-sm`, 2 `mb-custom-lg`,
        7 `mb-custom-sm`, 7 `mt-custom-lg`, 4 `mt-custom-sm`, 1 `space-y-custom-sm`); a grep for the old plain
        `gap|mb|mt|space-x|space-y` with `-sm`/`-lg` finds no match; `tests/arch/css-per-component.spec.ts` is
        green in the `pnpm gate` run below.
  - [x] 3. `pnpm gate:push` run on this checkout: build complete, `5 passed (14.1s)` e2e including
        `home renders CV sections` (hero-image check) and `search, pick and wear a meme`.
  - [x] 4. `.claude/docs/catalog/styles.md` has the `--spacing-custom-sm/lg` token row, the section "Spacing
        tokens", the decision 055 mapping table and the list of what stays raw (last changed in `13626c2`).
  - [x] 5. `.claude/docs/standards/styling.md` "Tokens" bullet lists inter-element spacing next to colors, radii
        and shadows (last changed in `13626c2`).
  - [x] 6. `pnpm audit --audit-level=high` run on this checkout: `3 vulnerabilities found`,
        `Severity: 1 low | 2 high (2 ignored)`, exit code 0 (3 `overrides` and 2 `auditConfig.ignoreGhsas` are in
        `pnpm-workspace.yaml`, commit `f3eeb38`).
- [x] `pnpm gate:push` real output confirmed green, read from the actual log (not a task-notification exit code),
      run today on `0b2b180`: format check `All matched files use Prettier code style!`, lint
      `1 problem (0 errors, 1 warning)` (the pre-existing `vue/require-default-prop` in `CustomInput.vue`),
      `Test Files  23 passed (23)`, `Tests  415 passed (415)`, nuxt build `Build complete!`, e2e
      `5 passed (14.1s)`, final `EXIT=0`. The spacing task's own last run before its merge (handoff, 2026-10-04):
      21 test files / 289 tests, build green, 5/5 e2e.
- [x] `/code-review` ran over the whole branch diff: `code-review` high effort, 2026-10-04, 5 findings (3 fixed in
      `13626c2`, 2 deferred to other stories); recorded in `## Review` below.
- [x] Every decision made during this task is written to `.claude/docs/decisions/`: `050-spacing-tokens.md`
      (added in `b4c4fac`), `053-spacing-tokens-avoid-tailwind-scale-collision.md` (`1d63df4`),
      `055-spacing-token-bucket-mapping.md` (`13626c2`), `056-audit-overrides-and-ignored-advisories.md`
      (`f3eeb38`); all four files exist on this checkout.
- [x] Every new/changed component, store, composable, token, or class is documented in
      `.claude/docs/catalog/`: tokens and mapping in `catalog/styles.md`, audit configuration in
      `catalog/ai-workflow.md` (the "Audit configuration (decision 056, 2026-10-04)" paragraph, line 182). No
      component, store or composable was created or changed.
- [x] Every relevant standard (`.claude/docs/standards/`) updated if a convention changed:
      `standards/styling.md` (see criterion 5).
- [x] No flagged/unresolved rule-11 conflict left open: the handoff's only user pending was "push the branch and
      open the PR", which happened (PR #16 merged). The audit-fix scope addition (criterion 6) was a user
      decision recorded in the contract and in decision 056. Review findings 4 and 5 were deferred by decision to
      the stories `close-workflow-redesign` (this branch) and `workflow-integrity-hardening` (still `todo`), not
      left as an unanswered question.
- [x] `.claude/backlog.md` row for this task set to `done`, pointer to PR #16 `c0955ce` and this archive.

## Post-merge facts

Not archivable before merge in the new flow, recorded here because this task closed after its merge:

- PR: [PR #16](https://github.com/danimo17/cv/pull/16), state `MERGED` at 2026-10-05T09:45:27Z, merge commit
  `c0955ced582677fb7fdcda0e4d5e857b83cb5be6` (confirmed today with `gh pr view 16`).
- CI on the PR: all 6 checks green (verified by the main thread before this close).
- Deploy after the merge: `deploy.yml` run `37292348805` for `c0955ce` completed with `success`; run
  `37293421139` for `918400f` (PR #18, the next merge) also `success` (verified by the main thread).

## Review

Pasted from the handoff's `## Review` section (workflow step 8 of the legacy flow). `code-review` effort levels and
dates are in the text: medium on 2026-09-26, high on 2026-10-04 (the high block supersedes the medium one).

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

No `code-review` pass is recorded in the handoff after the audit-fix commit `f3eeb38`; the paragraph above that
says the audit fix was not covered by the high-effort review is still true of the recorded history.

## Workflow progress

Legacy task, closed after its merge: the steps below were done under the pre-057 flow, so `close-out` is this
archive's own commit chain, not a pre-push close. The evidence points at the real commits.

- [x] story — evidence: b4c4fac (story.md and contract.md added 2026-09-22)
- [x] contract — evidence: b4c4fac (contract.md with Given/When/Then criteria, criterion 6 added 2026-10-04)
- [x] build — evidence: b4c4fac (tokens), c18d3ba (migration), 1d63df4 (rename to custom-sm/custom-lg), 13626c2 (review fixes), f3eeb38 (audit fix)
- [x] consolidate — evidence: pnpm gate on 0b2b180 (2026-10-05): Test Files 23 passed (23), Tests 415 passed (415), lint 0 errors, prettier ok
- [x] validate — evidence: handoff cc99091 records gate:push green (289 tests, build, 5/5 e2e); re-run today on 0b2b180: 5 passed e2e, pnpm audit exit 0
- [x] handoff — evidence: b826835 (handoff.md added), last updated in 0918657
- [x] commit — evidence: f3eeb38 (last spacing-tokens commit before the merge)
- [x] review — evidence: 0918657 (handoff with the 2026-10-04 high-effort code-review block)
- [x] close-out — evidence: c0955ce (merged to main; closed after merge under the legacy flow, this archive is its record)
- [x] gate-push — evidence: gate:push on 0b2b180 today: Tests 415 passed (415), Build complete, 5 passed (14.1s) e2e, EXIT=0; PR #16 CI 6 checks green
- [x] push-pr — evidence: PR #16 pushed and merged as c0955ce
