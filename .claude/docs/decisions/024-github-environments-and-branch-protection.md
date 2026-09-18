# 024 · GitHub `production` environment, preview secrets, and `main` ruleset

Date: 2026-09-14 · Status: accepted · Related: 021 (environments and deploy), 022 (security scans)

## Context

Deploy happens only from GitHub Actions with wrangler (021). It needs to be decided where secrets live, how PR previews are obtained, and how to prevent code that hasn't passed the gate and the scans (022) from entering `main`. The `danimo17/cv` repo is public.

## Decision

1. **`production` environment** in GitHub with three secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `NUXT_GIPHY_API_KEY`. Only the `deploy` job (`deploy.yml` workflow) accesses it. No reviewers or wait timer: the filter is the gate, not a manual approval.
2. **`NUXT_GIPHY_API_KEY` is uploaded to the Worker on every deploy** (`wrangler-action` → `wrangler secret bulk`). GitHub is the single source of truth; the Cloudflare dashboard is not edited by hand.
3. **Previews with repository secrets** (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, same values). Environment secrets aren't accessible from a job without `environment:`, and we don't want a PR to need the production environment. `preview.yml` skips if they're absent.
4. **`workers_dev: false` + `preview_urls: true`** in `wrangler.jsonc`: production only on the custom domain; previews at `<version|alias>-cv.<subdomain>.workers.dev`. `preview_urls` must be set explicitly because by default it takes the value of `workers_dev` (wrangler ≥ 3.91). Previews can only ever live on `workers.dev`, never on the custom domain. `preview.yml` runs `versions upload --preview-alias pr-<n> --message "PR #<n> <sha>"` (number + sha, not the title: user text inside a shell command) and reads `deployment-url` from wrangler-action (= the version's `preview_url`).
5. **Deploy via `workflow_run`** of `ci` (conclusion `success`, event `push`, branch `main`), checkout of the exact `head_sha`, `concurrency: production` without cancelling an in-progress run. Discarded alternative: `push` to `main` repeating the gate inside `deploy.yml` (doubles the time, duplicates the definition, and could deploy a commit with a red gate if someone forgets a step).
6. **Ruleset on `main`**: PR required, required checks `gate`, `gitleaks`, `audit`, `CodeQL` (job names, GitHub Actions source), `code_scanning` rule with CodeQL, no force push or deletion, no bypass. Created from the UI or with the `gh api` documented at `.claude/docs/catalog/ai-workflow.md`.

## Consequences

- Rotating a secret = changing it in GitHub (and, for the Cloudflare token, in both places) and letting the next deploy propagate it.
- The same token serves both deploy and previews: a malicious PR from a fork has no access to it (secrets don't reach `pull_request` events from forks), but any internal PR can upload versions. Acceptable for a personal repo.
- Previews only exist after the first production deploy (`versions upload` needs the Worker to exist) and share the production Worker's secrets.
- `workflow_run` only fires if `deploy.yml` is on the default branch: the first deploy happens when this work is merged into `main` and `ci` finishes green there.
- **CodeQL**: free because the repo is public. If it ever goes private, GitHub Code Security (GHAS) is needed, or the `codeql` job and the `code_scanning` rule must be removed from the ruleset; otherwise no PR will be able to merge.
- Required checks are referenced by job name: changing a job's `name:` breaks the ruleset.
- gitleaks doesn't need `GITLEAKS_LICENSE` (only for organization repos); if the repo ever moved to an org, the secret would be needed.
- The Cloudflare token is created with the "Edit Cloudflare Workers" template (Workers Scripts:Edit + Workers Routes:Edit over the `danimorales.dev` zone + Account Settings:Read); it's the one Cloudflare documents for CI and covers `deploy`, `versions upload`, `secret bulk`, and the `custom_domain` route. If deploy ever fails on domain permissions, `Zone:DNS:Edit` gets added to the same token.
