# 021 · Entorns: local + producció + previews de PR; deploy des de GitHub Actions

**Context.** L'usuari vol un entorn local i un de producció, amb secrets ben gestionats, i escanejos abans de desplegar.
**Decisió.** Local = `nuxt dev` amb `.env`. Producció = Worker `cv` a `danimorales.dev`, desplegat només per `.github/workflows/deploy.yml` en push a `main` i només si la CI hi és verda. Cada PR obté una URL de preview efímera (`wrangler versions upload`). Sense staging ni branca develop. Secrets a GitHub (entorn `production`): `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `NUXT_GIPHY_API_KEY`; el workflow els injecta al Worker. Sense aprovació manual: el merge de la PR és l'aprovació.
**Conseqüències.** Workers Builds no s'usa. Rotar una clau = canviar el secret a GitHub i redesplegar.
