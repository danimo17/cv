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

**Fixed during `/code-review` (high effort), same session, before this shipped:**

- The check originally read `handoff.md` off the working tree (`open(...)`), which meant a push could be
  satisfied by an uncommitted edit — the pushed history would never contain the review evidence the gate
  exists to require. Changed to `git show HEAD:<path>`, so it inspects what was actually committed.
- The branch-name resolution (`git rev-parse --abbrev-ref HEAD`) and its subprocess call had no error
  handling, unlike every other subprocess/file call in this script; both now guard against `OSError` and
  decode failures (`errors="replace"`), matching the file's existing convention.

**Known, accepted limitations (not fixed — documented honestly per rule 19, not silently left as a gap):**

- The "code-review ran" check is a bare case-insensitive substring match on "code-review" — it has no way to
  tell a genuine run from prose that merely mentions the word, including a sentence describing that review was
  _skipped_. Making this airtight would mean parsing intent from free text, which isn't realistic for a regex-
  based hook; the story already scopes "is the content genuinely true" as human judgment, and this is the same
  limit applied to the "did it run at all" claim, not a new one.
- The gate is keyed on `branch.startswith("feat/")` using the checked-out ref, not the actual push target — a
  detached-HEAD push with an explicit refspec (`git push origin feat/x:feat/y`) bypasses it, as does any
  `chore/close-<slug>` push made before the closing commit clears `ACTIVE`. Both require a deliberately unusual
  git incantation in a solo-maintainer project; narrowing this further is deferred rather than adding
  speculative complexity for an attack a human would have to construct on purpose against their own repo.
- The unchecked-box regex (`-\s\[\s\]`, shared with `task-close-gate`) expects exactly one whitespace character
  inside the brackets and the top-level `GIT` regex expects `commit`/`push` immediately after `git` — both
  pre-existing limitations this task inherited rather than introduced, left as-is rather than hardened
  speculatively.
- **Retroactive effect on already-existing branches**: any branch with `ACTIVE` set and no `## Review` section
  in its `handoff.md` (e.g. `feat/composable-store-regions`, written before this gate existed) will be blocked
  on its very next push, with no exemption for having started before the rule did. This is the same trade-off
  `task-close-gate` made — the alternative (versioning which branches are grandfathered) is more complexity
  than a solo-maintainer project's occasional stale branch warrants.
