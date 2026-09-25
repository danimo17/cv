# Story: UX/content redesign pass

**Slug:** `ux-redesign` · **Branch:** `feat/ux-redesign` · **Status:** doing

As the site owner I want a batch of header, component, content and meme-page refinements so that the site
looks more coherent (consistent control heights, a real heading scale, continuous timelines, honest
neumorphic elevation) and the CV content is more accurate (no client-confidential wording, real work-mode
info, deduplicated certifications).

Grilled with the user before starting (2026-09-18): this work is deliberately split from `post-launch`
(operational fixes, already 12/12 and committed) onto its own branch/task, to keep PRs reviewable. The
theme/night toggle stays a toggle (only resized to match the new dropdown's height) rather than becoming a
second dropdown — see decisions to be logged as work lands.

## Out of scope

- Nothing dropped yet; if any item below turns out bigger than expected it gets grilled and logged as a
  decision, not silently descoped.

## External dependencies

- None (no new third-party data sources; all content changes are the user's own CV facts).
