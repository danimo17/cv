# 018 · No @nuxt/image

**Context.** IPX (the default provider) needs Node; it doesn't run on Cloudflare Workers.
**Decision.** Static images, already optimized (JPEG at size). If responsive sizes are ever needed, generate them at build time or use the `cloudflare` provider of @nuxt/image.
