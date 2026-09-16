# Handoff: post-launch

_Actualitzat: 2026-09-16 (fi de sessió, l'usuari marxa). Estat REAL de la branca `feat/post-launch`: **12
commits, ja pujada a `origin` (`git push` fet amb permís explícit, decisió 031), PR encara NO oberta**,
working tree net._

## Què fer primer a la propera sessió (per ordre)

1. Llegir `CLAUDE.md` → `.claude/hard-rules.md` → `.claude/workflow.md` → aquest fitxer.
2. **Decidir amb l'usuari** com abordar la migració a l'anglès (regla 13 / decisió 040, vegeu més avall) —
   probablement abans d'obrir la PR de `post-launch`, per no haver de fer-ho dues vegades sobre els mateixos
   fitxers.
3. Un cop resolt el punt 2: córrer el pas **Review** (decisió 039 — checklist de compliance + `/code-review`
   sobre tot el diff de `feat/post-launch`), corregir el que calgui, tornar a córrer `pnpm gate:push`, i **obrir
   la PR** (`gh pr create`, la IA la fa amb permís de l'usuari) seguint la convenció de títol/cos de la
   decisió 039.

## Contracte d'aquesta tasca

`.claude/tasks/post-launch/contract.md` — **8/8 criteris marcats ✅**, cap pendent de codi ni de l'usuari.

## Fet aquesta sessió (verificat)

- **DNS**: `danimorales.dev` → 200 i `www.danimorales.dev` → 200 (Custom Domain afegit al Worker `cv` pel
  dashboard; verificat amb `curl`, real). Nota: el primer intent de l'usuari va anar a l'onboarding de "nova
  zona" per error (pantalla equivocada del dashboard); el segon intent, al lloc correcte
  (Worker → Settings → Domains & Routes → Add → Custom Domain), va funcionar.
- **Dependabot**: `packageManager` baixat de `pnpm@12.4.1` a `pnpm@11.17.0` (evita l'autodescàrrega del binari
  natiu que fallava al sandbox de xarxa de Dependabot). `pnpm install --frozen-lockfile` + `pnpm gate` verds
  localment amb la nova versió. Commit `d8af4ca`.
- **Cloudflare Web Analytics** (D3/036): actiu en mode Automatic Setup; dades reals ja arribant (verificat amb
  captura del dashboard: 14 page views / 5 visits a les últimes 24h).
- **Revisió estètica** (favicon, foto, colors, "recent searches") abans del push: **descartada explícitament
  per l'usuari** — es farà a posteriori en una nova branca `feat/` dedicada a canvis estètics.
- **`pnpm gate:push` sencer** (format+lint+typecheck+test+build+e2e) corregut i verd abans del push (regla 09)
  — veure sortida real a "Validació".
- **`git push -u origin feat/post-launch`**: fet per la IA amb permís explícit de l'usuari per aquest push
  concret (decisió 031, excepció del 2026-09-14). El permís és puntual, no permanent — cal tornar-lo a
  demanar cada vegada.
- **Decisions de procés preses aquesta sessió** (noves, encara no aplicades al 100%):
  - **039 (convencions de PR)**: títol en anglès sense prefix ("Resum curt en llenguatge natural"); cos amb
    seccions fixes `Summary` / `Acceptance criteria` / `Review` / `User pendings` (només si en queden) /
    `Test plan`; el pas de Review (checklist + `/code-review`) es mou a just abans d'obrir la PR (abans
    passava abans del primer commit); la IA obre la PR amb `gh pr create`, l'usuari sempre fa el merge.
    `workflow.md` ja actualitzat amb el nou ordre de passos.
  - **040 / regla 13 (tot en anglès)**: decisió nova de l'usuari — **tot** el repo (codi, comentaris, noms de
    fitxer, tota la doc de `.claude/`, `CLAUDE.md`, commits, PRs) ha d'estar en anglès, excepte el contingut
    natural de `i18n/locales/{ca,es,en}.json`. **Encara NO aplicada**: és una migració gran, inventariada
    però pendent — vegeu la secció següent.

### Commits d'aquesta sessió (`feat/post-launch`, ja pujats)

```
b7eb1d4 docs: add PR conventions (039) and English-only rule (040/13)
523706b docs(rules): sync rule 06 wording with decision 031's feat/* push exception
d8af4ca fix(deps): pin packageManager to pnpm@11.17.0
a77fdec docs(post-launch): check off criterion 2 (www custom domain live)
491501d docs(post-launch): close manual pendings 1-3 (www domain, dependabot, web analytics)
14f1fc3 docs(post-launch): record gate:push (build+e2e) green, close pending #6
b28b8b3 docs(post-launch): fix remaining stale commit-count/DNS notes in handoff
```

(Anteriors a aquesta sessió, ja documentats i pujats amb els anteriors: `ad4d4f6`, `94b6b31`, `5c36665`,
`0aaea8f`, `700da59`, `9360f50`, `5957be7` — veure historial de git per detall.)

## ⚠️ Pendent gran: migració a l'anglès (regla 13 / decisió 040)

**No s'ha tocat cap fitxer encara.** Inventari complet fet aquesta sessió via
`grep -rlIE '[àèéíòóúçïü]' ...` (llista sencera dins `docs/decisions/040-english-only.md`):

- Root: `CLAUDE.md`.
- `.claude/hard-rules.md`, `.claude/workflow.md`, `.claude/backlog.md`.
- `.claude/rules/*.md` — **13 fitxers** (01-13; el 13 mateix es va escriure en català per error d'ordre, cal
  traduir-lo també).
- `.claude/docs/decisions/*.md` — **40 fitxers** (001-040).
- `.claude/docs/standards/*.md` — 6 fitxers.
- `.claude/docs/catalog/*.md` — 5 fitxers.
- `.claude/templates/*.md` — 4 fitxers.
- `.claude/tasks/post-launch/{story,contract,handoff}.md` — inclòs aquest mateix handoff.
- **Comentaris de codi real** (~45 fitxers `.ts`/`.vue`/`.css`) — llista exacta dins la decisió 040. Aquests
  són els que més risc tenen (toquen codi que compila); cal `pnpm gate` en verd després.

**Proposta no vinculant per abordar-ho** (a l'inventari, decisió 040): delegar per grups a subagents en
paral·lel (regla 12) — un per `rules/`+`hard-rules.md`+`workflow.md`, un o dos per `decisions/` (40 fitxers),
un per `standards/`+`catalog/`+`templates/`, un per `tasks/post-launch/`, un per comentaris de codi. Backlog:
entrada `english-only` a `.claude/backlog.md`, estat `todo`.

**Decisió oberta per a la propera sessió**: fer-ho abans o després de la PR de `post-launch`? Si es fa abans,
tota la doc de la PR (i el seu propi cos) ja surt en anglès des del principi; si es fa després, cal una
segona PR només per a la traducció. Recomanació: fer-ho abans, ja que el pas de Review (039) encara no s'ha
corregut sobre aquesta branca i és un bon moment per fer-ho tot junt.

## En curs / no fet (baixa prioritat, sense tocar aquesta sessió)

- P3 (preview de PR), P4 (contrast mesurat al navegador real, no només calculat), P5 (radio/checkbox
  d'`CustomInput` sense pàgina real que els usi) — arrossegats des del bootstrap.

## Subagents (regla 12)

| Subagent                                        | Què ha fet                                                                                                                              | Resultat                                                                                               |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Diagnose failing Dependabot job                 | Va baixar el log real via `gh api .../logs` i va aïllar la causa arrel (pnpm 12.4.1)                                                    | Sense fix immediat (massa abast, rule 11) — el fix (downgrade) es va aplicar aquesta sessió amb permís |
| Rename App\* primitives to Custom\*             | Rename mecànic de 12 components + CSS + ESLint + tests + docs en un únic commit                                                         | `pnpm gate` verd (240 tests) abans de fusionar-lo a `feat/post-launch`                                 |
| Build meme recent-searches + pagination feature | `useGiphyStore.history`/`offset`, `GiphyService` amb `offset`, `CustomPagination.vue`, `MemeRecentSearches.vue`, i18n×3, tests, catàleg | `pnpm gate` verd (269 tests) abans de fusionar; verificat addicionalment en viu pel fil principal      |

El fil principal ha fet directament (regla 12, excepcions per canvis d'un sol fitxer/síntesi): tots els fixos
d'aquesta sessió (packageManager, docs de decisions/handoff, rule 06/13, decisions 039/040), el push, i les
verificacions DNS/Cloudflare.

## Validació (sortida real de l'última `pnpm gate:push`, prèvia al push)

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

El `git push` ha tornat a córrer `gate:push` sencer via el hook `pre-push` (regla 09) i també ha sortit verd.

No cobreix (i per què no bloqueja):

- **Contrast AA real al navegador**: recalculat matemàticament (oklch → sRGB → ràtio), mai mesurat amb una
  eina d'accessibilitat real (Lighthouse/axe) — P4, baixa prioritat, arrossegat del bootstrap.
- **Favicon**: cap test el cobreix (actiu SVG estàtic); verificat només visualment durant la sessió anterior.
- **Verificació visual**: feta amb `pnpm dev` + Browser pane en sessions anteriors — no és test automatitzat.

## Pendents de l'usuari

| #   | Què                                                                                  | Bloqueja                | Estat                                                           |
| --- | ------------------------------------------------------------------------------------ | ----------------------- | --------------------------------------------------------------- |
| 1   | Decidir: migració a l'anglès (13/040) abans o després d'obrir la PR de `post-launch` | ordre del treball futur | pendent, veure secció "Pendent gran" més amunt                  |
| 2   | Un cop decidit l'ordre: aprovar que la IA corri el pas Review (039) i obri la PR     | tancament de la tasca   | pendent, permís puntual (no s'assumeix d'una vegada per sempre) |
| 3   | Revisió estètica (favicon, foto, colors) — descartada per ara                        | res, ja decidit         | ajornat a una futura `feat/` dedicada, per elecció de l'usuari  |

## Decisions preses en aquesta tasca

- → `.claude/docs/decisions/034-meme-recent-searches-and-pagination.md`
- → `.claude/docs/decisions/035-no-projects-section.md`
- → `.claude/docs/decisions/036-cloudflare-web-analytics.md`
- → `.claude/docs/decisions/037-customimage-srcset-ready.md`
- → `.claude/docs/decisions/038-rename-app-to-custom-prefix.md`
- → `.claude/docs/decisions/039-pr-conventions.md` (nova aquesta sessió)
- → `.claude/docs/decisions/040-english-only.md` (nova aquesta sessió)

## Context històric (nit del bootstrap, 2026-09-14 — es manté per si cal l'arrel del diagnòstic DNS)

El log del job `deploy` de GitHub Actions va mostrar que el Worker `cv` i el custom domain `danimorales.dev` ja
existien correctament; el registre DNS (Type Worker, Name `danimorales.dev`, Content `cv`, Proxied) també era
correcte des del principi. El que faltava eren minuts de propagació (domini registrat el mateix dia), no una
configuració trencada.
