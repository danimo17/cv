# Catàleg · Estils (tokens, ombres neumòrfiques, escala tipogràfica, classes per component)

Documentació viva (regla 07): token, classe o estat nou o canviat → aquest fitxer al mateix canvi. Descriu el que
hi ha **ara**: neumorphism / soft UI (decisió 025) sobre els primitius propis (decisió 026).

## Tokens (`app/assets/css/tokens.css`, `@theme` de Tailwind v4)

Únic fitxer amb colors crus. Mode fosc: mateixos noms, valors nous sota `.dark` (cap component necessita `dark:`).
La idea del neumorphism: tot és del **mateix color que el fons** (`surface`) i el volum el donen dues ombres, una
clara a dalt-esquerra (`neu-light`) i una fosca a baix-dreta (`neu-dark`).

| Token                         | Ús                                                                            | Clar                       | Fosc                  |
| ----------------------------- | ----------------------------------------------------------------------------- | -------------------------- | --------------------- |
| `--font-sans` / `--font-mono` | `font-sans` (body), `font-mono`                                               | system-ui… / ui-monospace… | =                     |
| `--radius-sm/md/lg/xl`        | `rounded-sm/md/lg/xl`                                                         | 0.5 / 0.75 / 1 / 1.5 rem   | =                     |
| `--radius-2xl/3xl`            | `rounded-2xl/3xl` (marcs grans: figura del hero, card "com funciona")         | 2 / 2.5 rem                | =                     |
| `--color-surface`             | fons de pàgina i de tot relleu (cards, botons, marcs)                         | `oklch(94% .008 250)`      | `oklch(23% .015 250)` |
| `--color-surface-alt`         | fons de les zones enfonsades (inputs, cards filled, pistes, skeleton, footer) | `oklch(91.5% .01 250)`     | `oklch(20% .015 250)` |
| `--color-border`              | línies residuals (línia de temps)                                             | `oklch(86% .012 250)`      | `oklch(32% .015 250)` |
| `--color-text`                | text principal                                                                | `oklch(24% .02 250)`       | `oklch(94% .005 250)` |
| `--color-text-muted`          | text secundari                                                                | `oklch(46% .02 250)`       | `oklch(72% .015 250)` |
| `--color-neu-light`           | ombra clara (dalt-esquerra) del relleu                                        | `oklch(100% 0 0)`          | `oklch(29% .018 250)` |
| `--color-neu-dark`            | ombra fosca (baix-dreta) del relleu                                           | `oklch(82% .02 250)`       | `oklch(15% .015 250)` |
| `--color-<tone>`              | color del to (`primary, secondary, neutral, success, info, warning, danger`)  | veg. fitxer                | veg. fitxer           |
| `--color-<tone>-fg`           | text sobre fons ple del to                                                    |                            |                       |
| `--color-<tone>-soft`         | fons suau del to (badges soft, alerts, marquesina)                            |                            |                       |

Tons (clar → fosc, L/C/h en oklch): `primary` 48%/.2/268 → 76%/.14/268 · `secondary` 36%/.03/260 → 82%/.02/260 ·
`neutral` 50%/.012/260 → 72%/.01/260 · `success` 48%/.16/150 → 78%/.15/150 · `info` 48%/.14/230 → 78%/.12/230 ·
`warning` 50%/.15/75 → 82%/.15/80 · `danger` 52%/.21/25 → 74%/.18/25. Els `-soft` són a L 91-92% (clar) / 28-32%
(fosc), lleugerament més foscos/clars que `surface` perquè es distingeixin sense vora.

Cada to té els tres tokens (`-`, `-fg`, `-soft`) en clar i fosc: afegir un to = 6 valors + entrada a `TONES`
(`app/types/ui.ts`) + modificadors als primitius que el consumeixen.

### Tokens d'ombra (`--shadow-*` → utilitats `shadow-*`, usables dins d'`@apply`)

Els valors referencien `var(--color-neu-dark)` / `var(--color-neu-light)`: per això **`.dark` només redefineix els
dos colors** i totes les ombres es recalculen soles en temps d'execució.

| Token                   | Utilitat              | Valor                                                       | Relleu                          |
| ----------------------- | --------------------- | ----------------------------------------------------------- | ------------------------------- |
| `--shadow-neu`          | `shadow-neu`          | `6px 6px 12px neu-dark, -6px -6px 12px neu-light`           | relleu normal (raised)          |
| `--shadow-neu-sm`       | `shadow-neu-sm`       | `3px 3px 6px neu-dark, -3px -3px 6px neu-light`             | relleu curt (hover, badges)     |
| `--shadow-neu-lg`       | `shadow-neu-lg`       | `12px 12px 24px neu-dark, -12px -12px 24px neu-light`       | relleu gran (elevated, hero)    |
| `--shadow-neu-inset`    | `shadow-neu-inset`    | `inset 4px 4px 8px neu-dark, inset -4px -4px 8px neu-light` | enfonsat (inputs, premut)       |
| `--shadow-neu-inset-sm` | `shadow-neu-inset-sm` | `inset 2px 2px 4px neu-dark, inset -2px -2px 4px neu-light` | enfonsat lleu (pistes, franges) |
| `--shadow-neu-none`     | `shadow-neu-none`     | `0 0 #0000`                                                 | pla (ghost, enllaços)           |

### Receptes per estat (quin relleu va a cada estat)

| Relleu      | Utilitat                         | Estats que el fan servir                                                                                                                                                                                                                                                                                                                                                                                                 |
| ----------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Raised**  | `shadow-neu` / `-sm` / `-lg`     | botó en repòs (`neu`), hover de botó/nav/icon (`neu-sm`), card outline (`neu-sm`) i elevated (`neu-lg`), capçalera (`neu-sm`), figura del hero (`neu-lg`), imatge del preview (`neu`), badges (`neu-sm`), alerts (`neu`), punt de la línia de temps (`neu-sm`), theme toggle (`neu`), ítem actiu del locale switcher (`neu-sm`), meme card (`neu`, hover `neu-lg`), radio/checkbox marcats (`neu-sm`), skip link (`neu`) |
| **Pressed** | `shadow-neu-inset`               | botó `:active` i `--loading`, theme toggle `:active`, meme card `:active` i `--selected` (+ `ring-2 ring-primary`)                                                                                                                                                                                                                                                                                                       |
| **Inset**   | `shadow-neu-inset` / `-inset-sm` | `custom-input__control` (`inset`; focus `+ ring-2 ring-primary/40`; danger `ring-1 ring-danger`), radio/checkbox sense marcar (`inset-sm`), card filled (`inset`), skeleton (`inset-sm`), marquesina i banner (`inset-sm`), pista del locale switcher (`inset-sm`), nav actiu (`inset-sm`), footer (`inset-sm`)                                                                                                          |
| **Flat**    | `shadow-neu-none` / cap ombra    | botó ghost en repòs, enllaços inline/subtle, seccions i pàgines (el relleu el posen els primitius que contenen)                                                                                                                                                                                                                                                                                                          |

Regles transversals: `transition-shadow` en tot el que canvia de relleu; `prefers-reduced-motion: reduce` talla
totes les transicions (`base.css`) i l'animació de skeleton/marquesina; l'estat mai depèn només de l'ombra (el
premut/seleccionat porta també color o anell; el focus sempre porta `outline-primary`).

### Contrast (WCAG AA, calculat oklch → sRGB)

| Parell                       | Clar        | Fosc        |
| ---------------------------- | ----------- | ----------- |
| `text` / `surface`           | **13.79:1** | **14.16:1** |
| `text-muted` / `surface`     | **5.97:1**  | **6.81:1**  |
| `text-muted` / `surface-alt` | **5.53:1**  | **7.30:1**  |
| `primary` / `surface`        | 5.82:1      | 7.62:1      |
| `primary-fg` / `primary`     | 6.74:1      | 8.51:1      |
| `success` / `surface`        | 4.97:1      | 8.93:1      |
| `info` / `surface`           | 5.05:1      | 8.64:1      |
| `warning` / `surface`        | 5.13:1      | 9.52:1      |
| `danger` / `surface`         | 5.16:1      | 6.47:1      |
| `neutral` / `surface`        | 5.03:1      | 6.80:1      |

Tot ≥ 4.5:1 (AA per a text normal). Si es canvia `surface`, recalcular.

## Base (`base.css`)

`html` `scroll-smooth motion-reduce:scroll-auto` + `color-scheme`; `body` `bg-surface font-sans text-text antialiased`;
`:focus-visible` `outline-2 outline-offset-2 outline-primary`; `prefers-reduced-motion` → `transition-none` global.
Layout de l'app: `.app-shell` (flex col, `min-h-dvh`), `.app-shell__main` (`flex-1`), `.skip-link` (sr-only fins a
focus; en focus `rounded-lg bg-primary shadow-neu`).

## Pàgines (`pages.css`)

`.page` (contenidor `max-w-5xl` amb padding), `.home-page`, `.meme-page` (+ `__header`, `__kicker`, `__intro`,
`__how` (`rounded-2xl`, sobre CustomCard filled), `__how-title`, `__steps`). Només layout/espai; el text és `CustomText`
i el relleu el posen els primitius.

## Escala tipogràfica (`CustomText`, `custom-text.css`)

Tota la tipografia surt d'aquí. Cap altre CSS declara `text-*` de mida, `font-*` de pes ni color de text (excepte
els primitius que ho tenen com a part del control: `CustomButton`, `CustomInput__control`, `CustomIcon`, `CustomAlert` base
`text-sm`, `LocaleSwitcher__item`, `AppHeader__brand`).

| Variant   | Classe                  | Estil                                                | On s'usa                                                                                                  |
| --------- | ----------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `display` | `.custom-text--display` | `text-4xl font-extrabold tracking-tight sm:text-6xl` | nom del hero (`h1`)                                                                                       |
| `h1`      | `.custom-text--h1`      | `text-3xl font-extrabold tracking-tight sm:text-5xl` | títol de `/meme`                                                                                          |
| `h2`      | `.custom-text--h2`      | `text-2xl font-bold tracking-tight sm:text-3xl`      | títol d'`CustomSection`                                                                                   |
| `h3`      | `.custom-text--h3`      | `text-xl font-semibold sm:text-2xl`                  | headline del hero                                                                                         |
| `lead`    | `.custom-text--lead`    | `text-lg`                                            | salutació del hero, intro de `/meme`; amb `weight=semibold` subtítols (certificacions, títol del preview) |
| `body`    | `.custom-text--body`    | `text-base leading-relaxed`                          | paràgrafs, títols d'ítem (`weight=semibold`)                                                              |
| `small`   | `.custom-text--small`   | `text-sm`                                            | períodes, notes, bullets, meta, captions, labels, títol d'alerta                                          |
| `caption` | `.custom-text--caption` | `text-xs`                                            | crèdit Giphy, hints, títol de `MemeCard`, badges `sm`                                                     |
| `eyebrow` | `.custom-text--eyebrow` | `text-sm font-semibold tracking-wide uppercase`      | eyebrow de secció, kicker de `/meme`, títols de l'aside d'About                                           |

Modificadors ortogonals: tons `.custom-text--tone-default` (hereta) / `-muted` (`text-text-muted`) / `-<tone>`
(`text-<tone>`); pesos `.custom-text--normal/--medium/--semibold/--bold`; alineació `.custom-text--align-start/-center/-end`;
`.custom-text--truncate`.

## Classes per component (`app/assets/css/components/*.css`, un fitxer per component, BEM)

### Primitius

| Bloc               | Modificadors                                                                                                                                                                                                                                                                                                                                                     | Elements                                                                                                                                                                                                                                                                                                                                                                                                    | Notes                                                                                                                                                                       |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.custom-link`     | `--inline` (underline a hover, `hover:text-primary` amb to default), `--nav` (`rounded-lg px-3 py-2 text-sm font-medium text-text-muted`, hover `shadow-neu-sm`), `--subtle` (`text-text-muted hover:text-text`), `--icon` (`size-9` centrat, hover `shadow-neu-sm`, active `inset-sm`), `--tone-<tone>`, `--active` (nav: `bg-surface-alt shadow-neu-inset-sm`) | —                                                                                                                                                                                                                                                                                                                                                                                                           | `transition-[color,box-shadow]`                                                                                                                                             |
| `.custom-image`    | `--fit-cover/-contain`, `--radius-none/-md/-lg/-xl(3xl)/-full`, `--frame` (`shadow-neu-sm`, sense vora)                                                                                                                                                                                                                                                          | —                                                                                                                                                                                                                                                                                                                                                                                                           | `block max-w-full`                                                                                                                                                          |
| `.custom-button`   | `--sm/--md/--lg` (h 8/10/12), `--solid` (fons del to + `-fg`) / `--outline` (`bg-surface ring-1 ring-<tone>/40` + text del to) / `--ghost` (`shadow-neu-none`, text del to) × `--<tone>`, `--loading` (`shadow-neu-inset`), `--block`                                                                                                                            | `__icon`                                                                                                                                                                                                                                                                                                                                                                                                    | `inline-flex rounded-lg bg-surface shadow-neu font-medium text-sm transition-shadow`; `hover:shadow-neu-sm`, `active:shadow-neu-inset`, `disabled:opacity-50 shadow-neu-sm` |
| `.custom-icon`     | `--sm/--md/--lg`                                                                                                                                                                                                                                                                                                                                                 | —                                                                                                                                                                                                                                                                                                                                                                                                           |                                                                                                                                                                             |
| `.custom-badge`    | `--sm/--md/--lg` (padding), `--soft` (fons `-soft` + text del to) / `--solid` (fons del to + `-fg`) × `--<tone>`                                                                                                                                                                                                                                                 | —                                                                                                                                                                                                                                                                                                                                                                                                           | `rounded-full shadow-neu-sm`; text via `CustomText`                                                                                                                         |
| `.custom-alert`    | `--<tone>` (fons `-soft`; icona i títol del to)                                                                                                                                                                                                                                                                                                                  | `__icon`, `__body`, `__title`, `__content`                                                                                                                                                                                                                                                                                                                                                                  | `rounded-xl p-4 text-sm shadow-neu` (sense vora)                                                                                                                            |
| `.custom-card`     | `--outline` (`bg-surface shadow-neu-sm`), `--filled` (`bg-surface-alt shadow-neu-inset`), `--elevated` (`bg-surface shadow-neu-lg`), `--padding-sm/-md/-lg`                                                                                                                                                                                                      | `__header`, `__footer`                                                                                                                                                                                                                                                                                                                                                                                      | `rounded-xl transition-shadow`                                                                                                                                              |
| `.custom-section`  | —                                                                                                                                                                                                                                                                                                                                                                | `__header`, `__eyebrow`, `__title`, `__subtitle`                                                                                                                                                                                                                                                                                                                                                            | `py-12 sm:py-16 scroll-mt-20`                                                                                                                                               |
| `.custom-input`    | `--<type>`, `--sm/--md/--lg`, `--neutral/--danger` (control `ring-1 ring-danger`, focus `ring-danger/40`; radio/checkbox `ring-danger`, marcats `bg-danger`), `--with-icon`, `--disabled`                                                                                                                                                                        | `__label`, `__field`, `__icon`, `__control` (`h-10 rounded-lg bg-surface-alt px-3 text-sm shadow-neu-inset`, focus `ring-2 ring-primary/40`), `__group`, `__options`, `__option`, `__radio` (`appearance-none rounded-full`), `__checkbox` (`appearance-none rounded-sm`): `size-4 bg-surface-alt shadow-neu-inset-sm`, `:checked` `bg-primary shadow-neu-sm` + `::after` (punt / marca en `-fg`), `__hint` | textarea/multiselect `h-auto min-h-24`                                                                                                                                      |
| `.custom-skeleton` | `--text`, `--image`, `--circle`                                                                                                                                                                                                                                                                                                                                  | —                                                                                                                                                                                                                                                                                                                                                                                                           | `animate-pulse rounded-lg bg-surface-alt shadow-neu-inset-sm motion-reduce:animate-none`                                                                                    |
| `.custom-marquee`  | `--slow/--normal/--fast` (70/40/20 s via `--custom-marquee-duration`), `--pause`, `--<tone>` (fons `-soft`), `--sm/--md/--lg`                                                                                                                                                                                                                                    | `__track` (animació `custom-marquee-scroll`, `translateX(0 → -50%)`), `__copy`                                                                                                                                                                                                                                                                                                                              | franja `shadow-neu-inset-sm`; `prefers-reduced-motion`: sense animació, còpia oculta                                                                                        |

### Layout i seccions

| Bloc                  | Modificadors                                                         | Elements                                                                                                                                                                                                                                                      |
| --------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.app-header`         | —                                                                    | `sticky bg-surface/85 shadow-neu-sm backdrop-blur` (sense vora); `__inner` (`h-16`), `__brand` (`font-bold tracking-tight`), `__nav`, `__link`, `__tools` (`gap-3`)                                                                                           |
| `.app-footer`         | —                                                                    | `mt-8 bg-surface-alt py-8 shadow-neu-inset-sm` (franja enfonsada); `__inner`, `__source`, `__links`, `__link`                                                                                                                                                 |
| `.source-banner`      | —                                                                    | `relative z-30` (el relleu el posa `CustomMarquee`); `__item` (`inline-flex gap-2 px-6`), `__icon` (`opacity-60`)                                                                                                                                             |
| `.theme-toggle`       | —                                                                    | (sobre `.custom-button` ghost) `size-10 rounded-full bg-surface px-0 shadow-neu`, hover `neu-sm`, active `neu-inset`                                                                                                                                          |
| `.locale-switcher`    | —                                                                    | pista `rounded-lg bg-surface-alt p-1 gap-1 shadow-neu-inset-sm`; `__item` (`rounded-md px-2 py-1 text-xs font-semibold uppercase`), `__item--active` (`bg-primary text-primary-fg shadow-neu-sm`)                                                             |
| `.hero-section`       | —                                                                    | `__content`, `__greeting`, `__headline`, `__tagline`, `__meta`, `__meta-item`, `__actions`, `__figure` (marc `max-w-sm rounded-3xl bg-surface p-4 shadow-neu-lg`), `__image` (`aspect-square`), `__image--meme` (`ring-2 ring-primary`), `__caption` (`mt-4`) |
| `.about-section`      | —                                                                    | `__grid` (`md:grid-cols-[2fr_1fr]`), `__text`, `__aside`, `__aside-title`, `__list`                                                                                                                                                                           |
| `.experience-section` | —                                                                    | `__list`                                                                                                                                                                                                                                                      |
| `.experience-item`    | `--detailed`, `--compact` (punt `bg-neutral`)                        | `::before` (punt de la línia: `size-4 rounded-full bg-primary shadow-neu-sm`), `__body`, `__org`, `__bullets` (`list-disc pl-5`), `__tags`                                                                                                                    |
| `.tech-stack`         | —                                                                    | `__groups` (`sm:grid-cols-2`), `__group`, `__group-title`, `__list`                                                                                                                                                                                           |
| `.education-section`  | —                                                                    | `__list`, `__subtitle`                                                                                                                                                                                                                                        |
| `.contact-section`    | —                                                                    | `__intro`, `__actions`                                                                                                                                                                                                                                        |
| `.cv-download`        | —                                                                    | —                                                                                                                                                                                                                                                             |
| `.meme-search`        | —                                                                    | `__input`                                                                                                                                                                                                                                                     |
| `.meme-grid`          | —                                                                    | `__skeletons`, `__list` (2/3/4 columnes), `__state`                                                                                                                                                                                                           |
| `.meme-card`          | `--selected` (`ring-2 ring-primary shadow-neu-inset`, també a hover) | (sobre `.custom-button` ghost) `rounded-xl bg-surface shadow-neu`, hover `neu-lg`, active `neu-inset`; `__image`, `__title` (overlay `bg-secondary/80`, visible a hover/focus/selected)                                                                       |
| `.meme-preview`       | —                                                                    | `__image` (`shadow-neu`), `__body`, `__meta`, `__actions`                                                                                                                                                                                                     |

## Utilitats de layout permeses al template

Cap: al template només classes del bloc del component (`vue/no-restricted-class` bloqueja `bg-/text-/p-/m-/gap-/…`).
Tot `@apply` viu al CSS del component.

## Com personalitzar

1. **Canviar el color de superfície** (clar o fosc): `tokens.css`, `--color-surface` i `--color-surface-alt`. Cal
   moure també `--color-neu-light` / `--color-neu-dark` (uns 6-12 punts de L per sobre i per sota de `surface`) i
   recalcular el contrast de `text` / `text-muted` (taula de dalt; ≥ 4.5:1).
2. **Canviar la intensitat del relleu**: només `--shadow-neu*` a `tokens.css` (distància i desenfocament) o la
   separació de L entre `neu-light` i `neu-dark`. Els components no toquen valors d'ombra: usen `shadow-neu*`.
3. **Canviar els radis**: `--radius-*` a `tokens.css`; tots els `rounded-*` en deriven.
4. **Afegir un to**: 6 valors (`-`, `-fg`, `-soft` × clar/fosc) a `tokens.css`, entrada a `TONES`
   (`app/types/ui.ts`) i modificadors `--<to>` a `custom-button`, `custom-badge`, `custom-alert`, `custom-link`, `custom-marquee`,
   `custom-text`. Comprova que `<to>` sobre `surface` i `-fg` sobre `<to>` donen ≥ 4.5:1.
5. **Canviar la tipografia**: `custom-text.css` (variants) o `tokens.css` (`--font-*`). Cap altre fitxer.
6. **Canviar l'aspecte d'un primitiu** (botó, input, enllaç, imatge, badge, alerta, card): el seu `app-<nom>.css`.
   Els consumidors no canvien.
7. **Nou estat/variant d'un primitiu**: prop + modificador `.app-<nom>--<valor>` (tria el relleu a la taula de
   receptes) + fila a `catalog/components.md` + fila aquí.
8. **Nova secció/pàgina**: només layout (grid, gaps, marges) al seu `<kebab>.css`; text amb `CustomText`, enllaços
   amb `CustomLink`, imatges amb `CustomImage`; el relleu el posa `CustomCard` o el primitiu corresponent.
