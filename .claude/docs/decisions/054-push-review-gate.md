# 054 · Push-review-gate: mechanically require review before push

**Context.** Workflow step 8 (review-checklist + `/code-review` over the whole branch diff, right before
opening the PR) already existed in `workflow.md`, but only as prose — nothing checked it actually happened.
On `feat/spacing-tokens`, the AI skipped it and went straight to asking about pushing. The user caught it live
and, rather than accept another promise to remember, asked for the same mechanical treatment as
`task-close-gate` (decision 051): "ensure" means a technical check (rule 19, written the same session), not a
restated intention.

**Decision.** `require-contract.py` gets a new push-time check, structurally parallel to `task-close-gate`'s
commit-time check:

- Applies only when `.claude/tasks/ACTIVE` is non-empty and the current branch matches `feat/*` (an empty-
  `ACTIVE` push is either a closing-only branch, already covered by the docs-only rule, or has no task to
  review against).
- Requires `.claude/tasks/<slug>/handoff.md` to contain a `## Review` section (added to
  `.claude/templates/handoff.md`, positioned between `## Validation` and `## Pending on the user`) with zero
  unchecked `- [ ]` boxes within that section specifically, and a mention of "code-review" (case-insensitive)
  confirming `/code-review` ran.
- Hard block (exit 2), no escape hatch — same posture as `pnpm gate:push` itself, not the softer, overridable
  posture of the (still-queued) unmerged-branch check.
- The `if`/`elif` structure was corrected to two independent `if` blocks during implementation: a combined
  `git commit -m x && git push` invocation has both "commit" and "push" as regex hits, and an `elif` would let
  the commit branch's match suppress the push check entirely — closed before this ever shipped, not found
  later.

**Consequences.** Every future `feat/*` branch with an active task must have a genuinely filled `## Review`
section before it can be pushed at all. `.claude/hard-rules.md` rule 09, `.claude/rules/09-gates.md`, and
`workflow.md` steps 8-9 updated to describe the real mechanism instead of prose-only "review right before the
PR."
