# 005 · Theme and language DO persist

**Decision.** Theme via `@nuxtjs/color-mode` (localStorage, default `system`, fallback `light`). Language via `@nuxtjs/i18n` (cookie `i18n_redirected`, default `en`, browser detection only at the root).
