# Story: Semantic spacing tokens

**Slug:** `spacing-tokens` · **Branch:** `feat/spacing-tokens` · **Status:** doing

As the site's maintainer I want gaps and margins between elements to come from a small, named set of
spacing tokens (same pattern already used for `--radius-*` and `--shadow-neu-*` in `tokens.css`) instead of
each component CSS file picking its own raw Tailwind spacing number, so that inter-element spacing reads as
consistent across the site and changing it later is a one-line edit instead of a repo-wide grep.

Grew out of a comment made while reviewing `ux-redesign`'s Phase 1/2 diffs: component CSS files use gap-1
through gap-10, mb-2 through mb-8, mt-1 through mt-20, etc. — around 40 distinct raw spacing values with no
semantic grouping, unlike colors/shadows/radii which already went through this exact consolidation.

## Scope (proposed by the AI, per the user's explicit request not to be asked back)

Two new tokens, `--spacing-sm` (0.5rem) and `--spacing-lg` (1.5rem), added to `tokens.css`'s `@theme` block
following the exact `--radius-*`/`--shadow-neu-*` pattern (a bare named value, no extra base/multiplier
indirection — that layer doesn't exist for radius/shadow either and would be unrequested abstraction).
Migration is scoped to **spacing between elements** — `gap-*` in flex/grid containers and `mb-*`/`mt-*`/
`space-y-*` margins that separate stacked elements within a component — mapped onto whichever of the two
tokens is closer to today's value.

## Out of scope (deliberately, see `contract.md`'s reasoning)

- Page/section-level vertical rhythm (`pages.css`, hero/section `py-12/16/24`, `mt-12/20`): a different visual
  concern (page hierarchy, not inter-element spacing) — forcing it into 2 buckets would visibly flatten the
  page, not simplify it.
- Control-internal padding already governed by the existing `Size` system (`CustomButton`/`CustomInput`'s
  `px-3/4/6`, `py-1/2`, tied to `sm/md/lg` heights) — a separate, already-tokenized concern.
- `ExperienceItem`'s `pb-8` timeline geometry (tied to the connecting-line/dot math from `ux-redesign`,
  not a generic "gap") — left as a literal value, documented as an exception in `styles.md` (rule 14 forbids
  a code comment explaining it inline).

## External dependencies

- None (pure CSS refactor, no new package, no i18n, no API surface change).
