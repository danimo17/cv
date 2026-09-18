# 01 · Secrets

**What.** No key, token or credential in any versioned file, in any chat message, in any log or in any test.

- Local: `.env` (git-ignored). `.env.example` only with names and empty values.
- Production: GitHub secrets (`production` environment) that the deploy workflow injects into the Worker. Never set manually in the dashboard if it can be avoided: a single place to rotate.
- Nuxt maps `NUXT_GIPHY_API_KEY` → `runtimeConfig.giphyApiKey` (server-only, never in `runtimeConfig.public`).
- The client doesn't know the key: it only calls `/api/giphy/*`.
- The AI never reads `.env` (the user's global `protect-secrets` hook blocks it); it doesn't need to either. The AI never writes key values: the user puts them in.

**Why.** A key in the repo or in the chat is public forever (history, copies, logs).

**If a key gets exposed.** It's not deleted: it's **regenerated** at the provider and `.env` + the GitHub secret are updated.

**How it's checked.** `tests/arch/secrets.spec.ts` (no `.env`/`.dev.vars` tracked; no file with `NUXT_GIPHY_API_KEY=` followed by a value that looks like a key; `api_key` only in `server/`) and gitleaks in CI.
