# 040 · Tot el repositori en anglès

**Context.** Fins ara tota la documentació de `.claude/` (regles, decisions, estàndards, catàleg, contractes,
handoffs, `CLAUDE.md`) i els comentaris del codi (`app/`, `server/`, `shared/`, `tests/`, `e2e/`) estaven en
català. L'usuari ha decidit (2026-09-16) que el repo és públic i tot el que no sigui contingut en llenguatge
natural traduït (les cadenes reals de `i18n/locales/{ca,es,en}.json`, que representen el CV en 3 idiomes) ha
d'estar en anglès: noms de fitxer, comentaris, estàndards, workflow, regles, decisions, tot.

**Decisió.** Regla nova 13 (`hard-rules.md` + `rules/13-language-english.md`): tot artefacte del repo
(codi, comentaris, docs de `.claude/`, `CLAUDE.md`, missatges de commit i de PR) es escriu en anglès.
**Excepció explícita:** el contingut natural de `i18n/locales/*.json` (les traduccions reals del CV en
ca/es/en) es manté en els 3 idiomes — és l'única raó de ser d'aquests fitxers.

**Abast pendent (migració, no retroactiva de cop).** Inventari fet aquesta sessió (`grep` de caràcters
catalans) — **pendent de traduir a la propera sessió**, arxiu per arxiu, sense deixar-ne cap:

- Root: `CLAUDE.md`.
- `.claude/hard-rules.md`, `.claude/workflow.md`, `.claude/backlog.md`.
- `.claude/rules/*.md` (12 fitxers, 01-12; aquest mateix, 13, ja es redacta directament en català perquè es va
  escriure abans de la decisió — cal traduir-lo també).
- `.claude/docs/decisions/*.md` (001-040, els 40 fitxers).
- `.claude/docs/standards/*.md` (6: components, styling, code-style, state, i18n, testing).
- `.claude/docs/catalog/*.md` (5: components, state, styles, i18n, ai-workflow).
- `.claude/templates/*.md` (contract, handoff, review-checklist, story).
- `.claude/tasks/post-launch/{story,contract,handoff}.md`.
- Comentaris de codi (llista completa de `grep -rlIE '[àèéíòóúçïü]' app server shared tests e2e`, ~45 fitxers):
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

**Com fer-ho (proposta per a la propera sessió, no vinculant si l'usuari prefereix una altra tirada):**
delegar per grups a subagents en paral·lel (regla 12) — un per `rules/` + `hard-rules.md` + `workflow.md`, un
per `decisions/` (40 fitxers, es pot partir en 2), un per `standards/` + `catalog/` + `templates/`, un per
`tasks/post-launch/`, un per comentaris de codi (verificant `pnpm gate` en verd després, ja que toca `.ts`/
`.vue`/`.css` reals). Cap canvi de comportament, només text — el risc és baix però cal `pnpm gate` en verd al
final igualment (regla 09).

**Conseqüències.** Cap test automàtic ho comprova encara (es podria afegir un `tests/arch/language.spec.ts`
que bloquegi caràcters catalans fora de `i18n/locales/`, a valorar quan es faci la migració). Fins que es
faci la migració, conviuen fitxers en català (`.claude/**`, comentaris) i la nova regla 13 — no és
contradictori, és deute pendent explícit, no oblit.
