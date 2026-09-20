# Handoff: ux-redesign

_Updated: 2026-09-20. Real state of `feat/ux-redesign`: **rebased onto `main` (now carries `post-launch` PR
#2 and `deploy-secrets-order` PR #3), story + contract written (17 criteria), ZERO implementation done yet.**
Nothing else committed on this branch beyond the rebase._

## Picked up from `deploy-secrets-order` (2026-09-20)

That task fixed a silent production deploy failure (PR #2 merged, CI green, but `deploy.yml` itself failed on
Cloudflare error 10215 — unnoticed for 2 days) and closed the process gap that let it go unnoticed: **decision
042** now makes a post-merge deploy check mandatory before any task can be closed. This branch inherits that
via the rebase; it applies to this task too once its PR eventually merges — see `workflow.md` step 12
("Verify deploy") and `templates/handoff.md`'s "Post-merge deploy check" section, and remember to fill that
section in on this task's own handoff once it merges.

## Status: contract written, nothing built

This task exists purely as scaffolding right now: `story.md` and `contract.md` are written (rule 10 —
required before any code), grounded in real research this session (an `Explore` agent read the actual header,
locale switcher, theme toggle, `CustomInput`, meme page/feature, timeline, certifications data, experience
data, footer and elevation CSS — see the 10-point research report referenced in `contract.md`'s intro). Two
points were grilled with the user and resolved:

- **Branch strategy**: own branch/task (this one), not bolted onto `post-launch` — keeps PRs reviewable.
- **Theme toggle**: stays a toggle, only resized to match the new dropdown's height — does NOT become a
  second dropdown (only the locale switcher does).

**No code has been written for this task.** Do not assume any of the 17 criteria below are started.

## What to do next session (in order)

1. Read `CLAUDE.md` → `hard-rules.md` → `workflow.md` → this file → `contract.md` (has all 17 criteria with
   Given/When/Then + what test/review covers each).
2. Confirm `.claude/tasks/ACTIVE` says `ux-redesign` and you're on branch `feat/ux-redesign` — already rebased
   onto `main` as of 2026-09-20 (post `post-launch` + `deploy-secrets-order`), no further rebase needed unless
   more work has landed on `main` since.
3. Work through the 17 criteria. Rule 12 applies: delegate research/implementation to subagents per
   reasonably-scoped chunk (e.g. one agent for the header/nav restyle, one for the new dropdown component,
   one for the Timeline component, one for CV content/data fixes, one for the meme page rework, one for the
   elevation/card system, one for the footer) — don't do 17 things serially in the main thread.
4. **Document as you go, not at the end** — this was an explicit user complaint this session (decisions/
   handoff weren't kept current live). Every real decision (heading-scale mapping, the dropdown's exact
   interaction pattern, exact "frontend frameworks" wording per locale) gets logged in
   `.claude/docs/decisions/` as it's made, and this handoff gets updated as each criterion lands — not
   batched. `require-contract.py` now also blocks a commit touching `nuxt.config.ts`/`eslint.config.mjs`
   without a decision staged alongside it (rule 11, added in decision 041) — if this task touches those
   files (e.g. for a new `imports.presets`), remember that gate.
5. Run `pnpm gate` before each commit, `pnpm gate:push` before any push (rule 09), and only push with the
   user's explicit permission each time (rule 06 — no standing permission, ever).

## The 17 criteria (full detail in `contract.md`) — quick index for picking up work

1. Header: no "Daniel Morales" brand text, nav on the left, active-link style changed from the pressed-pill
   look (still neumorphic, just header-appropriate).
2. `nav.home`/`nav.meme` → literal "Home"/"Meme" in all 3 locales (not translated).
3. Every control (buttons, inputs, locale switcher, theme toggle) shares one height (`h-10`).
4. Locale switcher becomes a custom (non-native) dropdown.
5. That dropdown is a new `CustomInput` type, documented like every other type (rule 07).
6. "Shopify" out of descriptive/summary copy → "Frontend" + "Vue, Nuxt and all the frontend frameworks"
   (tags like "Shopify Plus" in job history stay — they're facts, not descriptive prose).
7. New structured work-mode field: on-site/hybrid (Girona area) or remote (worldwide) — not free text.
8. Elevation: raised by default; sunken only when nested inside another raised card; meme "swap" presses in
   on hover.
9. Interests: drop `'ml'`, add `'pastisseria'`.
10. Timeline: continuous connecting line across the whole list, not per-item with gaps (research confirms
    `ExperienceItem.vue`'s `::before` dot + `border-l-2` is per-item today — `experience-section.css`'s
    `gap-8` between items visibly breaks the line).
11. Santander entry: org line → "Santander" only (title keeps "Santander X Explorer"), location → "Remote".
12. Certifications (cambridge, esplai-cert, amaltea): 2 lines, not 3 — today's org line and note line are
    identical text, duplicated.
13. New `h1`-`h6` scale in `CustomText`, applied per structural data level (hero name, section titles,
    timeline item titles, org line) — fixes certifications' inconsistent title styling as a side effect.
14. Footer: copyright + year (new), drop the "Built with Nuxt 4, Tailwind, Pinia and a bit of AI" line.
15. Meme cards (`MemeCard`/`MemeGrid`) switch from their bespoke CSS to the same elevation system as
    criterion 8.
16. Meme "How it works": no technical detail, plain-language explanation of the game/effect, add a button to
    `/` to see the swapped hero image.
17. Meme search: remove the submit button, auto-search after 1.5s of typing inactivity (debounce); page
    `<h1>` stops saying "Meme mode" (something like "Swap face" instead) — nav link still says "Meme"
    (criterion 2).

## Also fixed this session, on this same theme, but NOT part of this contract (already done, on `feat/post-launch`)

The user separately asked mid-session for the `SourceBanner` marquee to have its whole text clickable (not
just "danimo17/cv"). That was small enough to fix inline immediately — it's already committed on
`feat/post-launch` (`3fbfbdd`), not here. Don't redo it.

## Standards to consult

- `.claude/docs/standards/{components,styling,state,i18n,testing}.md`
- `.claude/docs/catalog/{components,styles,i18n}.md`
- `.claude/docs/decisions/025-neumorphism.md`, `026-custom-primitives.md`, `003-meme-picker.md`,
  `004-meme-state-memory-only.md`, `010-home-sections.md`, `011-visual-style.md`

## Pending on the user

None yet blocking — the two branch/scope questions were already resolved this session (see "Status" above).
The next real decision points are the three "Open questions" listed in `contract.md` (exact copy wording,
heading-level mapping, dropdown implementation pattern) — the contract already says those are engineering/
content calls to make while implementing and log as decisions, not things to ask the user up front, unless
work in progress finds a real conflict with an existing decision.
