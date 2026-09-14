# 024 · GitHub environment `production`, secrets de preview i ruleset de `main`

Data: 2026-09-14 · Estat: acceptada · Relacionades: 021 (entorns i deploy), 022 (escanejos de seguretat)

## Context

El deploy es fa només des de GitHub Actions amb wrangler (021). Cal decidir on viuen els secrets, com s'obtenen les previews de PR i com s'impedeix que entri a `main` codi que no ha passat la gate i els escanejos (022). El repo `danimo17/cv` és públic.

## Decisió

1. **Environment `production`** a GitHub amb tres secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `NUXT_GIPHY_API_KEY`. Només el job `deploy` (workflow `deploy.yml`) hi accedeix. Sense reviewers ni wait timer: el filtre és la gate, no una aprovació manual.
2. **`NUXT_GIPHY_API_KEY` es puja al Worker a cada deploy** (`wrangler-action` → `wrangler secret bulk`). GitHub és l'única font de veritat; el dashboard de Cloudflare no s'edita a mà.
3. **Previews amb secrets de repositori** (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, mateixos valors). Els environment secrets no són accessibles des d'un job sense `environment:`, i no volem que un PR necessiti l'environment de producció. `preview.yml` salta si no hi són.
4. **`workers_dev: false` + `preview_urls: true`** a `wrangler.jsonc`: producció només al domini propi; les previews a `<versió|àlies>-cv.<subdomini>.workers.dev`. `preview_urls` s'ha de posar explícitament perquè per defecte val `workers_dev` (wrangler ≥ 3.91). Les previews només poden viure a `workers.dev`, mai al domini propi. `preview.yml` fa `versions upload --preview-alias pr-<n> --message "PR #<n> <sha>"` (número + sha, no el títol: text d'usuari dins d'una ordre de shell) i llegeix `deployment-url` de wrangler-action (= `preview_url` de la versió).
5. **Deploy via `workflow_run`** de `ci` (conclusió `success`, event `push`, branca `main`), checkout del `head_sha` exacte, `concurrency: production` sense cancel·lar en curs. Alternativa descartada: `push` a `main` repetint la gate dins de `deploy.yml` (dobla el temps, duplica la definició i podria desplegar un commit amb la gate vermella si algú s'oblida d'un pas).
6. **Ruleset a `main`**: PR obligatori, checks requerits `gate`, `gitleaks`, `audit`, `CodeQL` (job names, font GitHub Actions), regla `code_scanning` amb CodeQL, sense force push ni esborrat, sense bypass. Es crea des de la UI o amb el `gh api` documentat a `.claude/docs/catalog/ai-workflow.md`.

## Conseqüències

- Rotar un secret = canviar-lo a GitHub (i, per al token de Cloudflare, als dos llocs) i deixar que el següent deploy el propagui.
- El mateix token serveix per a deploy i previews: un PR maliciós d'un fork no hi té accés (els secrets no arriben als `pull_request` de forks), però qualsevol PR intern pot pujar versions. Acceptable per a un repo personal.
- Les previews només existeixen després del primer deploy a producció (`versions upload` necessita que el Worker existeixi) i comparteixen els secrets del Worker de producció.
- `workflow_run` només es dispara si `deploy.yml` és a la branca per defecte: el primer deploy passa quan es fa merge d'aquesta feina a `main` i `ci` hi acaba en verd.
- **CodeQL**: gratuït perquè el repo és públic. Si mai passa a privat, cal GitHub Code Security (GHAS) o treure el job `codeql` i la regla `code_scanning` del ruleset; si no, cap PR podrà fer merge.
- Els checks requerits es referencien pel nom del job: canviar `name:` d'un job trenca el ruleset.
- gitleaks no necessita `GITLEAKS_LICENSE` (només repos d'organització); si el repo passés a una org, caldria el secret.
- El token de Cloudflare es crea amb la plantilla «Edit Cloudflare Workers» (Workers Scripts:Edit + Workers Routes:Edit sobre la zona `danimorales.dev` + Account Settings:Read); és la que Cloudflare documenta per a CI i cobreix `deploy`, `versions upload`, `secret bulk` i la ruta `custom_domain`. Si mai el deploy falla per permisos sobre el domini, s'afegeix `Zone:DNS:Edit` al mateix token.
