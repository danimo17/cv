# Handoff: ux-redesign

## Update 2026-09-25 — branch was orphaned, now closed out, ready for PR

This branch had **13 commits done since 2026-09-22 (both phases) but was never pushed or opened as a PR** —
a later session branched `feat/spacing-tokens` straight from `main`, silently skipping this branch entirely.
Found only because the user asked where the button/timeline work had gone. See
`.claude/tasks/workflow-integrity-hardening/story.md` for the process fix queued to stop this happening again.

Since then, closed real gaps found while reviewing before push:

- `e2e/meme-flow.spec.ts` still clicked the submit button `meme-search-copy` (Phase 2) removed — fixed to wait
  on the debounced auto-search result instead (`c660521`).
- Criterion 10's continuous-timeline-line fix only reached `ExperienceItem`'s `--detailed` variant;
  `EducationSection` reuses the same component `--compact` (twice) and still had the old per-item gap —
  applied the same fix there (`bd2c321`).
- The timeline dot was bleeding past the page's horizontal padding (`-left-[9px]` wasn't centered on the
  border and the item had no inset of its own) — fixed (`bd2c321`, same commit).
- "Certificacions" subtitle had a one-off icon with no precedent anywhere else in the project (rule 16, new
  this session: UI pattern consistency) — removed per the user's call (`997695e`).
- New rule 16 written directly into the project; two follow-up tasks queued
  (`.claude/tasks/workflow-integrity-hardening/`, `.claude/tasks/css-tailwind-first/`) — not part of this
  branch's scope, don't pull their work in here.

`pnpm gate:push` confirmed green (real exit code, re-verified — an earlier run this session reported exit 0
via a wrapper bug while the actual `pnpm` command had failed; don't trust that notification path blindly,
check the log tail). All 17 contract criteria now genuinely done. Ready to push and open the PR.

---

_Updated: 2026-09-22. **Phase 1 is DONE and committed** (7 commits, `f04244e`..`ceaeff6`): the 6 feature
commits plus one consolidation commit for i18n/catalog/standards + decision 044 (header-nav's flagged
sunken-vs-raised active-nav conflict, resolved, not left open). `pnpm gate` green after every commit. The
`e2e/meme-flow.spec.ts:80` locale-testid breakage is fixed. One correction to the agents' reports: `nav.brand`
was NOT removed from the locales — `app/app.vue:7`'s `titleTemplate` still reads it, contrary to `header-nav`'s
"unused" claim; verified via grep before deleting anything.

Phase 2 dispatched now (`timeline-experience`, `cv-content-fixes`, both backgrounded, running in parallel) —
see "Phase 2 dispatch log" below. Once they report back: same consolidation pattern (apply their i18n/catalog
notes, `pnpm gate`, commit), then the full review pass before PR.

Also noted, out of scope for this task: the repo currently has 5 open PRs, all Dependabot dependency bumps
(#4-8) — 4 of them are major-version bumps (vitest 4→5, eslint 9→10, vue-router 4→5, typescript 5.9→6.0.3).
Not leftover work from any task, but risky to merge blindly; flagged to the user, no action taken here.

## Phase 2 dispatch log (2026-09-22)

Dispatched after Phase 1 landed and gate was green, per `contract.md`'s assignment table:

- **`timeline-experience`** (criteria 10, apply 13): make the experience timeline's connecting line continuous
  across the whole list instead of breaking at each item's `gap-8`, and apply the new `h4`-`h6` `CustomText`
  variants to `ExperienceItem.vue`'s title (currently `variant="body"` despite being an `<h3>` — the actual bug
  behind both the timeline items and certifications looking flat, since certifications render through the same
  component). Scope: `ExperienceItem.vue`, `ExperienceSection.vue` + their CSS. Reserve decision number 047 if a
  real decision is needed (heading-level mapping is expected to be uncontroversial, per contract.md's "Open
  questions").
- **`cv-content-fixes`** (criteria 6, 7, 9, 11, 12, apply 13 elsewhere): drop "Shopify" from descriptive
  copy (job-history tags like "Shopify Plus" stay) in favour of a frontend-framework mention, in all 3 locales;
  add a typed `workMode: 'hybrid' | 'remote'` field to `profile.ts` (+ type) shown on the hero, replacing the
  bare `hero.location` string; swap `'ml'` for `'pastisseria'` in interests; Santander entry org line →
  "Santander" only, location → "Remote"; certifications (cambridge, esplai-cert, amaltea) → delete the
  redundant `note` field (identical to `org`) so they render 2 lines not 3; apply the remaining heading-scale
  variant wherever criterion 13 still needs it outside `ExperienceItem` (hero name, section titles, org line).
  Scope: `profile.ts`, `education.ts`, `HeroSection.vue`, `EducationSection.vue` + CSS. Reserve decision 048 if
  needed.

Both told explicitly, per the Phase 1 pattern: do NOT touch `i18n/locales/*.json` or
`.claude/docs/catalog/*.md`/`.claude/docs/standards/*.md` — report the exact key/value or doc block instead,
main thread consolidates once both are back.

## Phase 1 log (superseded by the above — kept for background only)

## ⚠️ Read this first (next session)

1. **Working tree has live, uncommitted, unverified edits right now** — `git status --short` shows ~18
   modified files + 2 new test files. ALL 6 Phase-1 agents are DONE with full reports below (`header-nav`,
   `footer`, `customtext-headings`, `elevation-cards`, `meme-search-copy`, `controls-dropdown`). No agent is
   running. Nobody has run `pnpm gate` on the combined result yet.
2. **Apply the i18n/catalog/styles.md consolidation first** — every completed agent's report below lists the
   exact key/value or doc-block text it needs; none of them touched `i18n/locales/*.json` or
   `.claude/docs/catalog/*.md`/`.claude/docs/standards/*.md` themselves (deliberate, to avoid 6 parallel agents
   racing on the same shared files) — go through each report in order and apply its listed changes.
3. **One unresolved design conflict flagged by `header-nav`** (see its report below) needs a decision or
   `styles.md` update before this task can be considered done — not just a nice-to-have, real rule-11 debt.
4. **One broken e2e test flagged by `controls-dropdown`**: `e2e/meme-flow.spec.ts:80` targets
   `getByTestId('locale-ca')`, a per-locale pill that no longer exists now the switcher is one `<select>` —
   needs to become something like `page.locator('[data-testid="locale-switcher"] select').selectOption('ca')`.
   Fix this as part of consolidation, don't discover it for the first time when `gate:push`'s e2e run fails.
5. Decision `043-locale-switcher-dropdown.md` was already written by `controls-dropdown` directly (no
   conflict risk, unique filename) — nothing to do there, just know it exists.
6. Only THEN run `pnpm gate`, fix anything red, and commit — probably as a few grouped, human-reviewable
   commits (e.g. one for the consolidation + each independent feature area), not one giant commit.

## Phase 1 dispatch log (2026-09-20, rule 11 — documented as it happens)

Main thread did direct research first (read `LocaleSwitcher.vue`, `CustomInput.vue`, `CustomCard.vue`,
`CustomText.vue`, `CustomSection.vue`, `ExperienceItem.vue`, `education.ts`, `profile.ts`, `HeroSection.vue`,
`MemeSearch.vue`, `meme.vue`, relevant CSS) to ground each subagent with exact file paths and found patterns
instead of letting them re-discover the codebase — see contract.md's "Subagent assignments" table for the
phase/scope split. Key things found that changed the original plan:

- **Locale switcher (criteria 4/5)**: `CustomInput` already has a `type="select"` that's restyled,
  non-native-looking, and already `h-10` — almost certainly the right fix is "make `LocaleSwitcher` render a
  `CustomInput type="select"`", NOT build a brand-new dropdown component/type. Told the agent to verify and
  default to this unless it finds a real blocker.
- **Heading scale (criterion 13)**: `CustomText` already has `h1`/`h2`/`h3` variants; only `h4`-`h6` are
  missing. The actual visible bug is `ExperienceItem.vue`'s title using `variant="body"` (not a heading
  variant at all) despite being an `<h3>` tag — which is why certifications (same component) look flat. Split
  into: one agent adds the missing `h4`-`h6` variants only (Phase 1, no consumers touched yet); a Phase-2
  agent applies the right variant to `ExperienceItem`'s title (fixes timeline items AND certifications at
  once, since certifications render through the same component).
- **Certifications 2-line fix (criterion 12)**: pure data fix, no template change — `education.ts`'s
  certification entries have a `note` field that duplicates the `org` field verbatim; `ExperienceItem.vue`'s
  template already only renders `note` `v-else-if` it's present, so deleting the redundant `note` values
  collapses 3 lines to 2 with zero code change. Folded into the Phase-2 `cv-content-fixes` agent.
- **Work-mode field (criterion 7)**: `hero.location` today is a bare i18n string, not data-driven. Plan: a
  `workMode: 'hybrid' | 'remote'` literal field on `profile.ts` (+ a type, wherever `TimelineItem` etc. live
  in `app/domain/cv/types.ts`), two i18n keys selected by that field — no new store, no over-modeling.
- **i18n and catalog/standards docs are NOT edited by any subagent** — each reports the exact key/value or
  doc block it needs; main thread consolidates once per phase. This is the concurrency-safety call: 6 parallel
  agents all touching the same 3 locale JSON files or the same catalog markdown file would race. Subagents DO
  own their own new decision files (unique filenames, no collision risk) and their own tests.

Phase 1 agents dispatched (all backgrounded, running in parallel): `header-nav` (criteria 1-2),
`controls-dropdown` (3-5, decision number 043 reserved), `elevation-cards` (8, 15), `footer` (14),
`meme-search-copy` (16-17), `customtext-headings` (13, primitive only).

## Next (once Phase 1 agents report back)

1. Apply each agent's reported i18n key/value changes to `i18n/locales/{en,ca,es}.json` and catalog/standards
   doc blocks (main thread only, see above).
2. Run `pnpm gate`, fix anything red, commit Phase 1 (likely one commit per agent's scope, or a couple of
   grouped commits — human-reviewable, not one giant commit).
3. Dispatch Phase 2: `timeline-experience` (criterion 10 + apply heading scale to `ExperienceItem`, decision
   047 reserved if needed) and `cv-content-fixes` (criteria 6, 7, 9, 11, 12 + remaining heading-scale
   application, decision 048 reserved if needed) — both need Phase 1's `customtext-headings` work landed
   first (they consume the new `h4`-`h6` variants).
4. Same consolidation + gate + commit for Phase 2.
5. Full review pass (`templates/review-checklist.md` + `/code-review`) over the whole branch diff before
   push/PR, per decision 039's timing (right before the PR, not before the first commit).

## Completed agent reports (verbatim-ish, NOT yet applied to i18n/catalog — apply before doing anything else)

### `header-nav` (criteria 1-2) — DONE, files already in working tree

Changed `AppHeader.vue` + `app-header.css`: removed the "Daniel Morales" brand `CustomLink` (nav/tools now
land left/right naturally via the existing `justify-between`). Active-link look: used `CustomLink`'s
`activeClass` prop to point at a new header-local `.app-header__link--active` class (raised `shadow-neu-sm`
chip) instead of the primitive's default sunken active style, to avoid editing `custom-link.css` outside its
assigned scope. Lint/typecheck clean.

**⚠️ Flagged conflict, unresolved**: `docs/standards/styling.md` documents "active nav" as an inset/sunken
look owned by `custom-link.css`, and says a primitive's look is "changed in the primitive's CSS, never the
consumer's." This change deliberately overrides that per-consumer via `activeClass` (a legitimate, already-
existing escape hatch) because criterion 1 explicitly wants a non-sunken header treatment. **This needs either
a decision entry or a `styles.md` update before this can be considered settled** — do this before closing the
task, it's real, unresolved rule-11 debt, not just a note.

**i18n to apply** (all three locale files, under the existing `"nav"` object):

- `nav.home` → `"Home"` in en/ca/es (en already correct; ca was `"Inici"`, es was `"Inicio"`)
- `nav.meme` → `"Meme"` in en/ca/es (en was `"Meme mode"`, ca was `"Mode meme"`, es was `"Modo meme"`)
- `nav.brand` is now unused in all 3 locales (the template no longer reads it) — remove it, or confirm nothing
  else references it first (`grep -rn "nav.brand" app/ i18n/ tests/ e2e/`).

**Catalog to apply**: `.claude/docs/catalog/components.md`'s `AppHeader` entry (if one exists) — its "active
state `.custom-link--active`" line is now stale, update to describe `.app-header__link--active` instead.

### `footer` (criterion 14) — DONE, files already in working tree

Changed `AppFooter.vue` (added `const year = computed(() => new Date().getFullYear())`, replaced
`t('footer.built')` with `t('footer.copyright', { name: profile.name, year })`) — no CSS changes needed, no
new classes. Source/social links untouched. No test file added (none existed for layout components; agent
judged it low-stakes/scope-creep per ponytail — your call to add one). Lint/typecheck clean.

**i18n to apply** (identical in all 3 locales — it's just the © symbol + placeholders):

- `footer.copyright` → `"© {name} {year}"` (en/ca/es all identical)
- `footer.built` is now unused — remove from all 3 locales (confirmed no other reference exists anywhere in
  `app/`, `i18n/`, `tests/`, `e2e/`)
- `footer.source` stays, still used.

**Catalog**: no new class, likely nothing to update beyond confirming `AppFooter`'s catalog entry (if any)
still matches.

### `customtext-headings` (criterion 13, primitive only) — DONE, files already in working tree

Added `h4`/`h5`/`h6` to `CustomText`'s `TextVariant` type and `custom-text.css`, continuing the exact h1→h3
step pattern:

```css
.custom-text--h4 {
  @apply text-lg font-semibold sm:text-xl;
}
.custom-text--h5 {
  @apply text-base font-medium sm:text-lg;
}
.custom-text--h6 {
  @apply text-sm font-medium sm:text-base;
}
```

(Full scale: h1 `text-3xl/font-extrabold/sm:text-5xl` → h2 `text-2xl/font-bold/sm:text-3xl` → h3
`text-xl/font-semibold/sm:text-2xl` → h4/h5/h6 as above.) New `tests/unit/components/CustomText.spec.ts`
created (16/16 passing) — didn't exist before. No new props, no heading-auto-mapping helper. Lint/typecheck/
tests all clean.

**Catalog to apply**: `.claude/docs/catalog/components.md`'s `### CustomText` block, `variant` row becomes:

```
| `variant`  | `'display' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'lead' | 'body' | 'small' | 'caption' | 'eyebrow'` | `'body'`    | `.custom-text--<variant>` (default size + weight, see `styles.md`) |
```

And `.claude/docs/catalog/styles.md` (wherever the `custom-text--*` size/weight table lives) gets 3 new rows
for `.custom-text--h4`/`h5`/`h6` with the classes above.

**No i18n needed for this one.**

### `elevation-cards` (criteria 8, 15) — DONE, files already in working tree

Only ONE file touched: `app/assets/css/components/meme-card.css` (`.meme-card`'s hover shadow changed from
`hover:shadow-neu-lg` to `hover:shadow-neu-inset`, so the meme "swap" tile presses in on hover, matching the
`hover:`/`active:` pattern already used in `theme-toggle.css`). Investigated criterion 8's "sunken when
nested" rule and found **zero current nested-`CustomCard` call sites in the whole codebase** (`CustomCard` is
only used in `meme.vue`'s "how it works" card and `MemePreview.vue`, neither nested) — so there's nothing to
fix there today; `CustomCard.vue`'s existing `variant` prop already provides the mechanism for whenever
nesting shows up, no new abstraction added (correctly, per ponytail — don't build for a case that doesn't
exist yet). `MemeCard` was deliberately NOT migrated to wrap `CustomCard` — it needs button semantics
(`CustomButton` already provides that, `CustomCard` doesn't), decision `026-custom-primitives.md` already
documents `MemeCard` = `CustomButton`, and it already reuses the same `shadow-neu-*` tokens, so criterion 15's
bar ("same tokens, same raised/sunken logic") is met without a structural rewrite. `MemeGrid.vue` has no
elevation CSS to migrate (layout-only).

**No i18n needed.** **No decision file** (nothing beyond what decisions 025/026 already settled).

**Catalog to apply** — `.claude/docs/catalog/styles.md`: the raised/pressed shadow table's meme-card row
needs "hover `neu-lg`" changed to "hover `neu-inset`" in two places (the tone-table summary line and the
`.meme-card` component row) — agent gave exact before/after text, read its full report via this session's
transcript if the exact wording matters, or just verify the CSS change against the current styles.md text
and update to match. No `CustomCard` catalog changes needed (props unchanged).

Verified: `pnpm lint` clean, `MemeCard.spec.ts` 4/4 passed, `tests/arch/css-per-component.spec.ts` +
`docs-sync.spec.ts` 135/135 passed, manually checked `/meme` in the Browser pane (hover fires, no console
errors). `pnpm typecheck` fails ONLY on `LocaleSwitcher.vue` — confirmed as the concurrent `controls-dropdown`
agent's in-progress file, not caused by this agent.

### `meme-search-copy` (criteria 16-17) — DONE, files already in working tree

Changed `MemeSearch.vue`: removed the submit button entirely, kept `<form @submit.prevent>` as an Enter-key
no-op safety net, debounce via plain `watch` + `setTimeout`/`clearTimeout` (1500ms after last keystroke, timer
cleared on `onBeforeUnmount`, no new dependency). The `loading` state now shows as a small pulsing text label
(`data-testid="meme-search-loading"`, new `.meme-search__status` class in `meme-search.css`) instead of a
button spinner, since there was no spinner icon registered and adding one was out of scope. Added a
"See it on the home page" button to the "how it works" card in `meme.vue` (new `.meme-page__how-cta` class in
`pages.css`) reusing the EXISTING `meme.goHome` i18n key rather than duplicating it. Rewrote
`tests/unit/components/MemeSearch.spec.ts` with fake timers — 5/5 passing, no reference to the removed button.

**i18n to apply**:

| Key                                          | EN                                                                   | ES                                                                   | CA                                                                      |
| -------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `meme.title` (h1)                            | `Swap your face`                                                     | `Cambia tu cara`                                                     | `Canvia la teva cara`                                                   |
| `meme.how.steps[0]`                          | `Search for a meme using any word — cat, monday, whatever you like.` | `Busca un meme con la palabra que quieras: gato, lunes, lo que sea.` | `Cerca un meme amb la paraula que vulguis: gat, dilluns, el que sigui.` |
| `meme.how.steps[1]`                          | `Pick your favorite from the results.`                               | `Elige tu favorito entre los resultados.`                            | `Tria el teu preferit entre els resultats.`                             |
| `meme.how.steps[2]`                          | `Your photo on the home page turns into that meme.`                  | `Tu foto en la página de inicio se convierte en ese meme.`           | `La teva foto a la pàgina d'inici es converteix en aquest meme.`        |
| `meme.how.steps[3]`                          | `Reload the page whenever you want your real photo back.`            | `Recarga la página cuando quieras recuperar tu foto real.`           | `Recarrega la pàgina quan vulguis recuperar la teva foto real.`         |
| `meme.search.searching` (new, loading label) | `Searching…`                                                         | `Buscando…`                                                          | `Cercant…`                                                              |

`meme.how.title` needs no change (already plain-language). `meme.search.button` is now unused — remove from
all 3 locales (confirmed via grep, no remaining references anywhere).

**No decision file needed.**

Verified: `pnpm lint` clean, `MemeSearch.spec.ts` 5/5 passed. `pnpm typecheck` shows 2 errors, both in
`LocaleSwitcher.vue` (confirmed as the `controls-dropdown` agent's in-progress file, not this one's).

### `controls-dropdown` (criteria 3-5) — DONE, files already in working tree

`LocaleSwitcher.vue` now renders one `CustomInput type="select" hide-label` bound to `useI18n().locale`, via
`:model-value`/`@update:model-value` (not plain `v-model`, since a selection must navigate through
`useSwitchLocalePath()` + `navigateTo()`, same mechanism the old per-link version used) — replaces the old row
of 3 `CustomLink` pills entirely. `locale-switcher.css` shrank to one rule (`w-32` layout width only — no more
per-item/active classes, that visual moved into `CustomInput` itself). `custom-input.css` gained a CSS-only
chevron for `type="select"` (`.custom-input--select .custom-input__field::after`, same border-trick already
used for the checkbox tick — no new icon/dependency). Pattern picked: native `<select>` (ladder: native
feature > new component) — already has keyboard/focus/screen-reader semantics for free, and 3 plain-text
options don't need anything fancier. Verified live in-browser: switching to Spanish actually navigates to
`/es` and translates. `ThemeToggle`/`CustomButton` height confirmed already correct (both `40px`, verified via
computed styles in-browser) — no change needed there, as expected.

**No i18n changes needed** — `locale.switch` key reused as-is (now feeds the hidden `<label>` instead of the
old `aria-label`); option text comes from `locales[].name` in `nuxt.config.ts`, not i18n.

**Catalog to apply** — replace the `### LocaleSwitcher` block in `.claude/docs/catalog/components.md` with:

> `CustomInput type="select"` bound to `useI18n().locale`; on change, navigates via `useSwitchLocalePath()` +
> `navigateTo()` (not plain `v-model`). Options are `locales[].name` from `nuxt.config.ts`.
> `data-testid="locale-switcher"` on the outer root. No props, no slots, no events. Classes: `.locale-switcher`
> (`w-32`, layout width only — look is `CustomInput`'s, per decision 026). Consumer: `AppHeader`.

Also append a bullet to `### CustomInput`'s variants/classes noting the new chevron
(`.custom-input--select .custom-input__field::after`, CSS-only, `select` type only).

In `.claude/docs/catalog/styles.md`: the `.locale-switcher` row (was ~line 143) is stale — it described a
bespoke track/pill look that no longer exists (now just `w-32`, the control itself is `CustomInput`'s standard
inset control). Also `docs/standards/styling.md` lines ~20/32/34 mention "active locale-switcher item" /
"tracks (locale switcher...)" as bespoke elevation examples — also stale, remove/update those mentions.

**Decision already written** (not by main thread, no conflict): `.claude/docs/decisions/043-locale-switcher-dropdown.md`
covers the select-vs-listbox call, hide-label, full-name options, `w-32` width, and the chevron.

**⚠️ Broken e2e test flagged**: `e2e/meme-flow.spec.ts:80` does `page.getByTestId('locale-ca').click()` — that
per-locale `data-testid` no longer exists. Fix before `pnpm gate:push`'s e2e run hits it cold — something like
`page.locator('[data-testid="locale-switcher"] select').selectOption('ca')`.

Verified: `pnpm lint`, `pnpm typecheck`, `pnpm exec prettier --check` on touched files, and
`pnpm vitest run tests/unit/components/CustomInput.spec.ts tests/arch/css-per-component.spec.ts` all pass (135
tests). No new `LocaleSwitcher.spec.ts` — matched existing precedent that no `layout/` component has a unit
test (ThemeToggle/AppHeader/AppFooter are manual/e2e-only); the existing `select` case in `CustomInput.spec.ts`
already covers the reused type.

## Picked up from `deploy-secrets-order` (2026-09-20)

That task fixed a silent production deploy failure (PR #2 merged, CI green, but `deploy.yml` itself failed on
Cloudflare error 10215 — unnoticed for 2 days) and closed the process gap that let it go unnoticed: **decision
042** now makes a post-merge deploy check mandatory before any task can be closed. This branch inherits that
via the rebase; it applies to this task too once its PR eventually merges — see `workflow.md` step 12
("Verify deploy") and `templates/handoff.md`'s "Post-merge deploy check" section, and remember to fill that
section in on this task's own handoff once it merges.

## Status history (superseded — kept for background only, see the top of this file for REAL current state)

Earlier today: task was pure scaffolding (`story.md`/`contract.md` written, zero code). Two points were
grilled with the user and resolved then: **branch strategy** (own branch, not bolted onto `post-launch`) and
**theme toggle** (stays a toggle, only resized — does NOT become a second dropdown). Both still stand, nothing
new to decide there. Everything below this point in the file describing "no code written yet" or "what to do
next session" in general terms is now STALE — Phase 1 is 5/6 done, see the top of the file and "Completed
agent reports" above for what's actually true right now. The step-by-step process guidance below (read the
docs in order, delegate to subagents by chunk, document as you go, run gate before commits, never push without
per-push permission) is still generically correct and worth skimming once, just don't take "nothing built yet"
literally.

## The 17 criteria (full detail in `contract.md`) — quick index for picking up work

1. Header: no "Daniel Morales" brand text, nav on the left, active-link style changed from the pressed-pill
   look (still neumorphic, just header-appropriate).
2. `nav.home`/`nav.meme` → literal "Home"/"Meme" in all 3 locales (not translated).
3. Every control (buttons, inputs, locale switcher, theme toggle) shares one height (`h-10`).
4. Locale switcher becomes a custom (non-native) dropdown.
5. That dropdown is a new `CustomInput` type, documented like every other type (rule 07).
6. "Shopify" out of descriptive/summary copy → "Frontend" + "Vue, Nuxt and all the frontend frameworks"
   (tags like "Shopify Plus" in job history stay — they're facts, not descriptive prose).
7. New structured work-mode field: on-site/hybrid (Girona area) or remote (worldwide) — not free text.
8. Elevation: raised by default; sunken only when nested inside another raised card; meme "swap" presses in
   on hover.
9. Interests: drop `'ml'`, add `'pastisseria'`.
10. Timeline: continuous connecting line across the whole list, not per-item with gaps (research confirms
    `ExperienceItem.vue`'s `::before` dot + `border-l-2` is per-item today — `experience-section.css`'s
    `gap-8` between items visibly breaks the line).
11. Santander entry: org line → "Santander" only (title keeps "Santander X Explorer"), location → "Remote".
12. Certifications (cambridge, esplai-cert, amaltea): 2 lines, not 3 — today's org line and note line are
    identical text, duplicated.
13. New `h1`-`h6` scale in `CustomText`, applied per structural data level (hero name, section titles,
    timeline item titles, org line) — fixes certifications' inconsistent title styling as a side effect.
14. Footer: copyright + year (new), drop the "Built with Nuxt 4, Tailwind, Pinia and a bit of AI" line.
15. Meme cards (`MemeCard`/`MemeGrid`) switch from their bespoke CSS to the same elevation system as
    criterion 8.
16. Meme "How it works": no technical detail, plain-language explanation of the game/effect, add a button to
    `/` to see the swapped hero image.
17. Meme search: remove the submit button, auto-search after 1.5s of typing inactivity (debounce); page
    `<h1>` stops saying "Meme mode" (something like "Swap face" instead) — nav link still says "Meme"
    (criterion 2).

## Also fixed this session, on this same theme, but NOT part of this contract (already done, on `feat/post-launch`)

The user separately asked mid-session for the `SourceBanner` marquee to have its whole text clickable (not
just "danimo17/cv"). That was small enough to fix inline immediately — it's already committed on
`feat/post-launch` (`3fbfbdd`), not here. Don't redo it.

## Standards to consult

- `.claude/docs/standards/{components,styling,state,i18n,testing}.md`
- `.claude/docs/catalog/{components,styles,i18n}.md`
- `.claude/docs/decisions/025-neumorphism.md`, `026-custom-primitives.md`, `003-meme-picker.md`,
  `004-meme-state-memory-only.md`, `010-home-sections.md`, `011-visual-style.md`

## Pending on the user

None blocking yet. The three original "Open questions" in `contract.md` are now resolved (dropdown pattern →
decision 043; copy wording → drafted by `footer`/`meme-search-copy`, listed in their reports above, not yet
written into the locale files; heading-level mapping → mostly resolved by `customtext-headings` + the
Phase-2 plan for `ExperienceItem`/hero/org lines, see "Phase 1 dispatch log" above). One thing genuinely
needs a call before this task closes: `header-nav`'s flagged conflict with `docs/standards/styling.md`'s
documented "active nav is sunken" rule (point 3 in "Read this first" above) — that's an engineering/standards
call to make while consolidating, not something to escalate to the user unless it turns out to be more
contentious than it looks once you're in the file.
