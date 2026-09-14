# Handoff: bootstrap

_Actualitzat: 2026-09-14 (nit). Estat REAL de la branca `feat/bootstrap`. Escrit perquè un altre agent pugui continuar demà sense llegir cap transcripció._

## 0. Com continuar (llegir primer)

1. Llegeix `CLAUDE.md` → `.claude/hard-rules.md` (12 regles vinculants) → `.claude/workflow.md` → aquest fitxer.
2. Abans de tocar res: `.claude/docs/decisions/` (033 decisions; no tornis a preguntar el que ja hi és) i el catàleg `.claude/docs/catalog/` (components, estils, estat, i18n, workflow).
3. Tasca activa: `.claude/tasks/ACTIVE` = `bootstrap`. Contracte: `contract.md` (16 criteris). Story: `story.md`.
4. Regla 12: el fil principal orquestra; investigació i desenvolupament van a subagents amb encàrrecs autocontinguts.
5. Regla 06/031: la IA treballa a `feat/<slug>`, mai a `main`; només l'usuari fa merge. Push només si l'usuari ho demana explícitament.
6. Regla 09/10: cap commit sense `pnpm gate` en verd (el pre-commit ho força) ni sense contracte actiu (hook `.claude/hooks/require-contract.py`).
7. Hooks globals de l'usuari que afecten Bash (decisió 020): mai `cat|head|tail|grep|awk` + el nom literal del fitxer d'entorn en una mateixa ordre; escriu fitxers amb l'eina Write o `tee FITXER <<'EOF'`.

## 1. Què és el projecte

Web CV de Daniel Morales (frontend) a `danimorales.dev`: home amb el CV complet (hero, about, experiència, stack, formació, contacte, descàrrega de PDF per idioma) i `/meme`, on es busca un GIF de Giphy i "es porta" substituint la foto del hero (estat Pinia en memòria, a propòsit no persistent). Repo públic `danimo17/cv`, tot gratuït (decisió 030). Serveix també de mostra de com treballa l'autor amb IA sota regles i gates vinculants.

## 2. Fet i verificat

| Àrea                             | Estat                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Git                              | Branca `feat/bootstrap`, commit `cfb3251` (+ aquest handoff) sobre `origin/main` (que té l'Initial commit de GitHub i la LICENSE MIT creada per l'usuari). Identitat local `danimo17 <daniel.spr17@gmail.com>`. Remot SSH `github-astro`.                                                                                                                                                                                                                                                           |
| Governança `.claude/`            | Mirall d'AI-METHODOLOGY.md (decisió 028): `hard-rules.md`, `rules/01..12`, `docs/standards/{components,styling,code-style,state,i18n,testing}`, `docs/decisions/001..033`, `docs/catalog/{components,styles,state,i18n,ai-workflow}`, `templates/`, `workflow.md`, `backlog.md`, `hooks/require-contract.{sh,py}`, `settings.json`.                                                                                                                                                                 |
| Stack                            | Nuxt 4.5, Vue 3, TS, Tailwind v4 (`@tailwindcss/vite`), Pinia, `@nuxtjs/i18n` (ca/es/en, `prefix_except_default`, `baseUrl` danimorales.dev), `@nuxtjs/color-mode`, Font Awesome free, ESLint + Prettier, Vitest, Playwright, wrangler, pnpm 12 (`pnpm-workspace.yaml`: `allowBuilds`, `minimumReleaseAge: 1440`).                                                                                                                                                                                  |
| Arquitectura (029)               | `server/api/giphy/search.get.ts` (valida, cacheja 1 h, 400/503/502) → `app/services/giphy/GiphyService.ts` (defineix el `useFetch`, mapa d'errors a claus i18n) → `app/stores/giphy.ts` (cerca) i `app/stores/hero.ts` (selecció) → `app/pages/{index,meme}.vue` → `app/ui-config/cv/sections.ts`. `app/domain/cv/` (tipus, `formatPeriod`), `app/data/cv/` (perfil, experiència, formació, certificacions, stack), `shared/types/giphy.ts`, `app/composables/useMessageList.ts`.                   |
| Primitius (026)                  | `app/components/shared/`: `AppText`, `AppInput` (9 tipus), `AppLink`, `AppImage`, `AppButton`, `AppIcon`, `AppBadge`, `AppAlert`, `AppCard`, `AppSection`, `AppSkeleton`, `AppMarquee`. Elements natius prohibits fora dels wrappers (`vue/no-restricted-html-elements`). `layout/`: `AppHeader`, `AppFooter`, `ThemeToggle`, `LocaleSwitcher`, `SourceBanner` (carrusel infinit amb enllaç al repo). `cv/`: 8 seccions. `meme/`: 4 components.                                                     |
| Estils (015, 025)                | Tokens semàntics + ombres neumòrfiques a `app/assets/css/tokens.css` (light i `.dark`), un CSS per component a `assets/css/components/`, `base.css`, `pages.css`, `main.css`. Contrast AA calculat (taula a `catalog/styles.md`). Cap utilitat de color/espai als templates (`vue/no-restricted-class`).                                                                                                                                                                                            |
| Dades                            | Font: LinkedIn de l'usuari (llegit amb la seva sessió al navegador integrat) + PDFs. Foto 800×800 de LinkedIn a `app/assets/img/daniel.jpg`. PDFs `public/cv/cv-{en,ca,es}.pdf` amb telèfon i codi postal redactats (PyMuPDF), verificats amb `pdf-parse`; originals esborrats (032).                                                                                                                                                                                                               |
| i18n                             | `i18n/locales/{en,ca,es}.json`, 127 claus fulla, paritat testejada. Nota: en català el títol d'About és "Qui sóc" (eyebrow "Sobre mi").                                                                                                                                                                                                                                                                                                                                                             |
| Entorns i deploy (021, 022, 024) | Local: `nuxt dev` + fitxer d'entorn amb `NUXT_GIPHY_API_KEY` (posat per l'usuari, no llegir). Producció: Worker `cv` a `danimorales.dev` via `.github/workflows/deploy.yml` (`workflow_run` de `ci` a `main`), secrets a l'entorn GitHub `production`. Previews de PR: `preview.yml` (`wrangler versions upload`, salta si no hi ha secrets). `security.yml`: gitleaks, `pnpm audit`, CodeQL. `dependabot.yml`. `wrangler.jsonc`: ruta `custom_domain`, `workers_dev: false`, `preview_urls: true`. |
| Llicència (033)                  | `LICENSE` MIT (codi) + `CONTENT-LICENSE.md` (contingut personal, tots els drets reservats).                                                                                                                                                                                                                                                                                                                                                                                                         |
| README                           | `README.md` complet (546 línies, anglès): propòsit, autoria, stack, arquitectura, primitius, estils, i18n, tests i gates, metodologia d'IA, entorns, getting started, convencions, seguretat, llicència.                                                                                                                                                                                                                                                                                            |

## 3. Validació (sortida real, 2026-09-14 ~22:00, pre-commit i `pnpm gate:push`)

```
prettier --check .  → All matched files use Prettier code style!
eslint .            → 0 errors, 0 warnings
nuxt typecheck      → 0 errors (avís innocu de Volar: vue-router/volar/sfc-route-blocks)
vitest run          → Test Files 16 passed (16) · Tests 240 passed (240)
nuxt build          → cloudflare_module OK · Σ 1.04 MB (326 kB gzip)
playwright test     → 5 passed
```

Tests existents: `tests/unit/{stores/hero,stores/giphy,services/GiphyService,domain/period,server/giphy,i18n-parity,components/{AppButton,AppAlert,AppInput,AppMarquee,MemeCard}}.spec.ts`; `tests/arch/{giphy-boundary,secrets,docs-sync,css-per-component,no-pii}.spec.ts`; `e2e/meme-flow.spec.ts` (5 tests: seccions de la home + banner, cerca→tria→porta→home→recàrrega, tema, idioma, validació del server route).
**No cobreix:** contrast mesurat al navegador (només calculat), la primera PR real (workflows, previews, deploy mai executats), `wrangler dev` local, radio/checkbox d'`AppInput` (cap pàgina els usa), la cerca real a Giphy amb clau (només mock).

## 4. Decidit (no tornar a preguntar) — resum de `.claude/docs/decisions/`

001 Cloudflare Workers · 002 danimorales.dev (comprat) · 003 selector de meme, no joc · 004 meme només en memòria · 005 tema/idioma persisteixen · 006 font LinkedIn+PDF · 007 mai Chrome real; navegador integrat o Brave incògnit · 008 ca/es/en · 009 substituïda per 029 · 010 seccions home · 011 substituïda per 025 · 012 tests i gates vinculants · 013 foto de LinkedIn · 014 secrets (clau del xat compromesa → regenerada per l'usuari) · 015 CSS per component · 016 Prettier+ESLint · 017 directives → pregunta · 018 sense @nuxt/image · 019 e2e contra `nuxt dev` · 020 hooks de shell i fitxer d'entorn · 021 entorns local+prod+previews, deploy per Actions · 022 escanejos · 023 orquestració · 024 entorn GitHub + ruleset · 025 neumorphism · 026 primitius App* · 027 docs viva en desenvolupar i revisar · 028 `.claude/` mirall del doc · 029 capes · 030 públic i cost zero · 031 només l'usuari escriu (push per la IA només si ho demana) · 032 PDFs només al repo · 033 MIT + contingut reservat.

## 5. Per decidir (preguntar amb grill-me quan toqui)

| #   | Pregunta                                                                                                                | Quan                    |
| --- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| D1  | Vols persistir l'historial de memes (`history`) en algun lloc o treure'l? Ara existeix a la store però cap UI el mostra | pròxima story           |
| D2  | Secció "Projectes" a la home? LinkedIn no en té; el propi repo podria ser-ne el primer                                  | pròxima story           |
| D3  | Analítica (Cloudflare Web Analytics és gratuïta i sense cookies)                                                        | pròxima story           |
| D4  | Mides responsive de la foto (avui un sol JPEG 800px)                                                                    | si Lighthouse ho demana |
| D5  | Renomenar el prefix `App*` a `Custom*` (l'usuari va dir "CustomInput/CustomText"; es va mantenir `App*`)                | si l'usuari ho vol      |

## 6. Pendents de l'usuari

| #   | Què                                                                                                                                                                                                                                                                                                                                             | Estat                                          |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| 1   | Clau de Giphy regenerada i posada al fitxer d'entorn local i al secret `production`                                                                                                                                                                                                                                                             | fet segons l'usuari (no verificable per la IA) |
| 2   | PDFs                                                                                                                                                                                                                                                                                                                                            | fet per la IA                                  |
| 3   | Domini                                                                                                                                                                                                                                                                                                                                          | fet                                            |
| 4   | Cloudflare API token + Account ID a GitHub (`production` + secrets de repo)                                                                                                                                                                                                                                                                     | fet segons l'usuari                            |
| 5   | Dependabot alerts activats; Code scanning sense default setup                                                                                                                                                                                                                                                                                   | fet segons l'usuari                            |
| 6   | Push de `feat/bootstrap` (fet per la IA a petició de l'usuari) i **obrir la PR** a GitHub                                                                                                                                                                                                                                                       | PR pendent                                     |
| 6b  | **Just després que els checks `gate`, `gitleaks`, `audit`, `CodeQL` hagin corregut a la PR**: crear el ruleset de `main` (Settings → Rules → Rulesets → New branch ruleset: Active, default branch, Restrict deletions, Block force pushes, Require PR, Require status checks amb els 4 noms). Alternativa: `gh api` a `catalog/ai-workflow.md` | pendent                                        |
| 7   | Merge de la PR → `ci` a `main` → `deploy.yml` desplega a producció. Comprovar `danimorales.dev` i `/meme` amb la clau real                                                                                                                                                                                                                      | pendent                                        |
| 8   | Si la primera preview o el deploy fallen per permisos del token: afegir Zone → DNS → Edit al token (vegeu decisió 024)                                                                                                                                                                                                                          | condicional                                    |

## 7. Coses que un altre agent ha de saber

- `nuxt.config.ts` té `components: [{ path: '~/components', pathPrefix: false }]`: sense això Nuxt registrava `SharedAppButton` en lloc d'`AppButton`.
- Els E2E esperen `networkidle` després de cada `goto`/`reload` (en dev la hidratació arriba tard); no ho treguis.
- `tests/arch/secrets.spec.ts` exclou `.claude/` i el README no pot contenir la paraula `api_key` literal.
- `tests/arch/no-pii.spec.ts` llegeix els PDFs amb `pdf-parse`; el patró de telèfon no creua línies.
- El hook `require-contract.py` només mira invocacions reals de git a inici de segment; la prosa "git commit" en docs no el dispara.
- Queden dues carpetes buides `tests/unit/composables/` i `tests/unit/utils/` (git les ignora).
- `useFetch` viu al servei i es crea un cop per store; el test `stores/giphy.spec.ts` encadena casos sobre la mateixa instància.

## 8. Subagents usats (regla 12)

| Subagent                      | Abast                                                            | Resultat           |
| ----------------------------- | ---------------------------------------------------------------- | ------------------ |
| i18n                          | 3 locales                                                        | fet                |
| tests                         | unit + arch + e2e + catàleg de components                        | fet                |
| entorns                       | workflows, dependabot, wrangler, decisió 024, catàleg            | fet                |
| capes + primitius (+ marquee) | 029, 026, fixes de lint/typecheck, docs                          | fet, 238→240 tests |
| neumorphism                   | tokens, CSS, docs d'estil, contrast                              | fet                |
| readme                        | README + llista d'inconsistències (corregides pel fil principal) | fet                |

## 9. Tancament d'aquesta tasca (quan la PR estigui fusionada)

Promoure el que sigui durable (ja és a standards/decisions/catalog), esborrar `.claude/tasks/bootstrap/`, buidar `ACTIVE`, marcar `done` al backlog, obrir la següent story amb `templates/story.md`.
