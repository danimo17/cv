# Story: push-review-gate

**As** the user, **I want** `git push` on a `feat/*` branch to mechanically require evidence that workflow
step 8 (review-checklist + `/code-review`) ran, **for** so "I reviewed it" is enforced the same way "I tested
it" already is (rule 09) — not a claim the AI can skip under time pressure and only self-report.

## Origin (2026-09-26 session)

Right after the tools-of-the-trade shift established for `task-close-gate` (a mechanical gate is the fix, not
a restated promise — rule 19, also new this session), the AI skipped workflow step 8 for `feat/spacing-tokens`
and went straight to asking about pushing. The user caught it live and asked for the same treatment as the
close-checklist: a real hook, not a promise.

## Decisions (grill-me, 2026-09-26)

1. **Hard block, no escape hatch** — unlike the unmerged-branch check (queued in `workflow-integrity-hardening`,
   which gets an explicit override), review-before-push is treated like `pnpm gate:push` itself: rule 09
   territory, no "not this time."
2. **Evidence lives in the handoff**: `.claude/tasks/<slug>/handoff.md` must contain a `## Review` section
   (added to `.claude/templates/handoff.md`) with the review-checklist content and zero unchecked `- [ ]`
   boxes within that section specifically (other sections, like "Post-merge deploy check", legitimately have
   unchecked boxes at push time — the hook only inspects the `## Review` section's own text, not the whole
   file), plus a mention that `/code-review` ran (case-insensitive substring match on "code-review").

## Scope

- `.claude/templates/handoff.md`: add a `## Review` section between `## Validation` and `## Pending on the
user` (matching workflow order: validate → handoff → commit → review → gate:push → push).
- `.claude/hooks/require-contract.py`: new check, only for `git push` (not `commit`) when the current branch
  matches `feat/*` and `ACTIVE` is non-empty (an empty-`ACTIVE` push is either a closing-only branch or has no
  task to review against — out of scope, the existing empty-ACTIVE docs-only rule already covers it). Extract
  `.claude/tasks/<slug>/handoff.md`'s `## Review` section (text between that heading and the next `## ` heading
  or EOF); block with a clear message if the section is missing, contains `- [ ]`, or doesn't mention
  "code-review" (case-insensitive).
- `.claude/hard-rules.md` rule 09's "Enforced by" column and `.claude/rules/` (09's file, if one exists — check)
  updated to reflect the new check.
- `.claude/workflow.md` step 8/9 updated to reference the mechanism.
- A decision file recording this (next available number).

## Out of scope

- Automating the actual content quality of the review (whether the checklist items are genuinely true) — that
  stays human judgment, same honest limit as rule 12's mechanization sweep. The hook verifies the SECTION
  EXISTS and is fully checked, not that the reviewer was thorough.
- Any change to `task-close-gate`'s own mechanism (separate hook logic, already built and merged).

## External dependencies

None — same Python hook file, same pattern as `task-close-gate` (decision 051).
