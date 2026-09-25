# Story: button-system

**Status: queued, NOT started, grill-me interrupted mid-way** (only Q1 was asked, unanswered — the user
pivoted to Dependabot PR triage before we resolved it). Resume the grill-me from Q1 before writing a contract
— this touches `CustomButton`, the most-reused primitive in the app (17 call sites), so needs full alignment
first, same reasoning as the original request.

**As** the user, **I want** `CustomButton` (and the elevation system generally) redesigned per the points
below **for** a more consistent, less cluttered button system across the site.

## Everything gathered so far (2026-09-25 session, across several messages — don't lose any of this)

### 1. Icon/text/loading redesign (original ask)

- Every button always has an icon — mandatory, not optional.
- Text becomes optional; the default pattern (proposed by the AI, user said "sí o no" — still open) is
  icon-only + the action's text shown as a tooltip on hover.
- Buttons need an async-action API: pass an action; while it's pending, swap the icon for a rotating
  FontAwesome loading icon (new `LoadingIcon` component if needed) and apply the _hover_ visual style until
  the action resolves, then restore the real icon.
- User said `/grill-me` explicitly — this needs real back-and-forth, not a guessed implementation.

**Codebase survey already done** (full results in this session's transcript, don't re-research from scratch
when resuming):

- `CustomButton.vue`: `icon` prop already exists but is OPTIONAL; a `loading` prop already exists but is
  purely cosmetic today (dims + disables, no spinner — the "swap to a spinner" behavior is net-new, not a
  wire-up of something existing).
- 17 total `<CustomButton` call sites app-wide (rule 08/026 makes this exhaustive — no native `<button>`
  exists outside it). 12 already pass icon+text, 3 are icon-only already (`ThemeToggle`, `CustomPagination`
  ×2), only 2 lack an icon: `MemeRecentSearches` (plain text chip, needs an icon picked or a carve-out) and
  `MemeCard` (image-tile-as-button, arguably out of scope for "icon mandatory" — needs an explicit call).
- FontAwesome is already the icon system (`@fortawesome/*` packages, manual `library.add()` whitelist in
  `app/plugins/fontawesome.ts`, only `solid`/`brands` sets registered) — no spinner icon (`faSpinner`/
  `faCircleNotch`) registered yet; would need adding. FontAwesome's Vue component supports a native `spin`
  prop; `CustomIcon.vue` doesn't forward it yet.
- **No tooltip primitive exists anywhere in the codebase** (grepped, zero hits) — "text becomes a tooltip" is
  genuinely new UI, not wiring up something already there. Closest precedent: `ThemeToggle` uses a native
  `title` attribute alongside `aria-label` for its icon-only hover text.
- `CustomLink`'s `variant="icon"` is a parallel-but-different icon-only mechanism (icon-in-slot, not a prop) —
  worth a consistency question later, not in this change's blast radius.

### 2. Button spacing / `ButtonCollection` (this session, later message, screenshot attached)

Screenshot showed the header's "Home"/"Meme" nav links sitting with **no visible gap** between them. Ask:
create a new `ButtonCollection` component — the standard way to lay out multiple buttons side by side with
spacing between them — and make it the default whenever 2+ buttons sit adjacent (not just header nav; check
every place buttons currently sit in a row: header nav, `HeroSection`'s CTAs, `MemePreview`'s use/cancel,
`meme.vue`'s home/reset buttons, footer social icons if those count as "buttons" or are `CustomLink`s
instead — verify per call site when this starts).

### 3. Elevation model for buttons vs. inputs (same message, precise spec — capture verbatim)

A 3-level model: **-1 = sunken, 0 = level with surrounding space, 1 = raised**.

- **Buttons**: default level **1** (raised). On hover or active → level **0** (flush with the surrounding
  space, not raised, not sunken). Buttons **never** go to **-1** — if any button currently renders sunken
  today (check `custom-button.css` and any per-consumer override), that's wrong under this model and must
  become **0**, not -1.
- If a button sits in "an exterior space" (user's phrase — likely means not nested inside another raised
  surface, e.g. directly on the page background; **needs clarifying in the resumed grill-me** exactly what
  counts as exterior vs. the nested case, and what a button nested inside an already-raised card should do,
  since the user only specified the exterior case explicitly) → level **1** by default, level **0** on
  hover/active. This may just restate the general button rule above rather than being a distinct case — needs
  disambiguating, don't assume.
- **Inputs**: default level **-1** (sunken) — this already matches today's `shadow-neu-inset` convention for
  `CustomInput`. **Exception: disabled inputs are locked at level 0** — not sunken, not raised, and (this is
  the important part) **not interactable/modifiable while disabled** — the disabled visual state overrides
  whatever level the input would otherwise show, always renders as 0, and this must hold regardless of
  hover/focus attempts (disabled means disabled, no hover-driven level change on a disabled control).

This is a real, non-trivial rework of the neumorphism elevation system (decision 025) as it applies to
interactive controls specifically — touches `custom-button.css`, `custom-input.css`, and possibly the
shared elevation/tone recipe table in `.claude/docs/catalog/styles.md`. Needs its own careful mapping from
"level -1/0/1" to the existing `shadow-neu-inset` / (flat/no-shadow) / `shadow-neu` vocabulary before any CSS
changes — don't invent a 4th shadow tier, reuse what's already tokenized.

## Out of scope (for now, until grill-me resolves it)

- Actually writing the contract or touching any code — nothing here has been built yet.
- `CustomLink`'s icon-only pattern unification with `CustomButton`'s `icon` prop (flagged as scope-adjacent,
  not decided).

## External dependencies

FontAwesome packages already installed (spinner icon needs adding to the `library.add()` whitelist, no new
package). No tooltip library present — if a real popover-based tooltip is chosen over the native `title`
attribute, that's a new dependency decision to make explicitly (ladder: native `title` first, per ponytail/
YAGNI, unless there's a real reason it's insufficient — accessibility, positioning, touch devices).
