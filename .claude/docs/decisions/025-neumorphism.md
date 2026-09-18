# 025 · Visual style: neumorphism

**Context.** The user has changed the style directive (replaces 011).
**Decision.** Neumorphism (soft UI): surfaces the same color as the background, relief via double shadow (light top-left, dark bottom-right), pressed/input states as `inset`, large radii. Kept: system typography, semantic tokens with states, real dark mode (recalculated shadows), one CSS file per component (rule 08). Accessibility constraints: text never depends on the shadow to be readable; AA contrast with the `text`/`text-muted` tokens; the `primary` accent keeps a solid background for CTAs; visible focus with a ring.
**Consequences.** New shadow tokens (`--shadow-neu*`) and light/shadow colors in `tokens.css`; no change to classes or components.

**Consequences applied (2026-09-14).** In `tokens.css` (`@theme`, with overrides under `.dark`): colors
`--color-neu-light` / `--color-neu-dark` (top-left light, bottom-right shadow); shadows `--shadow-neu`,
`--shadow-neu-sm`, `--shadow-neu-lg`, `--shadow-neu-inset`, `--shadow-neu-inset-sm`, `--shadow-neu-none`
(`shadow-neu*` utilities, usable inside `@apply`; they reference the `neu-*` colors, which is why dark mode
only redefines these two colors); enlarged `--radius-sm/md/lg/xl` radii (0.5 / 0.75 / 1 / 1.5 rem) and new
`--radius-2xl/3xl` (2 / 2.5 rem); `surface` becomes soft blue-gray (`oklch(94% .008 250)` / `oklch(23% .015 250)`)
and the shades are readjusted to keep AA (contrast table in `catalog/styles.md`). Per-state recipes
(raised / pressed / inset / flat) in `standards/styling.md`; no class or modifier changes, only each
component's CSS, `base.css`, and `pages.css`.
