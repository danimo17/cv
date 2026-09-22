# 050 · Semantic spacing tokens: scope and values

**Context.** The user asked, while reviewing `ux-redesign`'s diffs, for gap/padding/margin values to stop
being picked ad hoc per component and instead come from a small set of reusable spacing tokens — the same
pattern colors, shadows and radii already follow in `tokens.css`. They explicitly asked the AI to decide the
concrete values and scope itself rather than being asked back (rule 11 still applies: the decision is logged
here, not silently applied with no record).

A repo-wide tally of every spacing utility in use (`gap-`/`p-`/`m-`/`space-y-` variants across
`app/assets/css/components/*.css`, `pages.css`, `base.css`) found roughly 40 distinct raw values spanning the
full Tailwind scale from `0` to `24` (0 to 6rem). Collapsing literally all of them into 2 tokens would force
visually unrelated concerns — a hero section's page-level padding and an icon's inline gap — onto the same
value, which is a regression dressed up as simplification, not a genuine consolidation.

**Decision.**

1. Two tokens, `--spacing-sm: 0.5rem` and `--spacing-lg: 1.5rem`, added to `tokens.css`'s `@theme` block,
   following the exact `--radius-*` pattern (a bare named value per key, no intermediate multiplier/base
   variable — that indirection doesn't exist for radius or shadow tokens either, and adding it here would be
   an unrequested abstraction for a value that, like the others, is edited directly when it needs to change).
2. Values chosen from the actual usage tally, not arbitrarily: `0.5rem` matches the single most common gap
   value in the codebase today (`gap-2`, used 12 times) and reads naturally as the "tight/inline" case (icon +
   text, tag lists, compact groups). `1.5rem` matches `gap-6` (5 uses) and reads as the "loose/between
   distinct elements" case (list items, stacked form-adjacent blocks).
3. Scope is narrowed to **spacing between sibling elements** — `gap-*` inside flex/grid containers and
   `mb-*`/`mt-*`/`space-y-*`/`space-x-*` margins that separate stacked elements within one component. Three
   categories are explicitly excluded, each because it is a different design concern, not because migrating
   them is hard:
   - Page/section-level vertical rhythm (`pages.css`'s `py-12/16/24`, `mt-12/20` on section wrappers) —
     controls the page's visual hierarchy across sections, a coarser scale than inter-element spacing.
   - Control-internal padding already governed by the `Size` type (`CustomButton`/`CustomInput`'s
     `px-3/4/6`/`py-1/2`, tied to the `sm/md/lg` height scale) — already tokenized via a different mechanism;
     touching it here would be scope creep into control sizing, not spacing consolidation.
   - `ExperienceItem`'s `--detailed` `pb-8` (added by `ux-redesign`'s `timeline-experience` agent) — its value
     is coupled to the timeline dot's own geometry, not a generic "gap between two things," so migrating it
     to `--spacing-lg` would be coincidental (same number) rather than a real semantic match.

**Consequences.** `gap-sm`/`gap-lg`/`mb-sm`/`mb-lg`/etc. utilities become available everywhere (Tailwind v4
generates them automatically once the theme keys exist) and are the only spacing utilities allowed for the
in-scope cases going forward — a future PR adding a raw `gap-3` for a between-elements case should use one of
these two instead. If, once used for a while, two tiers prove insufficient for a real case, add a third
tier (`--spacing-md`?) then — not preemptively (YAGNI). The three excluded categories stay on raw Tailwind
values; revisiting them (e.g. tokenizing page rhythm too) is a separate, future decision, not bundled here.
