# Handoff: post-launch

_Actualitzat: 2026-09-16. Estat REAL de la branca `feat/post-launch` (10 commits per davant de `main`, sense
pujar, working tree net). Els 3 pendents manuals (www domain, Dependabot, Web Analytics) i la gate:push són
fets — només queda el push (regla 06/031, ho fas tu)._

## Com continuar (llegir primer)

1. `CLAUDE.md` → `.claude/hard-rules.md` → `.claude/workflow.md` → aquest fitxer.
2. `.claude/tasks/ACTIVE` = `post-launch`. Contracte a `.claude/tasks/post-launch/contract.md` — **8/8 criteris
   marcats ✅ o ⏳ pendent tu**, cap pendent de codi.
3. La branca ja té 10 commits fets aquesta sessió (llista completa a "Fet", secció següent). Ningú n'ha fet
   `push` (regla 06/031): quan vulguis, `git push -u origin feat/post-launch` i obrir la PR contra `main`.
4. No hi ha res més a preguntar sobre D1-D5 (decisions 034-038, totes tancades). Els únics punts oberts són
   accions manuals teves al dashboard de Cloudflare/GitHub — vegeu "Pendents de l'usuari".

## Fet (verificat)

- **DNS**: `danimorales.dev` → 200 i `www.danimorales.dev` → 200 (Custom Domain afegit al Worker `cv`;
  verificat amb `curl`, real).
- **Dependabot — diagnòstic complet**: el job `npm_and_yarn Update` falla perquè `packageManager:
"pnpm@12.4.1"` intenta autodescarregar el binari natiu `@pnpm/exe.linux-x64` i el `fetch` falla dins el
  sandbox de xarxa de Dependabot (evidència: log complet descarregat via `gh api .../logs`, no és
  `minimumReleaseAge`/`allowBuilds` — no existeix `.npmrc` al repo). `gh run rerun` no funciona en jobs de
  Dependabot (no reexecutables per API/CLI).
- **Decisions D1-D5 (034-038)**, totes escrites a `.claude/docs/decisions/` i implementades:
  - **034 (D1)**: "recent searches" a `/meme` — `useGiphyStore.history` (màx. 5, sense duplicats, més recent
    primer) + `MemeRecentSearches.vue` (clicable, omple el camp i torna a cercar). Component genèric
    `CustomPagination.vue` wired amb `giphy.offset`/`giphy.total` (l'API de Giphy ja retornava `total`, no
    s'usava). **Verificat en viu** amb `pnpm dev`: cercar "dog" → "cat" acumula `[cat, dog]`; clicar "dog" torna
    a cercar i reordena a `[dog, cat]`; "Next page" mostra "Page 2 of 42" amb GIFs diferents.
  - **035 (D2)**: secció "Projectes" descartada per sempre ("no la vull mai").
  - **036 (D3)**: Cloudflare Web Analytics, mode Automatic Setup — decidit, sense codi (acció de dashboard).
  - **037 (D4)**: `CustomImage` guanya props opcionals `srcset`/`sizes` (reflectides tal qual a l'`<img>`; sense
    efecte si no es passen). Cap mida real generada encara (YAGNI fins que Lighthouse ho demani).
  - **038 (D5)**: rename mecànic `App*` → `Custom*` (12 primitius: Text, Input, Link, Image, Button, Icon,
    Badge, Alert, Card, Section, Skeleton, Marquee). CSS, ESLint (`no-restricted-html-elements`), tests i
    catàleg actualitzats al mateix canvi. `git grep 'App[A-Z]'` net fora dels decisions/handoff històrics.
  - **Extra decidit i fet la mateixa sessió** (no eren D1-D5 però van sortir d'un `/grill-me` sobre el
    favicon): tokens `--color-primary`/`--color-secondary` de blau corporatiu a mostassa/gris fosc neutre
    (clar+fosc, contrast AA recalculat a `catalog/styles.md`, tot ≥4.5:1); foto de perfil substituïda
    (`app/assets/img/daniel.jpg`, retallada 800×800 des de `~/Downloads/Perfil.jpg`); favicon redissenyat
    3 iteracions fins a un gat pixel-art (32×32 graella, mostassa/gris fosc, boca real, bigotis que toquen la
    cara) — cap decisió pròpia escrita per al favicon en si (és un actiu visual, no un token/component nou),
    però el canvi de tokens que el va motivar sí (implícit a la mateixa àrea que 036-038, no calia una 039
    separada perquè no és una tria estructural nova, és aplicar-la).
- **PDFs**: `public/cv/cv-{ca,en,es}.pdf` actualitzats (exports nous que vas posar tu fora de sessió, detectats
  per canvi de mida de fitxer); revisada la capa de text amb el Read tool — sense telèfon ni adreça postal
  (regla 04), només ciutat ("Banyoles, Girona").

### Commits d'aquesta sessió (`feat/post-launch`, cap pujat)

```
ad4d4f6 docs(post-launch): check off criteria 1,5-8; add dev preview launch config
94b6b31 Merge branch 'worktree-agent-af4432d0a4e4d5714' into feat/post-launch
5c36665 content: refresh CV PDF exports
0aaea8f feat(CustomImage): optional srcset/sizes props
700da59 feat(brand): mustard/dark-gray tokens, new hero photo, pixel-cat favicon
9360f50 feat(meme): recent searches + generic pagination
5957be7 refactor: rename App* primitive components to Custom*
```

## En curs / no fet

- P3 (preview de PR) i P4 (contrast mesurat al navegador real, no només calculat) i P5 (radio/checkbox
  d'`CustomInput` sense pàgina real que els usi) segueixen igual que a la nit del bootstrap — baixa prioritat,
  ningú els ha tocat aquesta sessió.
- No s'ha obert cap PR ni fet `push` (regla 06/031: només ho fas tu).

## Subagents (regla 12)

| Subagent                                        | Què ha fet                                                                                                                              | Resultat                                                                                          |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Diagnose failing Dependabot job                 | Va baixar el log real via `gh api .../logs` (l'annotation del run no n'hi ha prou) i va aïllar la causa arrel                           | Sense fix (decisió amb massa abast per fer-la sola, rule 11) — vegeu "Fet"                        |
| Rename App\* primitives to Custom\*             | Rename mecànic de 12 components + CSS + ESLint + tests + docs en un únic commit                                                         | `pnpm gate` verd (240 tests) abans de fusionar-lo a `feat/post-launch`                            |
| Build meme recent-searches + pagination feature | `useGiphyStore.history`/`offset`, `GiphyService` amb `offset`, `CustomPagination.vue`, `MemeRecentSearches.vue`, i18n×3, tests, catàleg | `pnpm gate` verd (269 tests) abans de fusionar; verificat addicionalment en viu pel fil principal |

Els tres van treballar en worktrees aïllats (`.claude/worktrees/agent-*`, ja netejats amb `git worktree
remove` + `git branch -d` un cop fusionats). El fil principal ha escrit els tokens/decisions/favicon/foto/D4
directament (canvis d'un sol fitxer o síntesi, excepció de la regla 12).

## Validació (sortida real de l'última `pnpm gate:push`)

```
$ pnpm gate:push            → pnpm gate && pnpm build && pnpm test:e2e
$ prettier --check .        → All matched files use Prettier code style!
$ eslint .                  → (0 errors)
$ nuxt typecheck             → 0 errors (soroll no fatal: warning "vue-router/volar/sfc-route-blocks"
                                preexistent, no relacionat amb cap canvi d'aquesta sessió)
$ vitest run                → Test Files 20 passed (20) · Tests 271 passed (271)
$ nuxt build (preset cloudflare-module) → Build complete!
$ playwright test (e2e/meme-flow.spec.ts) → 5 passed (10.4s)
Exit code: 0
```

Regla 09 complerta: `gate:push` corregut sencer (format+lint+typecheck+test+build+e2e) abans de deixar la
branca a punt per pujar — no només `pnpm gate`.

No cobreix (i per què no bloqueja):

- **`www.danimorales.dev`**: no hi ha manera de testar-ho fins que existeixi el registre; és una comprovació
  manual (`curl -I`), no un test automatitzat.
- **Contrast AA real al navegador**: recalculat matemàticament (oklch → sRGB → ràtio), mai mesurat amb una eina
  d'accessibilitat real (Lighthouse/axe) — P4, baixa prioritat, arrossegat del bootstrap.
- **Favicon**: cap test el cobreix (és un actiu SVG estàtic, no un component amb lògica); verificat només
  visualment (previsualitzat a 16/32/64/160px durant la sessió).
- **Verificació visual d'aquesta sessió**: feta amb `pnpm dev` + Browser pane (home en clar/fosc, `/meme` amb
  cerca real contra Giphy, paginació, recent searches) — no és un test automatitzat, és una comprovació manual
  puntual d'aquesta conversa.

## Pendents de l'usuari

| #   | Què                                                                                                         | Bloqueja                          | Estat                                                                                 |
| --- | ----------------------------------------------------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------- |
| 1   | Cloudflare → Worker `cv` → Domains → Add Domain `www.danimorales.dev` (o Redirect Rule)                     | criteri 2 del contracte           | **fet** — verificat `curl` → 200                                                      |
| 2   | Dependabot: baixar `packageManager` a `pnpm@11.17.0`                                                        | criteri 3 del contracte           | **fet** — commit `d8af4ca`                                                            |
| 3   | Activar Cloudflare Web Analytics (Automatic Setup) al dashboard                                             | D3/036, no bloqueja res           | **fet** — dades reals ja arribant                                                     |
| 4   | Revisar/aprovar el favicon i la resta de canvis visuals (foto, colors, "recent searches") abans de fer push | push/PR                           | **descartat per l'usuari**: revisió estètica es farà a posteriori en una nova `feat/` |
| 5   | `git push -u origin feat/post-launch` + obrir PR (la IA mai fa push, regla 06/031)                          | merge a `main` / desplegament     | pendent tu                                                                            |
| 6   | Córrer `pnpm gate:push` (build + e2e) abans del push                                                        | res, però és la gate real de push | **fet** — verd sencer (veure "Validació")                                             |

## Decisions preses en aquesta tasca

- → `.claude/docs/decisions/034-meme-recent-searches-and-pagination.md`
- → `.claude/docs/decisions/035-no-projects-section.md`
- → `.claude/docs/decisions/036-cloudflare-web-analytics.md`
- → `.claude/docs/decisions/037-customimage-srcset-ready.md`
- → `.claude/docs/decisions/038-rename-app-to-custom-prefix.md`

## Context històric (nit del bootstrap, 2026-09-14 — es manté per si cal l'arrel del diagnòstic DNS)

El log del job `deploy` de GitHub Actions va mostrar que el Worker `cv` i el custom domain `danimorales.dev` ja
existien correctament; el registre DNS (Type Worker, Name `danimorales.dev`, Content `cv`, Proxied) també era
correcte des del principi. El que faltava eren minuts de propagació (domini registrat el mateix dia), no una
configuració trencada. Lliçó: si el custom domain surt bé al log de deploy i el DNS és correcte, esperar
5-15 minuts abans de tocar res a Cloudflare — exactament el mateix principi aplica a `www`, només que aquí cal
crear el registre, no esperar-lo.
