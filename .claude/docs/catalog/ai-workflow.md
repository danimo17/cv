# Catàleg · AI workflow (scripts, gates, hooks i workflows)

Documentació viva (regla 07): cada script, gate, hook o workflow nou o canviat s'actualitza aquí al mateix commit.

## Scripts (`package.json`)

| Script                            | Fa                                                                                             | Qui el crida           |
| --------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------- |
| `dev` / `build` / `preview`       | `nuxt dev` / `nuxt build` (preset `cloudflare_module`) / `nuxt preview`                        | tu, CI                 |
| `gate`                            | `format:check` + `lint` + `typecheck` + `test` (unit + arch)                                   | `pre-commit`, `ci.yml` |
| `gate:push`                       | `gate` + `build` + `test:e2e`                                                                  | `pre-push`             |
| `test` / `test:arch` / `test:e2e` | vitest / només `tests/arch` / Playwright (chromium, contra `nuxt dev`, decisió 019)            | tu, CI                 |
| `cf:dev` / `cf:deploy`            | `wrangler dev` / `wrangler deploy` (només per a proves locals; el deploy real és `deploy.yml`) | tu                     |
| `prepare` / `postinstall`         | `git config core.hooksPath .githooks` / `nuxt prepare`                                         | `pnpm install`         |

## Gates i hooks

| Hook                                                          | Executa                                                              | Bloqueja                                                                                                         |
| ------------------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `.githooks/pre-commit`                                        | `pnpm gate`                                                          | el commit                                                                                                        |
| `.githooks/pre-push`                                          | `pnpm gate:push`                                                     | el push                                                                                                          |
| `.claude/hooks/require-contract.sh` (PreToolUse Bash, Claude) | `require-contract.py`: cerca `git commit`/`git push` reals a l'ordre | `--no-verify`/`-n` (regla 09) i `git commit` sense `.claude/tasks/ACTIVE` + `contract.md` amb «Given» (regla 10) |

Comprovació manual del hook (criteri 11 del contracte `bootstrap`): des de Claude, amb `ACTIVE` buit, `git commit -m x` ha de sortir amb «Regla 10: cap commit sense contracte actiu»; amb contracte vàlid, `git commit --no-verify -m x` ha de sortir amb «Regla 09: --no-verify / -n no esta permes». Només mira invocacions reals de git (inici de línia o després de `;`, `&&`, `||`, `|`), no prosa dins de heredocs.

## Entorns i deploy

Decisions: 021 (entorns), 022 (escanejos), 024 (GitHub environment, secrets, ruleset).

### Entorns

| Entorn         | Com                                                                                  | Secret Giphy                                     |
| -------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------ |
| **local**      | `pnpm dev` + `.env` local (`NUXT_GIPHY_API_KEY`)                                     | `.env`, mai versionat                            |
| **preview**    | una URL efímera per PR: `pr-<n>-cv.<subdomini>.workers.dev` (àlies) i `<versió>-cv…` | hereta els secrets del Worker de producció       |
| **production** | Worker `cv` a `danimorales.dev` (`workers_dev: false`)                               | el puja `deploy.yml` des de GitHub a cada deploy |

No hi ha staging. Les previews no funcionen fins que el Worker existeix (primer merge a `main`).

### Workflows (`.github/workflows/`)

| Workflow       | Trigger                                            | Jobs (= nom del check)              | Què fa                                                                                               |
| -------------- | -------------------------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `ci.yml`       | `pull_request`, `push` a `main`                    | `gate`                              | `pnpm gate` + `build` + e2e (chromium). Puja `playwright-report` si falla.                           |
| `security.yml` | `pull_request`, `push` a `main`, dilluns 06:00 UTC | `gitleaks`, `audit`, `CodeQL`       | secrets a tot l'historial, `pnpm audit --audit-level=high`, CodeQL javascript-typescript.            |
| `preview.yml`  | `pull_request`                                     | `preview`                           | `wrangler versions upload --preview-alias pr-<n>` i comenta la URL al PR. Salta si no hi ha secrets. |
| `deploy.yml`   | `workflow_run` de `ci` acabat en verd sobre `main` | `deploy` (environment `production`) | checkout del `head_sha` exacte, build, `wrangler deploy` + puja `NUXT_GIPHY_API_KEY`.                |

Dependabot (`.github/dependabot.yml`): npm (pnpm-lock) setmanal amb minor+patch agrupats, GitHub Actions setmanal agrupat.

Versions d'actions (verificades 2026-09-14): `actions/checkout@v7`, `actions/setup-node@v7`, `pnpm/action-setup@v6` (llegeix `packageManager` de `package.json`), `actions/upload-artifact@v7`, `actions/github-script@v9`, `cloudflare/wrangler-action@v4`, `gitleaks/gitleaks-action@v3`, `github/codeql-action@v4`. Dependabot les manté.

Per què `workflow_run` i no `push`: només desplega el commit que ja ha passat la gate, sense repetir-la ni duplicar-ne la definició. Contrapartida: el workflow ha d'existir a `main` per disparar-se, i el run de deploy no surt al PR (surt a Actions → deploy).

### pnpm 12 a la CI

- `pnpm install --frozen-lockfile` sempre: la CI no resol versions noves, només instal·la el lockfile. Node surt de `.node-version` (24), no d'`engines`.
- `minimumReleaseAge` (per defecte 1440 min = 1 dia) també s'aplica al lockfile: una versió publicada fa menys d'un dia fa fallar l'install, també a la CI. Excepcions puntuals a `minimumReleaseAgeExclude` de `pnpm-workspace.yaml` (ara: `wrangler`, `miniflare`), i es treuen quan ja no calen.
- `allowBuilds` (`pnpm-workspace.yaml`) és la llista de deps amb scripts de build permesos (`esbuild`, `unrs-resolver`, `workerd`). Una dep nova amb `postinstall` fa fallar l'install fins que s'hi afegeix; mai `dangerouslyAllowAllBuilds`.

### Secrets

| Secret                  | On viu (GitHub)                       | Qui el crea               | Per a què                                 | Rotació                                                            |
| ----------------------- | ------------------------------------- | ------------------------- | ----------------------------------------- | ------------------------------------------------------------------ |
| `CLOUDFLARE_API_TOKEN`  | environment `production` i repositori | tu (Cloudflare dashboard) | `deploy.yml` (env) i `preview.yml` (repo) | nou token a Cloudflare → actualitza els dos llocs → revoca l'antic |
| `CLOUDFLARE_ACCOUNT_ID` | environment `production` i repositori | tu                        | idem                                      | no rota                                                            |
| `NUXT_GIPHY_API_KEY`    | environment `production`              | tu (developers.giphy.com) | `deploy.yml` la puja al Worker            | canvia-la a GitHub → següent deploy (o re-run de deploy)           |

Els dos secrets de repositori (previews) poden tenir els mateixos valors que els de l'environment. Mai al xat, mai al repo (regla 01). El Worker no es toca a mà: si algú posa un secret al dashboard, el següent deploy el sobreescriu.

### Protecció de `main` (ruleset)

Checks requerits, amb el nom exacte del job: `gate`, `gitleaks`, `audit`, `CodeQL` (font: GitHub Actions, app id 15368). A més: PR obligatori, sense force push, sense esborrar la branca, i regla «code scanning» amb CodeQL.

UI: Settings → Rules → Rulesets → New branch ruleset (target: default branch). O bé, amb `gh` autenticat com a admin del repo:

```bash
gh api -X POST repos/danimo17/cv/rulesets --input ruleset.json
```

`ruleset.json`:

```json
{
  "name": "main",
  "target": "branch",
  "enforcement": "active",
  "conditions": { "ref_name": { "include": ["~DEFAULT_BRANCH"], "exclude": [] } },
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 0,
        "dismiss_stale_reviews_on_push": false,
        "require_code_owner_review": false,
        "require_last_push_approval": false,
        "required_review_thread_resolution": false,
        "allowed_merge_methods": ["squash", "merge"]
      }
    },
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": false,
        "do_not_enforce_on_create": true,
        "required_status_checks": [
          { "context": "gate", "integration_id": 15368 },
          { "context": "gitleaks", "integration_id": 15368 },
          { "context": "audit", "integration_id": 15368 },
          { "context": "CodeQL", "integration_id": 15368 }
        ]
      }
    },
    {
      "type": "code_scanning",
      "parameters": {
        "code_scanning_tools": [
          {
            "tool": "CodeQL",
            "security_alerts_threshold": "high_or_higher",
            "alerts_threshold": "errors"
          }
        ]
      }
    }
  ]
}
```

Sense `bypass_actors`: ni l'admin pot saltar-se la gate. Si un dia cal, s'afegeix des de la UI.
