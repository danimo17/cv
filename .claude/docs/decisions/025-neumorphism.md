# 025 · Estil visual: neumorphism

**Context.** L'usuari ha canviat la directiva d'estil (substitueix la 011).
**Decisió.** Neumorphism (soft UI): superfícies del mateix color que el fons, relleu per doble ombra (clara a dalt-esquerra, fosca a baix-dreta), estats premuts/inputs en `inset`, radis grans. Es manté: tipografia de sistema, tokens semàntics amb estats, mode fosc real (ombres recalculades), un CSS per component (regla 08). Restriccions d'accessibilitat: el text no depèn mai de l'ombra per ser llegible; contrast AA amb els tokens `text`/`text-muted`; l'accent `primary` continua tenint fons ple per als CTA; focus visible amb anell.
**Conseqüències.** Tokens nous d'ombra (`--shadow-neu*`) i colors de llum/ombra a `tokens.css`; cap canvi de classes ni de components.

**Conseqüències aplicades (2026-09-14).** A `tokens.css` (`@theme`, amb overrides sota `.dark`): colors
`--color-neu-light` / `--color-neu-dark` (llum dalt-esquerra, ombra baix-dreta); ombres `--shadow-neu`,
`--shadow-neu-sm`, `--shadow-neu-lg`, `--shadow-neu-inset`, `--shadow-neu-inset-sm`, `--shadow-neu-none`
(utilitats `shadow-neu*`, usables dins d'`@apply`; referencien els colors `neu-*`, per això el mode fosc només
redefineix aquests dos colors); radis `--radius-sm/md/lg/xl` ampliats (0.5 / 0.75 / 1 / 1.5 rem) i nous
`--radius-2xl/3xl` (2 / 2.5 rem); `surface` passa a gris-blau suau (`oklch(94% .008 250)` / `oklch(23% .015 250)`)
i els tons es reajusten per mantenir AA (taula de contrast a `catalog/styles.md`). Receptes per estat
(raised / pressed / inset / flat) a `standards/styling.md`; cap classe ni modificador canvia, només el CSS de cada
component, `base.css` i `pages.css`.
