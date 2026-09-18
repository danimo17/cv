# 021 · Environments: local + production + PR previews; deploy from GitHub Actions

**Context.** The user wants a local environment and a production one, with well-managed secrets, and scans before deploying.
**Decision.** Local = `nuxt dev` with `.env`. Production = `cv` Worker at `danimorales.dev`, deployed only by `.github/workflows/deploy.yml` on push to `main` and only if CI is green. Each PR gets an ephemeral preview URL (`wrangler versions upload`). No staging and no develop branch. Secrets in GitHub (`production` environment): `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `NUXT_GIPHY_API_KEY`; the workflow injects them into the Worker. No manual approval: the PR merge is the approval.
**Consequences.** Workers Builds is not used. Rotating a key = change the secret in GitHub and redeploy.
