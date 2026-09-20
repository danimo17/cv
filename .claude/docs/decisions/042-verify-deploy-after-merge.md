# 042 · Verify the deploy after every merge, before closing a task

**Context.** PR #2 (post-launch, merged 2026-09-18) passed `ci` and `security` in full, and the AI's review
process (checklist + `/code-review`) found nothing wrong — because nothing was wrong in the diff. The actual
failure happened two steps later, in `deploy.yml`, which only runs after merge and which no part of the
process ever re-checked: `wrangler-action` uploaded secrets before `wrangler deploy`, and Cloudflare rejected
it (API error 10215, latest Worker version not deployed). The site kept serving the 2026-09-14 build for two
days, unnoticed, until the user asked directly. `workflow.md` (before this decision) treated "merge → deploy"
as one guaranteed step; nothing in the workflow, the review checklist, or the handoff template ever asked
"did the deploy that just triggered actually succeed?".

**Decision.**

1. `workflow.md` gets an explicit, non-skippable step 12 "Verify deploy" between merge and close: `gh run
list --branch main --limit 1 --workflow deploy.yml` must show `success` for the merged commit. A failed
   run is an open bug on the active task, not a footnote — fixed before the task is closed.
2. `templates/handoff.md` gets a "Post-merge deploy check" section so every task carries this checkbox
   forward instead of relying on memory.
3. `docs/catalog/ai-workflow.md`'s gates section documents this as the reason: CI green proves the code is
   correct, not that the deploy reached Cloudflare — those are different guarantees and only the second one
   is what the user actually cares about.

**Consequences.** No new dependency, no new automated test — this is a one-line manual `gh` check, not a new
CI job. Deliberately not adding a CI-side "confirm deploy" job or a Cloudflare-side health check: the failure
mode we saw is visible in the `deploy.yml` run status alone; a synthetic monitor would be solving a problem we
haven't seen yet.
