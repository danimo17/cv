# Story: Post-launch fixes (DNS, www, Dependabot, backlog)

**Slug:** `post-launch` · **Branca:** `feat/post-launch` (crear-la a partir d'aquesta) · **Estat:** doing

Com a Daniel vull que `danimorales.dev` i `www.danimorales.dev` responguin de veritat, que el pipeline de
Dependabot no falli, i vull decidir els punts oberts (D1-D5) del bootstrap, per poder dir que el lloc és
"acabat" i passar a la següent iteració.

## Fora d'abast

- Secció "Projectes" (descartada, decisió 035).
- Generar mides reals de la foto (decisió 037: `CustomImage` només queda preparat per a `srcset`/`sizes`).
- Activar Cloudflare Web Analytics (decisió 036: acció manual de dashboard, no codi).

## Dependències externes

- Propagació DNS de Cloudflare (fora del nostre control, només esperar/verificar).
- Accés de l'usuari al dashboard de Cloudflare i a GitHub (regla 06/031: només ell fa push/merge).
