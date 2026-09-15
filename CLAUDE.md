# danimorales.dev — guia per a la IA

Web CV personal de Daniel Morales (frontend). Nuxt 4 + Tailwind v4 + Pinia + @nuxtjs/i18n (ca/es/en) + Giphy
meme picker, desplegat a Cloudflare Workers. Repo `danimo17/cv`. Res d'aquest projecte pot contenir codi ni
recursos interns de cap empresa; només informació pública.

## Regles vinculants (llegir SEMPRE)

@.claude/hard-rules.md

## Mapa del context (llegir quan toqui escriure en aquell territori)

- Workflow de treball (story → contract → build → gate → review → validate → handoff → PR): `.claude/workflow.md`
- Tasca activa: `.claude/tasks/ACTIVE` conté el slug → `.claude/tasks/<slug>/{story,contract,handoff}.md`.
  `handoff.md` porta l'estat real de la branca i la llista **Pendents de l'usuari** (recorda-la i torna-la a preguntar quan toqui).
- Decisions preses (NO tornar a preguntar el que ja hi és): `.claude/docs/decisions/`
- Estàndards (com s'escriu cada tipus de cosa): `.claude/docs/standards/{components,styling,code-style,state,i18n,testing}.md`
- Catàleg viu (què existeix ja, props, classes, tokens, claus): `.claude/docs/catalog/{components,styles,state,i18n,ai-workflow}.md`
  → s'actualitza EN EL MATEIX CANVI que crea o modifica l'artefacte (regla 07, test `tests/arch/docs-sync.spec.ts`).
- Backlog de stories: `.claude/backlog.md`. Plantilles: `.claude/templates/`.

## Comandes

`pnpm dev` · `pnpm gate` (format:check + lint + typecheck + test) · `pnpm gate:push` (gate + build + e2e) ·
`pnpm test:arch` · `pnpm lint:fix` · `pnpm format` · `pnpm cf:dev` · `pnpm cf:deploy`

## Estructura

Capes (decisió 029, dependència en un sol sentit API → Service → Store → View → UI-config):
`server/api/giphy` + `server/utils` (API) · `app/services/<api>/` (Service) · `app/stores/` (Store) ·
`app/pages/` + `app/components/{shared,layout,cv,meme}/` (View; `shared/Custom*` són els primitius, decisions 026, 038) ·
`app/ui-config/<entitat>/` (UI-config) · `app/domain/<entitat>/` (tipus + regles pures) · `app/data/cv/` (taules) ·
`app/composables/` (helpers de framework) · `app/types/ui.ts` · `app/plugins` · `app/assets/css/{tokens,base,pages,components/*}` ·
`shared/types` · `i18n/locales` · `tests/{unit,arch}` · `e2e/` · `.github/workflows` · `.claude/` (tot el context d'IA).
