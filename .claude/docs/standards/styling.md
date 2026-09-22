# Standard · Styling

Deliberately short: it describes the rules in force (decisions 015, 025, 026). Visual style: **neumorphism / soft UI**
(decision 025, replaces 011). Concrete values and classes: `.claude/docs/catalog/styles.md`.

- **Tokens.** All colors, radii, shadows and fonts are semantic tokens from `app/assets/css/tokens.css` (`@theme`):
  `surface`, `surface-alt`, `border`, `text`, `text-muted`, `neu-light`, `neu-dark`, the `--shadow-neu*` shadows and,
  for each tone (`primary … danger`), `-`, `-fg`, `-soft`. Dark mode = same names under `.dark`; no component
  writes `dark:`. No raw color or shadow value outside this file.
- **One CSS file per component** (rule 08). `app/assets/css/components/<kebab>.css`, imported in `main.css`, with the
  `.kebab` block and BEM-lite (`.kebab--modifier`, `.kebab__element`). Everything via `@apply` of tokens/utilities inside
  `@layer components`. Test: `tests/arch/css-per-component.spec.ts`. Pages and layout: `pages.css` and `base.css`.
- **Only own classes in the template.** No Tailwind utilities (`vue/no-restricted-class` blocks
  `bg-|text-|p-|px-|py-|m-|gap-|rounded-|border-|shadow-|font-|w-|h-|max-w-|max-h-|size-`). List of layout
  utilities allowed in the template: **none** (all of it in the component's CSS). Passing `class="block__part"` to a child
  component (`CustomText`, `CustomLink`, `CustomSection`…) is fine: the child merges it into its own root.
- **Typography only via `CustomText`.** `custom-text.css` is the only file with sizes (`text-xs … text-6xl`), weights and
  text colors for content. Section and layout CSS only carry layout, spacing, background and relief. Documented
  exceptions in `catalog/styles.md`: controls' own text (`CustomButton`, `CustomInput__control`, `CustomIcon`,
  `CustomAlert`'s base).
- **Primitives** (decision 026). The look of links, images, inputs, buttons, badges, alerts, cards and marquees
  is changed in the primitive's CSS, never the consumer's. A consumer only adds layout (`aspect-square`,
  `w-full`, margins) to its own class passed via `class`.

## Neumorphic rules

- **Same color, two shadows.** Relief comes from `bg-surface` (or its `-soft`/solid tone) with no borders; volume
  comes from `shadow-neu*` (light top-left `neu-light`, dark bottom-right `neu-dark`). Borders (`border-border`)
  are reserved for residual lines (the timeline), not for outlining boxes.
- **What is raised.** Everything actionable or "object"-like: buttons (`shadow-neu`), outline cards
  (`neu-sm`) and elevated cards (`neu-lg`), header, the hero figure's frame, preview image, badges, alerts,
  timeline dots, theme toggle, meme cards (presses in on hover, per criterion 8/15). The header's active nav
  link is also raised (`.app-header__link--active`, decision 044) — a documented, `activeClass`-based
  exception to `CustomLink`'s own default below.
- **What is inset.** Everything that is a "container" or is written into: `CustomInput` controls
  (`shadow-neu-inset`, including the locale switcher, now a `CustomInput type="select"` — decision 043),
  unchecked radio/checkbox, filled cards, skeletons, tracks (marquee, banner), `CustomLink`'s default active
  state, footer. Background `bg-surface-alt` so the recess reads even without the shadow.
- **What is flat.** Ghost buttons at rest, inline/subtle links, sections and pages: the relief comes from the
  primitives they contain, not from the container.
- **Hover/active.** Hover = shorter relief (`shadow-neu-sm`); active, `--loading` and `--selected` = inset
  (`shadow-neu-inset`); disabled = `opacity-50` and short relief. Ghost: flat → hover `neu-sm` → active inset.
  Always with `transition-shadow` (or `transition-[color,box-shadow]`).
- **Focus and inputs.** Input focus = inset + `ring-2 ring-primary/40`; danger = `ring-1 ring-danger`. The global
  focus ring (`outline-primary`, `base.css`) is never removed.
- **Accessibility.** No state relies on shadow alone: selected/active also carries color or a ring, a
  checked radio/checkbox carries the tone's background and an `-fg` mark, `primary` CTAs keep a solid
  background. AA contrast (≥ 4.5:1) of `text` and `text-muted` over `surface` and `surface-alt` in both modes (table in the
  catalog); any change to `surface` requires recalculating it. Focus is always visible.
- **Large radii** (`--radius-*` in tokens): `rounded-lg` for controls, `rounded-xl` for cards, `rounded-2xl/3xl`
  for large frames, `rounded-full` for badges/toggle/dots.
- **Motion.** Every transition and animation respects `prefers-reduced-motion: reduce` (`base.css` cuts
  transitions; `custom-marquee.css` and `custom-skeleton.css` remove the animation).
- **States.** Semantic states (`success`, `danger`…) always come from the same per-tone tokens; one modifier
  per state (`--loading`, `--selected`, `--active`, `--disabled`).
- **Catalog.** New token, class or state → `.claude/docs/catalog/styles.md` in the same change (rule 07).
