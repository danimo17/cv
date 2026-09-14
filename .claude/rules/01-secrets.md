# 01 · Secrets

**Què.** Cap clau, token o credencial en cap fitxer versionat, en cap missatge del xat, en cap log ni en cap test.

- Local: `.env` (ignorat per git). `.env.example` només amb noms i valors buits.
- Producció: secrets de GitHub (entorn `production`) que el workflow de deploy injecta al Worker. Mai al dashboard a mà si es pot evitar: un sol lloc per rotar.
- Nuxt mapeja `NUXT_GIPHY_API_KEY` → `runtimeConfig.giphyApiKey` (server-only, mai a `runtimeConfig.public`).
- El client no coneix la clau: només crida `/api/giphy/*`.
- La IA no llegeix mai `.env` (el hook global `protect-secrets` de l'usuari ho bloqueja); tampoc cal. La IA no escriu mai valors de claus: l'usuari els posa.

**Per què.** Una clau al repo o al xat és pública per sempre (historial, còpies, logs).

**Si una clau s'exposa.** No s'esborra: es **regenera** al proveïdor i s'actualitza `.env` + el secret de GitHub.

**Com es comprova.** `tests/arch/secrets.spec.ts` (cap `.env`/`.dev.vars` traçat; cap fitxer amb `NUXT_GIPHY_API_KEY=` seguit d'un valor amb pinta de clau; `api_key` només a `server/`) i gitleaks a la CI.
