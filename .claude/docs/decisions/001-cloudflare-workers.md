# 001 · Hosting: Cloudflare Workers

**Context.** Cal SSR/rutes de servidor per amagar la clau de Giphy. L'usuari no tenia cap hosting.
**Decisió.** Cloudflare Workers (preset Nitro `cloudflare_module`, static assets). Desplegat des de GitHub Actions amb wrangler (decisió 021), no amb Workers Builds.
**Conseqüències.** Sense IPX (`@nuxt/image`) → 018. El build `.output` no es pot servir amb node: e2e contra `nuxt dev` → 019.
