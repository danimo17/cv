# 040 · Whole repository in English

**Context.** Until now all `.claude/` documentation (rules, decisions, standards, catalog, contracts,
handoffs, `CLAUDE.md`) and code comments (`app/`, `server/`, `shared/`, `tests/`, `e2e/`) were in Catalan.
The user decided (2026-09-16) that the repo is public and everything that isn't translated natural-language
content (the actual strings in `i18n/locales/{ca,es,en}.json`, which represent the CV in 3 languages) must be
in English: file names, comments, standards, workflow, rules, decisions, everything.

**Decision.** New rule 13 (`hard-rules.md` + `rules/13-language-english.md`): every repo artifact (code,
comments, `.claude/` docs, `CLAUDE.md`, commit messages and PR messages) is written in English.
**Explicit exception:** the natural content of `i18n/locales/*.json` (the actual CV translations in
ca/es/en) stays in the 3 languages — it's the sole reason those files exist.

**Migration scope (not retroactive all at once).** Inventory done this session (`grep` for Catalan
characters) — **pending translation next session**, file by file, none skipped:

- Root: `CLAUDE.md`.
- `.claude/hard-rules.md`, `.claude/workflow.md`, `.claude/backlog.md`.
- `.claude/rules/*.md` (12 files, 01-12; this one, 13, was itself written directly in Catalan because it was
  written before the decision — it needs translating too).
- `.claude/docs/decisions/*.md` (001-040, all 40 files).
- `.claude/docs/standards/*.md` (6: components, styling, code-style, state, i18n, testing).
- `.claude/docs/catalog/*.md` (5: components, state, styles, i18n, ai-workflow).
- `.claude/templates/*.md` (contract, handoff, review-checklist, story).
- `.claude/tasks/post-launch/{story,contract,handoff}.md`.
- Code comments (full list from `grep -rlIE '[àèéíòóúçïü]' app server shared tests e2e`, ~45 files):
  `app/composables/useMessageList.ts`, `app/plugins/fontawesome.ts`, `app/ui-config/cv/sections.ts`,
  `app/stores/{hero,giphy}.ts`, `app/components/meme/{MemeSearch,MemeRecentSearches}.vue`,
  `app/components/shared/Custom{Text,Pagination,Image,Input,Icon,Badge,Marquee,Button,Link}.vue`,
  `app/components/cv/{CvDownload,ExperienceItem}.vue`, `app/data/cv/{index,experience,education,profile}.ts`,
  `app/domain/cv/{types,period}.ts`, `app/assets/css/tokens.css`, `app/assets/css/pages.css`,
  `app/assets/css/components/*.css` (custom-input, custom-link, app-footer, custom-image, experience-item,
  custom-skeleton, source-banner, custom-button, hero-section, custom-marquee, custom-text, theme-toggle,
  custom-alert, locale-switcher), `server/api/giphy/search.get.ts`, `server/utils/giphy.ts`,
  `app/services/giphy/GiphyService.ts`, `app/pages/{index,meme}.vue`, `shared/types/giphy.ts`,
  `tests/unit/stores/giphy.spec.ts`, `tests/unit/components/CustomImage.spec.ts`, `tests/arch/no-pii.spec.ts`,
  `tests/arch/docs-sync.spec.ts`, `e2e/meme-flow.spec.ts`.

**How to do it (proposal for next session, non-binding if the user prefers a different pass):** delegate by
groups to subagents in parallel (rule 12) — one for `rules/` + `hard-rules.md` + `workflow.md`, one for
`decisions/` (40 files, can be split in 2), one for `standards/` + `catalog/` + `templates/`, one for
`tasks/post-launch/`, one for code comments (verifying `pnpm gate` is green afterwards, since it touches real
`.ts`/`.vue`/`.css` files). No behavior change, text only — low risk, but `pnpm gate` must be green at the end
regardless (rule 09).

**Consequences.** No automated test checks this yet (a `tests/arch/language.spec.ts` blocking Catalan
characters outside `i18n/locales/` could be added, to consider once the migration is done). Until the
migration happens, Catalan files (`.claude/**`, comments) and the new rule 13 coexist — not a contradiction,
it's explicit pending debt, not an oversight.

**Addendum (2026-09-18, rule 11 — resolves user pending #1 from the `post-launch` handoff).** The user
decided the migration happens **before** opening the `post-launch` PR, on the same branch: avoids touching
the same files twice and lets the Review step (039) and the PR body already come out in English from the
start.

**Addendum 2 (2026-09-18, migration executed).** Done this session via 6 parallel subagents (rules+root docs,
decisions 001-020, decisions 021-039 — 040 itself translated by the main thread — standards+catalog+templates,
task story/contract, code comments split into 7 sub-groups). `handoff.md` is updated separately by the main
thread with the final status. Remaining Catalan text after this pass: proper nouns / place names in
`app/data/cv/{experience,education}.ts` (e.g. company and place names) — these are data values, not prose,
and are intentionally left as-is, same spirit as the `i18n/locales/*.json` exception.
