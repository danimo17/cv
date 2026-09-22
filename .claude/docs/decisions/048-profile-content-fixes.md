# 048 · Profile content fixes: work-mode field, Shopify wording, Santander split

**Context.** Phase 2 of `ux-redesign` (criteria 6, 7, 9, 11, 12) touches several small pieces of copy and
data in `app/data/cv/profile.ts` and `app/data/cv/education.ts`. Three of them carry a real judgement call
rather than a mechanical fix, so they're logged here per rule 11 instead of being silently decided.

**Decision — `workMode` default value (criterion 7).** `profile.ts` gains a real typed field,
`workMode: WorkMode` (`WorkMode = 'hybrid' | 'remote'`, added to `app/domain/cv/types.ts` next to `Section`),
read directly by `HeroSection.vue` to pick between two new i18n keys (`hero.location.hybrid` /
`hero.location.remote`), replacing the old free-text `hero.location` key. The value is set to `'hybrid'`: the
current copy already leads with "Banyoles, Girona" as the primary location, and the `hybrid` copy itself
still mentions "or remote" so no signal is lost — the field expresses the primary/default mode, not an
exclusive choice. Switching to `'remote'` later is a one-line data change with no code change, which is the
point of making it a real field instead of baked-in prose.

**Decision — Shopify wording replacement (criterion 6).** "Shopify" appears in two pieces of descriptive
copy beyond `hero.tagline` (which the contract named explicitly): the SEO `meta.description` key in all 3
locales also lists "(Vue, Nuxt, Shopify)" as a parenthetical of frontend stacks. Both are descriptive/summary
prose (not job-history tags, which stay untouched per the contract's own carve-out), so both get the same
treatment: "Shopify" → "all the frontend frameworks", keeping "Vue, Nuxt" as the concrete anchor. Exact
strings are in the handoff report; `app/data/cv/experience.ts`/`stack.ts` tags ("Shopify Plus", "Shopify")
and the `experience.items.*.title` job titles ("Shopify Developer") are untouched — those are factual
job-history data, out of this criterion's scope and out of this subagent's file scope (`experience.ts`
belongs to the `timeline-experience` Phase 2 agent).

**Decision — Santander org/location split (criterion 11).** `education.ts`'s `santander` entry's `org` field
changes from `'Santander X Explorer'` to `'Santander'` (the programme's parent institution), and gains
`location: 'Remote'` (the `TimelineItem.location` field already exists and is already used as plain,
untranslated data for other entries — `'Girona'`, `'Salt'`, `'Daejeon'` — so `'Remote'` follows the same
pattern, no i18n key). The full programme name "Santander X Explorer" is preserved as-is in the
`education.items.santander.title` i18n key (unchanged) — the contract explicitly asked for the title to stay
intact and only the org line to shorten.

**Consequences.** `HeroSection.vue` now reads `profile.workMode` to select the i18n key; changing the
person's actual work-mode preference in the future is a one-line data edit. The certifications `note`
removal (criterion 12) and the `'ml'` → `'pastisseria'` interest swap (criterion 9) are mechanical
(confirmed redundant/unused by grep and by reading `ExperienceItem.vue`'s template) and don't need a
decision entry.
