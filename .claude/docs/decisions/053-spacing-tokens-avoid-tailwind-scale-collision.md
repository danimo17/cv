# 053 · Spacing tokens: rename `sm`/`lg` to `custom-sm`/`custom-lg` to avoid a Tailwind v4 scale collision

**Context.** Decision 050 added `--spacing-sm: 0.5rem` and `--spacing-lg: 1.5rem` to `tokens.css`'s `@theme`
block and migrated ~20 component CSS files' inter-element `gap-*`/`p-*`/`m-*`/`space-*` utilities to
`gap-sm`/`mb-lg`/etc. (branch `feat/spacing-tokens`, commit `c18d3ba`).

While reconciling this branch with `main` (merge commit `3c741d5`), `pnpm gate:push` came back red on 2 of 5
e2e tests, with `getByTestId('hero-image')` resolving as `hidden`. The first pass at explaining this (logged
in `.claude/tasks/spacing-tokens/handoff.md`) called it a pre-existing `main`-only Tailwind v4 dev-JIT defect,
out of scope for this branch. That explanation was wrong, and was re-verified rather than taken on faith:

- `pnpm gate:push` on plain `main` (no spacing-token changes): 5/5 e2e green.
- `pnpm gate:push` on `main` merged with this branch's spacing-token changes: 2/5 e2e failing, same
  `hero-image` hidden failure.

Both runs used real `pnpm gate:push` invocations with their actual exit codes and logs, not a guess — the
regression is caused by this branch's changes, not a latent `main` bug.

**Root cause.** Tailwind v4 derives a utility for every key defined under `--spacing-*` in `@theme`, and it
does so **across every utility family that reads the shared spacing scale** — not only `gap-*`/`p-*`/`m-*`,
but also `w-*`, `max-w-*`, `min-w-*`, `h-*`, `inset-*`, and others. `sm` and `lg` are not free-form suffixes:
they are also the key names Tailwind's own built-in scale uses by default for several of those _other_
families (e.g. `max-w-sm` normally resolves to Tailwind's container-scale value for "small", unrelated to
spacing). Defining `--spacing-sm`/`--spacing-lg` in `@theme` silently redefined what `max-w-sm`/`max-w-lg`
(and the equivalent `w-*`/`h-*`/etc. keys) resolve to everywhere in the app, because the theme key is shared
across families, not scoped to the families decision 050 intended to touch (`gap`/`p`/`m`/`space`).

Concretely: `hero-section.css`'s `.hero-section__figure` uses `max-w-sm` for the hero photo frame's width,
pre-existing and unrelated to decision 050's migration. Once `--spacing-sm: 0.5rem` existed, `max-w-sm`
resolved to `0.5rem` instead of Tailwind's built-in container-scale value, collapsing the frame — hence the
`hero-image` element becoming `hidden` in the e2e assertion.

**Decision.** Rename the token keys (and therefore the generated utility suffixes) from `sm`/`lg` to
`custom-sm`/`custom-lg`:

- `tokens.css`: `--spacing-sm` → `--spacing-custom-sm`, `--spacing-lg` → `--spacing-custom-lg` (values
  unchanged: `0.5rem`/`1.5rem`).
- Every utility this branch's migration introduced, across the 13 in-scope prefixes (`gap`, `gap-x`, `gap-y`,
  `p`, `px`, `py`, `m`, `mx`, `my`, `mt`, `mb`, `space-y`, `space-x`), renamed accordingly: `gap-sm` →
  `gap-custom-sm`, `mb-lg` → `mb-custom-lg`, `space-y-sm` → `space-y-custom-sm`, and so on.

`custom-sm`/`custom-lg` are not reserved default keys for any Tailwind utility family, so defining
`--spacing-custom-sm`/`--spacing-custom-lg` cannot collide with a built-in meaning the way `sm`/`lg` did.

This decision **amends decision 050's naming choice only** — it does not replace it. The two-tier
tight/loose concept, the `0.5rem`/`1.5rem` values, and the inter-element-only scope (excluding page rhythm,
`Size`-governed control padding, and the values that don't cleanly fit either bucket) are all still correct
and unchanged; only the literal token key and generated class-name suffix change.

**Alternatives considered and rejected.**

- _Keep `sm`/`lg`, narrow scope elsewhere instead._ Doesn't work: the collision isn't caused by which
  utilities decision 050's migration touched, it's caused by Tailwind v4 sharing the `--spacing-*` scale
  across families regardless of which utilities the token's author intended. Any component anywhere in the
  app using `max-w-sm`/`w-lg`/`h-sm`/etc. for an unrelated purpose would collide, migrated or not.
- _Use a separate `@theme` namespace instead of `--spacing-*`._ Tailwind v4 only generates `gap-*`/`p-*`/`m-*`/
  `space-*` utilities from keys under `--spacing-*` specifically; there is no way to scope a new key to only
  those families without forking the utility generation itself, which is out of scope for a CSS token
  decision.

**Consequences.** `gap-custom-sm`/`gap-custom-lg`/`mb-custom-sm`/etc. are the utilities available and expected
for in-scope inter-element spacing going forward; `gap-sm`/`gap-lg`/etc. (the old names) no longer exist as
tokens and must not be reintroduced. `.claude/docs/catalog/styles.md` and `.claude/docs/standards/styling.md`
are updated in the same commit as this decision (rule 07). Verified via `pnpm gate:push` after the rename:
all 5 e2e tests green, including `getByTestId('hero-image')`.
