# Handoff: post-launch

_Actualitzat: 2026-09-14 (nit). Sessió tancada aquí; continua demà. Estat REAL, no un resum optimista._

## 0. Com continuar (llegir primer)

1. `CLAUDE.md` → `.claude/hard-rules.md` → `.claude/workflow.md` → aquest fitxer.
2. `.claude/tasks/ACTIVE` = `post-launch`. Contracte a `.claude/tasks/post-launch/contract.md`.
3. La tasca `bootstrap` (la web sencera) està **tancada i fusionada** a `main` (PR #1, commit `03eedd9`). El seu handoff detallat es va esborrar en tancar (regla de tancament, pas 9 del workflow); tot el que era durador ja és a `.claude/docs/{standards,decisions,catalog}/`. Si cal recuperar el detall exacte de com es va construir, és a l'historial de git de `feat/bootstrap` (commits `cfb3251` i `43146c3`).
4. Regla 06/031: la IA treballa a `feat/<slug>`, mai a `main`. Push només si l'usuari ho demana explícitament (excepció afegida el 2026-09-14 a la decisió 031, ja usada un cop aquesta nit).
5. Aquest fitxer viu ara a la branca `chore/close-bootstrap-and-dns` (encara sense commit al moment d'escriure). Si demà comences de zero: `git checkout main && git pull` i després `git checkout chore/close-bootstrap-and-dns` si existeix al remot, o repartir aquest contingut en una `feat/post-launch` nova.

## 1. Estat real del deploy (actualitzat 2026-09-14 23:52, DESPRÉS de tancar la resta del handoff)

**RESOLT durant la mateixa nit, sense tocar res més**: `https://danimorales.dev` ha començat a respondre 200
uns 5 minuts després d'escriure la secció de diagnòstic de sota (era propagació DNS pura, tal com s'havia
previst; el registre Worker/DNS ja era correcte des d'abans). Verificat en directe:

```
GET https://danimorales.dev        -> 200
GET https://danimorales.dev/ca     -> 200
GET https://danimorales.dev/es     -> 200
GET https://danimorales.dev/meme   -> 200
GET https://danimorales.dev/api/giphy/search?q=cat&limit=1
  -> 200, resultats reals de Giphy (la clau NUXT_GIPHY_API_KEY del secret `production` funciona)
```

**Únic que queda pendent d'aquesta secció: `www.danimorales.dev`.** Encara NO té registre propi; Cloudflare
ho assenyala explícitament a DNS → Records → Recommendations ("Visitors cannot reach www.danimorales.dev").
No bloqueja res (el domini "de veritat" ja funciona), és cosmètic/opcional.

### Pas pendent per demà (únic pas real que queda d'aquesta secció)

Cloudflare dashboard → Workers & Pages → Worker `cv` → pestanya **Domains** → **Add Domain** →
`www.danimorales.dev` → Add. Comprovar amb:

```bash
curl -I --max-time 15 https://www.danimorales.dev
```

Si es prefereix no gestionar dos dominis, alternativa vàlida: NO afegir `www` com a domini del Worker, sinó
crear una regla de redirecció `www.danimorales.dev` → `danimorales.dev` (Cloudflare → zona → Rules → Redirect
Rules). Qualsevol de les dues és acceptable; no calia decidir-ho a mitjanit, es decideix demà segons preferència.

---

### Diagnòstic original d'anit (queda per context, ja no cal seguir-lo pas a pas — l'arrel ja resol)

El log del job `deploy` de GitHub Actions va mostrar:

```
Uploaded cv (4.72 sec)
Deployed cv triggers (1.77 sec)
  danimorales.dev (custom domain)
Current Version ID: 4721dc62-eccf-4491-b192-f703519bbcd6
✨ Success! Uploaded 25 files
```

El Worker `cv` i el custom domain `danimorales.dev` ja existien correctament. El registre DNS a Cloudflare
(Type Worker, Name `danimorales.dev`, Content `cv`, Proxied) també era correcte des del principi. El que faltava
eren minuts de propagació (el domini es va registrar el mateix dia), no una configuració trencada. Lliçó per a
la pròxima vegada: si el custom domain surt bé al log de deploy i el registre DNS és correcte, esperar
5-15 minuts abans de tocar res a Cloudflare.

## 2. Altres pendents detectats aquesta nit

| #   | Què                                                                        | Detall                                                                                                                                                                                                                                                                                                                                                                                  | Prioritat                       |
| --- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| P1  | DNS domini (secció 1)                                                      | Vegeu més amunt                                                                                                                                                                                                                                                                                                                                                                         | alta, bloqueja veure el lloc    |
| P2  | Job de Dependabot fallat                                                   | `npm_and_yarn in /. - Update #1576414186` (Dependabot Updates #2) va fallar; `github_actions` update (#1) va anar bé. Cal obrir el log del job fallat a Actions i veure si és per `minimumReleaseAge`/`allowBuilds` de pnpm 12 topant amb com Dependabot instal·la, o una altra cosa. Si és `allowBuilds`, potser cal un `.npmrc`/config perquè el runner de Dependabot també l'accepti | mitjana                         |
| P3  | Preview de PR (`preview.yml`) va fallar a la PR #1 amb "Failing after 36s" | Esperat: `wrangler versions upload` necessita que el Worker ja existeixi, i era la primera vegada. Ara que el Worker `cv` ja existeix, la següent PR hauria de generar preview correctament. Verificar-ho a la propera PR abans de donar-ho per tancat                                                                                                                                  | baixa, verificar en curs normal |
| P4  | Contrast del neumorphism                                                   | Calculat (taules a `catalog/styles.md`), mai mesurat al navegador real                                                                                                                                                                                                                                                                                                                  | baixa                           |
| P5  | Radio/checkbox d'`AppInput`                                                | Implementats i testejats unitàriament, cap pàgina real els usa encara                                                                                                                                                                                                                                                                                                                   | baixa                           |

## 3. Punts oberts de disseny/producte (arrossegats del bootstrap, encara sense decidir)

| #   | Pregunta                                                          | Notes                                                                                                                                               |
| --- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Persistir l'historial de memes (`history` a la store) o treure'l? | Ara existeix però cap UI el mostra                                                                                                                  |
| D2  | Secció "Projectes" a la home?                                     | LinkedIn no en té; el mateix repo en podria ser el primer exemple                                                                                   |
| D3  | Analítica (Cloudflare Web Analytics, gratuïta, sense cookies)?    | Decisió 030 exigeix cost zero: aquesta opció ho compleix                                                                                            |
| D4  | Mides responsive de la foto (avui un JPEG únic de 800px)          | Revisar si Lighthouse ho demana                                                                                                                     |
| D5  | Renomenar el prefix `App*` a `Custom*`?                           | L'usuari havia dit "CustomInput/CustomText"; es va mantenir `App*` per coherència amb Font Awesome/Nuxt. Preguntar si li sembla bé o ho vol canviar |

Quan es decideixi cadascun: escriure la decisió a `.claude/docs/decisions/` (regla 11/027) abans de tornar-lo a
preguntar.

## 4. Resum de tot el que ja està fet i validat (per no haver de rellegir tota la sessió)

- **Repo**: `danimo17/cv`, públic, gratuït (decisió 030), només l'usuari fa push/merge a `main` (031).
  Identitat local `danimo17 <daniel.spr17@gmail.com>`. LICENSE MIT + `CONTENT-LICENSE.md` (033).
- **Web**: Nuxt 4.5 + Tailwind v4 + Pinia + i18n (ca/es/en) + Font Awesome. Home amb hero (foto de LinkedIn),
  about, experiència, stack, formació, contacte, descàrrega de CV en PDF (redactat, sense telèfon ni codi
  postal — decisió 032). `/meme`: cerca a Giphy, previsualitza, "porta'l" substitueix la foto (Pinia, sense
  persistir a propòsit — 004). Banner carrusel infinit (`SourceBanner`/`AppMarquee`) amb enllaç al repo.
- **Arquitectura** (029): `server/api/giphy` → `app/services/giphy/GiphyService.ts` → `app/stores/{giphy,hero}.ts`
  → `app/pages/*.vue` → `app/ui-config/`. `app/domain/cv/`, `app/data/cv/`.
- **Primitius** (026): tot HTML "de fulla" passa per `app/components/shared/{AppText,AppInput,AppLink,AppImage,
AppButton,AppIcon,AppBadge,AppAlert,AppCard,AppSection,AppSkeleton,AppMarquee}`, forçat per ESLint
  `vue/no-restricted-html-elements`.
- **Estil**: neumorphism (025) amb tokens semàntics i ombres a `tokens.css`, un CSS per component (015/008),
  contrast AA calculat.
- **Governança `.claude/`**: mirall d'AI-METHODOLOGY.md (028): `hard-rules.md`, `rules/01..12`,
  `docs/{standards,decisions,catalog}`, `templates/`, `workflow.md`, `backlog.md`, hook
  `require-contract.{sh,py}`. 33 decisions numerades.
- **Gates**: `pnpm gate` (format+lint+typecheck+test) pre-commit; `pnpm gate:push` (+build+e2e) pre-push;
  CI (`ci.yml`) + seguretat (`security.yml`: gitleaks, `pnpm audit`, CodeQL) + preview (`preview.yml`) + deploy
  (`deploy.yml`, `workflow_run` després de `ci` verda a `main`) a `.github/workflows/`. Ruleset de `main` creat
  per l'usuari amb els 4 checks obligatoris. Dependabot configurat (`dependabot.yml`).
- **Tests**: 240 tests (16 fitxers: unit de stores/serveis/domini/server/components + arquitectura de
  fronteres/secrets/docs-sync/css-per-component/no-pii amb `pdf-parse`) + 5 E2E Playwright, tots en verd a la
  darrera execució (`gate:push` i `git push` d'aquesta nit).
- **README.md**: 546 línies, complet, en anglès.
- **Última validació real** (2026-09-14, abans del merge):
  ```
  prettier --check .  → OK
  eslint .            → 0 errors
  nuxt typecheck      → 0 errors
  vitest run          → 240 tests passed (16 files)
  nuxt build          → cloudflare_module OK, 326 kB gzip
  playwright test     → 5 passed
  ```

## 5. Subagents usats en tota la sessió (regla 12)

i18n · tests+e2e+catàleg · entorns/CI/deploy · capes+primitius (+marquee) · neumorphism · README. Tots van
acabar amb èxit i van deixar la gate en verd (verificat pel fil principal després de cada un).
