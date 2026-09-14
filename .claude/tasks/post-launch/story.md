# Story: Post-launch fixes (DNS, www, Dependabot, backlog)

**Slug:** `post-launch` · **Branca:** `feat/post-launch` (crear-la a partir d'aquesta) · **Estat:** doing

Com a Daniel vull que `danimorales.dev` i `www.danimorales.dev` responguin de veritat, que el pipeline de
Dependabot no falli, i vull decidir els punts oberts (D1-D5) del bootstrap, per poder dir que el lloc és
"acabat" i passar a la següent iteració.

## Fora d'abast

- Noves funcionalitats de producte (secció projectes, analítica...) fins que D1-D5 es decideixin.

## Dependències externes

- Propagació DNS de Cloudflare (fora del nostre control, només esperar/verificar).
- Accés de l'usuari al dashboard de Cloudflare i a GitHub (regla 06/031: només ell fa push/merge).
