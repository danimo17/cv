# 036 · Analítica: Cloudflare Web Analytics, Automatic Setup

**Decisió (D3 del handoff post-launch).** S'activa Cloudflare Web Analytics. Compleix decisió 030 (cost zero)
i no usa cookies. S'usa el mode **Automatic Setup** del dashboard de Cloudflare (Analytics & Logs → Web
Analytics → afegir zona `danimorales.dev`, sense "Manual Setup"): injecta el beacon a nivell d'edge per a tot
el trànsit HTML de la zona, sense tocar codi ni afegir cap script al repo.
**Conseqüències.** Acció manual al dashboard de Cloudflare (fora de l'abast de la IA, com el DNS de `www`).
Res a `app/` ni a `nuxt.config.ts`.

**Fet.** Zona `danimorales.dev` afegida amb Automatic Setup (2026-09-16); dades reals ja arribant (verificat
captura del dashboard: 14 page views / 5 visits a les últimes 24h).
