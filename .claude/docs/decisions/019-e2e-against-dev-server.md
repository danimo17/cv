# 019 · E2E contra nuxt dev

**Context.** El build amb preset Cloudflare no s'executa amb node.
**Decisió.** Playwright aixeca `pnpm dev --port 3100`; les crides a `/api/giphy/**` es mockegen amb `page.route` (no cal clau). `gate:push` fa build (Cloudflare) + e2e (dev).
