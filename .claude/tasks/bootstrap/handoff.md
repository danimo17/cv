# Handoff: bootstrap

_Actualitzat: 2026-09-14 21:55. Estat REAL de la branca `feat/bootstrap` commit `bf95c0f` sobre `origin/main`; pendent només el push de l'usuari i la PR)._

## Fet (verificat)

- Repo `danimo17/cv` amb identitat local `danimo17 <daniel.spr17@gmail.com>`, remot SSH `github-astro`, branca `feat/bootstrap`.
- Governança a `.claude/` mirall d'AI-METHODOLOGY.md (decisió 028): `hard-rules.md`, `rules/01..12`, `docs/{standards,decisions,catalog}`, `workflow.md`, `templates/`, `backlog.md`, `tasks/bootstrap/{story,contract,handoff}`, hook `require-contract` (Python).
- Config: Nuxt 4.5, Tailwind v4, Pinia, i18n (ca/es/en), color-mode, FontAwesome, ESLint + Prettier, Vitest, Playwright, wrangler (Cloudflare Workers, ruta `danimorales.dev`), pnpm 12 (`allowBuilds`, `minimumReleaseAge`). `pnpm install` OK; `nuxt prepare` OK.
- Codi: tokens + CSS per component, 24 components, pàgines `index` i `meme`, server route Giphy (validació, cache, 400/503/502), store `hero`, dades del CV (LinkedIn + PDFs), 3 locales amb 127 claus i paritat verificada, foto 800×800 de LinkedIn.
- Tests escrits: 8 unit, 5 arquitectura, 5 e2e; catàleg de components.

## En curs (subagents)

| Subagent                                     | Què fa                                                                                                                                                                                                                         | Estat                                 |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------- |
| i18n                                         | `i18n/locales/{en,ca,es}.json`                                                                                                                                                                                                 | fet (129 claus, paritat OK)           |
| tests                                        | `tests/**`, `e2e/**`, `docs/catalog/components.md`                                                                                                                                                                             | fet (pendent de gate)                 |
| capes + primitius (fet: 238 tests, build OK) | decisions 029 i 026: `services/giphy`, `stores/giphy`, `domain/cv`, `ui-config`, `components/shared`, `AppText`/`AppInput`/`AppLink`/`AppImage`, regla ESLint d'elements natius, fixes de lint/typecheck, catàleg i estàndards | en curs                               |
| entorns                                      | `.github/workflows/{ci,security,preview,deploy}.yml`, `dependabot.yml`, `wrangler.jsonc`, `catalog/ai-workflow.md`, decisió 024                                                                                                | en curs                               |
| neumorphism                                  | decisió 025: `tokens.css` + tots els CSS de component + `catalog/styles.md` + `standards/styling.md`                                                                                                                           | pendent (surt quan acabi el de capes) |

## Validació (sortida real de `pnpm gate:push`, 2026-09-14 21:50)

```
prettier --check .  → All matched files use Prettier code style!
eslint .            → 0 errors, 0 warnings
nuxt typecheck      → 0 errors (avís innocu de Volar: vue-router/volar/sfc-route-blocks)
vitest run          → Test Files 16 passed (16) · Tests 240 passed (240)
nuxt build          → cloudflare_module OK · Σ 1.04 MB (326 kB gzip)
playwright test     → 5 passed (18.9s)
```

No cobreix: contrast visual real (els ratios són calculats, no mesurats al navegador), la primera PR real (workflows, previews, deploy), `wrangler dev` local, radio/checkbox d'`AppInput` (cap pàgina els usa).

## Pendents de l'usuari

| #   | Què                                                                                                                                                                                                                                                                                                                                                                                                 | Bloqueja                            | Estat                           |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ------------------------------- |
| 1   | Regenerar la clau de Giphy (la del xat és compromesa) i posar-la al fitxer d'entorn local (`NUXT_GIPHY_API_KEY=`)                                                                                                                                                                                                                                                                                   | prova real de `/meme`               | pendent                         |
| 2   | Reexportar els 3 PDFs del CV sense el telèfon a la capa de text; deixar-los a Downloads amb el mateix nom                                                                                                                                                                                                                                                                                           | `public/cv/` + botons de descàrrega | pendent                         |
| 3   | Domini `danimorales.dev` a Cloudflare Registrar                                                                                                                                                                                                                                                                                                                                                     | —                                   | **fet** (2026-09-14)            |
| 4   | Cloudflare: API token (Edit Cloudflare Workers) + Account ID                                                                                                                                                                                                                                                                                                                                        | workflows de preview i deploy       | token creat; Account ID pendent |
| 5   | GitHub: entorn `production` amb `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `NUXT_GIPHY_API_KEY`; secrets de repo per a previews; Dependabot alerts/updates activats; Code scanning sense default setup (el fa `security.yml`); secret scanning ja actiu (repo públic)                                                                                                                         | deploy                              | en curs (usuari)                |
| 6   | Push inicial de `main` + push de `feat/bootstrap` + obrir la PR (la IA no pot per regla 06 / decisió 031)                                                                                                                                                                                                                                                                                           | producció                           | pendent                         |
| 6b  | **IMMEDIATAMENT després de la primera PR** (quan els checks `gate`, `gitleaks`, `audit`, `CodeQL` hagin corregut un cop): crear el ruleset de `main` (Settings → Rules → Rulesets: Restrict deletions, Block force pushes, Require PR, Require status checks amb els 4 noms). La IA ho ha de recordar i demanar-ho en aquell moment. Alternativa sense esperar: `gh api` del catàleg ai-workflow.md | merge segur                         | pendent                         |
| 7   | Repo públic (decisió 030)                                                                                                                                                                                                                                                                                                                                                                           | check `CodeQL`                      | **fet**                         |

## Pendents de grill-me (preguntes a fer a l'usuari quan toqui)

| #   | Pregunta                                                                                                                                | Quan                   |
| --- | --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| G1  | PDFs reexportats? ("ja") → verificar text, moure a `public/cv/` (decisió 032)                                                           | ara                    |
| G2  | Llicència del repo: el README diu que no n'hi ha. Proposta: codi MIT, contingut personal (foto, textos del CV) tots els drets reservats | abans de la PR         |
| G3  | Revisió visual del neumorphism (clar i fosc) al navegador integrat abans del commit                                                     | quan acabi el subagent |
| G4  | Push de `feat/bootstrap` + PR → ruleset de `main` (pas 6b)                                                                              | després del commit     |

## Decisions preses en aquesta tasca

- 001–031 a `.claude/docs/decisions/` (les 011 i 009 substituïdes per 025 i 029).
