# Catalog · AI workflow (scripts, gates, hooks and workflows)

Living documentation (rule 07): every new or changed script, gate, hook or workflow is updated here in the same commit.

## Scripts (`package.json`)

| Script                            | Does                                                                                     | Who calls it           |
| --------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------- |
| `dev` / `build` / `preview`       | `nuxt dev` / `nuxt build` (preset `cloudflare_module`) / `nuxt preview`                  | you, CI                |
| `gate`                            | `format:check` + `lint` + `typecheck` + `test` (unit + arch)                             | `pre-commit`, `ci.yml` |
| `gate:push`                       | `gate` + `build` + `test:e2e`                                                            | `pre-push`             |
| `test` / `test:arch` / `test:e2e` | vitest / only `tests/arch` / Playwright (chromium, against `nuxt dev`, decision 019)     | you, CI                |
| `cf:dev` / `cf:deploy`            | `wrangler dev` / `wrangler deploy` (local testing only; the real deploy is `deploy.yml`) | you                    |
| `prepare` / `postinstall`         | `git config core.hooksPath .githooks` / `nuxt prepare`                                   | `pnpm install`         |

## Gates and hooks

| Hook                                                          | Runs                                                                               | Blocks                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `.githooks/pre-commit`                                        | `pnpm gate`                                                                        | the commit                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `.githooks/pre-push`                                          | `pnpm gate:push`                                                                   | the push                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `.claude/hooks/require-contract.sh` (PreToolUse Bash, Claude) | `require-contract.py`: looks for real `git commit`/`git push` calls in the command | `--no-verify`/`-n` (rule 09); with `ACTIVE` empty, any staged file outside `.claude/` (rule 10); with `ACTIVE` set and not closing, no `contract.md` with "Given" (rule 10); with `ACTIVE` set and the commit deletes the whole `.claude/tasks/<slug>/` tree, no fully-checked `.claude/tasks/closed/<slug>.md` staged alongside (rule 10, task-close-gate, decision 051); `git commit` staging `nuxt.config.ts` or `eslint.config.mjs` without also staging a file under `.claude/docs/decisions/` (rule 11, added in decision 041) |

Manual check of the hook (criterion 11 of the `bootstrap` contract): from Claude, with `ACTIVE` empty, `git commit -m x` must fail with "Rule 10: no commit without an active contract"; with a valid contract, `git commit --no-verify -m x` must fail with "Rule 09: --no-verify / -n is not allowed". It only looks at actual git invocations (start of line or after `;`, `&&`, `||`, `|`), not prose inside heredocs. Staging `nuxt.config.ts`/`eslint.config.mjs` alone (no decision file staged) must fail with "Rule 11: this commit changes nuxt.config.ts or eslint.config.mjs...".

**Post-merge deploy verification (decision 042):** CI green on the PR only proves the code is correct — it
never proves `deploy.yml` actually reached Cloudflare (PR #2, 2026-09-18: CI green, deploy failed on
Cloudflare error 10215, unnoticed for 2 days because no step checked). Manual, mandatory step between merge
and closing a task: `gh run list --branch main --limit 1 --workflow deploy.yml` must show `success` for that
commit before the task is marked done. Tracked per-task in `handoff.md`'s "Post-merge deploy check" section.

## Environments and deploy

Decisions: 021 (environments), 022 (scans), 024 (GitHub environment, secrets, ruleset).

### Environments

| Environment    | How                                                                                      | Giphy secret                                         |
| -------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **local**      | `pnpm dev` + local `.env` (`NUXT_GIPHY_API_KEY`)                                         | `.env`, never committed                              |
| **preview**    | an ephemeral URL per PR: `pr-<n>-cv.<subdomain>.workers.dev` (alias) and `<version>-cv…` | inherits the secrets from the production Worker      |
| **production** | Worker `cv` at `danimorales.dev` (`workers_dev: false`)                                  | uploaded by `deploy.yml` from GitHub on every deploy |

There is no staging. Previews don't work until the Worker exists (first merge to `main`).

### Workflows (`.github/workflows/`)

| Workflow       | Trigger                                            | Jobs (= check name)                 | What it does                                                                                                     |
| -------------- | -------------------------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `ci.yml`       | `pull_request`, `push` to `main`                   | `gate`                              | `pnpm gate` + `build` + e2e (chromium). Uploads `playwright-report` on failure.                                  |
| `security.yml` | `pull_request`, `push` to `main`, Monday 06:00 UTC | `gitleaks`, `audit`, `CodeQL`       | secrets across the whole history, `pnpm audit --audit-level=high`, CodeQL javascript-typescript.                 |
| `preview.yml`  | `pull_request`                                     | `preview`                           | `wrangler versions upload --preview-alias pr-<n>` and comments the URL on the PR. Skips if there are no secrets. |
| `deploy.yml`   | `workflow_run` of `ci` finishing green on `main`   | `deploy` (environment `production`) | checkout of the exact `head_sha`, build, `wrangler deploy`, then a separate step uploads `NUXT_GIPHY_API_KEY`.   |

Dependabot (`.github/dependabot.yml`): npm (pnpm-lock) weekly with minor+patch grouped, GitHub Actions weekly grouped.

Action versions (verified 2026-09-14): `actions/checkout@v7`, `actions/setup-node@v7`, `pnpm/action-setup@v6` (reads `packageManager` from `package.json`), `actions/upload-artifact@v7`, `actions/github-script@v9`, `cloudflare/wrangler-action@v4`, `gitleaks/gitleaks-action@v3`, `github/codeql-action@v4`. Dependabot keeps them up to date.

Why `workflow_run` and not `push`: it only deploys the commit that has already passed the gate, without re-running it or duplicating its definition. Trade-off: the workflow has to already exist on `main` to trigger, and the deploy run doesn't show up on the PR (it shows up under Actions → deploy).

### pnpm 12 in CI

- `pnpm install --frozen-lockfile` always: CI never resolves new versions, it only installs the lockfile. Node comes from `.node-version` (24), not from `engines`.
- `minimumReleaseAge` (default 1440 min = 1 day) also applies to the lockfile: a version published less than a day ago makes the install fail, including in CI. One-off exceptions in `pnpm-workspace.yaml`'s `minimumReleaseAgeExclude` (currently: `wrangler`, `miniflare`), removed once no longer needed.
- `allowBuilds` (`pnpm-workspace.yaml`) is the list of deps allowed to run build scripts (`esbuild`, `unrs-resolver`, `workerd`). A new dep with a `postinstall` makes the install fail until it's added there; never `dangerouslyAllowAllBuilds`.

### Secrets

| Secret                  | Where it lives (GitHub)                 | Who creates it             | What for                                                                                                                                                                                            | Rotation                                                          |
| ----------------------- | --------------------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`  | `production` environment and repository | you (Cloudflare dashboard) | `deploy.yml` (env) and `preview.yml` (repo)                                                                                                                                                         | new token in Cloudflare → update both places → revoke the old one |
| `CLOUDFLARE_ACCOUNT_ID` | `production` environment and repository | you                        | same                                                                                                                                                                                                | doesn't rotate                                                    |
| `NUXT_GIPHY_API_KEY`    | `production` environment                | you (developers.giphy.com) | `deploy.yml` uploads it to the Worker in a step after `wrangler deploy` (uploading before the deploy makes Cloudflare reject it with error 10215 when the latest Worker version isn't deployed yet) | change it on GitHub → next deploy (or re-run deploy)              |

The two repository secrets (previews) can hold the same values as the environment ones. Never in chat, never in the repo (rule 01). The Worker is never touched by hand: if someone sets a secret in the dashboard, the next deploy overwrites it.

### Protection of `main` (ruleset)

Required checks, with the exact job name: `gate`, `gitleaks`, `audit`, `CodeQL` (source: GitHub Actions, app id 15368). Plus: PR required, no force push, no branch deletion, and a "code scanning" rule with CodeQL.

UI: Settings → Rules → Rulesets → New branch ruleset (target: default branch). Or, with `gh` authenticated as a repo admin:

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

No `bypass_actors`: not even the admin can skip the gate. If that's ever needed, it's added from the UI.
