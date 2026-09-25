# Story: css-tailwind-first

**Status: queued, NOT started.** Do not set `.claude/tasks/ACTIVE` or branch until `feat/ux-redesign` and
`feat/spacing-tokens` are both merged. This reverses rule 08 and decisions 026/038 — write a new decision
record superseding them before the first commit, don't just start coding against a contradicted rule.

**As** the user, **I want** components to use Tailwind utility classes directly in templates, with
per-instance variation built as computed class lists in the component's own `<script setup>`, **for** less
indirection than one `app/assets/css/components/<kebab>.css` file per component with `@apply`.

## What changes

- Default: **no** `app/assets/css/components/<kebab>.css` file for a component. Tailwind utility classes go
  straight in the template.
- Per-prop variation is built as a computed class list in `<script setup>`, not as CSS modifier classes
  (`--variant`) resolved through `@apply`. E.g. (illustrative, exact prop/class names are the future task's
  call): a `tone` prop with a `transparent` value maps to two Tailwind classes via a `computed(() => ({
'bg-transparent': props.tone === 'transparent', 'border border-2': props.tone === 'bordered' }))` (or an
  array-building equivalent) bound with `:class`.
- A component's CSS file only exists when Tailwind genuinely cannot express something (documented example
  needed per case — e.g. a pseudo-element trick current code already uses, like `.custom-input__field::after`
  for the select chevron, or the `experience-item::before` timeline dot). Only then: real `.scss`, not
  today's `@apply`-based `.css`.
- **When a component's CSS file/classes are removed, its template's semantic classes go with them** — no
  dead `class="foo-bar"` left in a template pointing at CSS that no longer exists. Confirmed 2026-09-25 (user):
  this is not optional cleanup, it's part of the same change.

## Why (user's reasoning, 2026-09-25 session)

Less indirection: reading a template shows the actual applied utilities instead of a semantic class name
that requires opening a second file to know what it does.

## Out of scope

- The workflow/process fixes bundled in `workflow-integrity-hardening` (separate story) — unrelated axis.
- Deciding this is even the right trade-off long-term — that's what the required decision record is for,
  written when this task actually starts, weighing today's benefits of rule 08 (one file = the whole look
  changes together, states stay coherent across a component from shared tokens) against the reduced
  indirection this asks for.

## Needs before starting

- A decision record superseding rule 08 / decisions 026, 038 (or narrowing them — e.g. keep the `Custom*`
  primitives rule intact, only drop the "own CSS file with `@apply`" half). Write this as the first step of
  the contract, not assumed here.
- A pass over every current `app/assets/css/components/*.css` file to classify each rule as "expressible in
  Tailwind directly" vs. "needs a real CSS/SCSS escape hatch" — this classification IS the contract's
  acceptance criteria, not decided in advance in this story.

## External dependencies

None (no new package — Tailwind and `.scss` support already available via existing tooling; confirm `.scss`
compiles as-is or needs a Nuxt config change before assuming it's free).
