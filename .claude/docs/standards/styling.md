# Standard · Estils

Curt a propòsit: descriu les regles vigents (decisions 015, 025, 026). Estil visual: **neumorphism / soft UI**
(decisió 025, substitueix la 011). Valors i classes concretes: `.claude/docs/catalog/styles.md`.

- **Tokens.** Tots els colors, radis, ombres i fonts són tokens semàntics de `app/assets/css/tokens.css` (`@theme`):
  `surface`, `surface-alt`, `border`, `text`, `text-muted`, `neu-light`, `neu-dark`, les ombres `--shadow-neu*` i,
  per a cada to (`primary … danger`), `-`, `-fg`, `-soft`. Mode fosc = mateixos noms sota `.dark`; cap component
  escriu `dark:`. Cap color ni valor d'ombra cru fora d'aquest fitxer.
- **Un CSS per component** (regla 08). `app/assets/css/components/<kebab>.css`, importat a `main.css`, amb el bloc
  `.kebab` i BEM-lite (`.kebab--modificador`, `.kebab__element`). Tot via `@apply` de tokens/utilitats dins de
  `@layer components`. Test: `tests/arch/css-per-component.spec.ts`. Pàgines i layout: `pages.css` i `base.css`.
- **Al template només classes pròpies.** Cap utilitat Tailwind (`vue/no-restricted-class` bloqueja
  `bg-|text-|p-|px-|py-|m-|gap-|rounded-|border-|shadow-|font-|w-|h-|max-w-|max-h-|size-`). Llista d'utilitats de
  layout permeses al template: **cap** (tot al CSS del component). Passar `class="bloc__part"` a un component fill
  (`AppText`, `AppLink`, `AppSection`…) sí que és correcte: el fill la fusiona a la seva arrel.
- **Tipografia només via `AppText`.** `app-text.css` és l'únic fitxer amb mides (`text-xs … text-6xl`), pesos i
  colors de text per a contingut. Els CSS de seccions i layout només tenen layout, espai, fons i relleu. Excepcions
  documentades a `catalog/styles.md`: text propi dels controls (`AppButton`, `AppInput__control`, `AppIcon`,
  base d'`AppAlert`, `LocaleSwitcher__item`, `AppHeader__brand`).
- **Primitius** (decisió 026). L'aspecte d'enllaços, imatges, inputs, botons, badges, alertes, cards i marquesines
  es canvia al CSS del primitiu, mai al del consumidor. Un consumidor només afegeix layout (`aspect-square`,
  `w-full`, marges) a la seva pròpia classe passada per `class`.

## Regles neumòrfiques

- **Mateix color, dues ombres.** Els relleus són `bg-surface` (o el `-soft`/ple del to) sense vores; el volum el
  donen `shadow-neu*` (clara dalt-esquerra `neu-light`, fosca baix-dreta `neu-dark`). Les vores (`border-border`)
  queden per a línies residuals (línia de temps), no per delimitar caixes.
- **Què va en relleu (raised).** Tot el que és accionable o "objecte": botons (`shadow-neu`), cards outline
  (`neu-sm`) i elevated (`neu-lg`), capçalera, marc de la figura del hero, imatge del preview, badges, alertes,
  punts de la línia de temps, theme toggle, ítem actiu del locale switcher, meme cards.
- **Què va enfonsat (inset).** Tot el que és "contenidor" o s'escriu: controls d'`AppInput` (`shadow-neu-inset`),
  radio/checkbox sense marcar, cards filled, skeletons, pistes (locale switcher, marquesina, banner), nav actiu,
  peu de pàgina. Fons `bg-surface-alt` perquè el buit es llegeixi també sense ombra.
- **Què és pla.** Botons ghost en repòs, enllaços inline/subtle, seccions i pàgines: el relleu el posen els
  primitius que contenen, no el contenidor.
- **Hover/active.** Hover = relleu més curt (`shadow-neu-sm`); active, `--loading` i `--selected` = enfonsat
  (`shadow-neu-inset`); disabled = `opacity-50` i relleu curt. Ghost: pla → hover `neu-sm` → active inset.
  Sempre amb `transition-shadow` (o `transition-[color,box-shadow]`).
- **Focus i inputs.** Focus d'input = inset + `ring-2 ring-primary/40`; danger = `ring-1 ring-danger`. L'anell de
  focus global (`outline-primary`, `base.css`) no es treu mai.
- **Accessibilitat.** Cap estat depèn només de l'ombra: el seleccionat/actiu porta també color o anell, el
  marcat de radio/checkbox porta fons del to i marca en `-fg`, els CTA `primary` continuen amb fons ple. Contrast
  AA (≥ 4.5:1) de `text` i `text-muted` sobre `surface` i `surface-alt` en els dos modes (taula al catàleg);
  qualsevol canvi de `surface` obliga a recalcular-lo. El focus sempre és visible.
- **Radis grans** (`--radius-*` a tokens): `rounded-lg` per a controls, `rounded-xl` per a cards, `rounded-2xl/3xl`
  per a marcs grans, `rounded-full` per a badges/toggle/punts.
- **Moviment.** Tota transició i animació respecta `prefers-reduced-motion: reduce` (`base.css` talla les
  transicions; `app-marquee.css` i `app-skeleton.css` treuen l'animació).
- **Estats.** Els estats semàntics (`success`, `danger`…) surten sempre dels mateixos tokens per to; un modificador
  per estat (`--loading`, `--selected`, `--active`, `--disabled`).
- **Catàleg.** Token, classe o estat nou → `.claude/docs/catalog/styles.md` al mateix canvi (regla 07).
