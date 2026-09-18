# 019 · E2E against nuxt dev

**Context.** The build with the Cloudflare preset doesn't run under node.
**Decision.** Playwright starts `pnpm dev --port 3100`; calls to `/api/giphy/**` are mocked with `page.route` (no key needed). `gate:push` does build (Cloudflare) + e2e (dev).
