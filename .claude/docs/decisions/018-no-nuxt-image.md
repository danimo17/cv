# 018 · Sense @nuxt/image

**Context.** IPX (el proveïdor per defecte) necessita Node; no corre a Cloudflare Workers.
**Decisió.** Imatges estàtiques ja optimitzades (JPEG a mida). Si un dia calen mides responsive, generar-les al build o usar el proveïdor `cloudflare` de @nuxt/image.
