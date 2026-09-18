# 001 · Hosting: Cloudflare Workers

**Context.** SSR/server routes are needed to hide the Giphy key. The user had no hosting.
**Decision.** Cloudflare Workers (Nitro preset `cloudflare_module`, static assets). Deployed from GitHub Actions with wrangler (decision 021), not with Workers Builds.
**Consequences.** No IPX (`@nuxt/image`) → 018. The `.output` build cannot be served with node: e2e runs against `nuxt dev` → 019.
