# 09 · Binding gates

**What.** `pnpm gate` (format:check, lint, typecheck, unit+arch) must be green before every commit;
`pnpm gate:push` (gate + build + e2e) before every push; CI (gate + build + e2e + security) green before
every merge to `main`; production deploy only comes from `main` and only if CI is green there. Never
`--no-verify` or `-n`. A test that's bothersome gets fixed or justified in the contract, not skipped.

The workflow is one list of steps (`.claude/workflow-steps.json`, decision 057): everything up to the push
happens on the `feat/<slug>` branch, in this order: review, close-out (archive + task folder deletion, still
the same branch), `gate:push`, then the **single** push and PR. Pushing a `feat/<slug>` branch (push-review-gate,
decisions 054 and 057) requires, in the committed tree (`HEAD`, never the working tree): a `## Review` section
with zero unchecked boxes that mentions `code-review`, and a `## Workflow progress` block with every `pre-push`
step before `push-pr` ticked with evidence. With `ACTIVE` set the gate reads
`.claude/tasks/<slug>/handoff.md`; with `ACTIVE` empty (the task was closed on this branch) it takes `<slug>`
from the branch name and reads `.claude/tasks/closed/<slug>.md`. Hard block, no escape hatch.

The post-merge `deploy-check` (decision 042, relaxed by 057) is **non-blocking**: after the user merges, the AI
runs `gh run list --branch main --workflow deploy.yml` and reports the result in chat. A failed deploy is fixed
in a new task/commit, never by reopening a closed task.

**Why.** "I tested it" is not evidence; the gate is. Same logic extends to "I reviewed it" (decision 054,
rule 19): a workflow step enforced only by the AI remembering to follow it is not enforced. The deploy check
moved out of the blocking path because the facts it verifies (merge, deploy) cannot exist before the merge,
which forced a second close-only PR per task.

**How it's checked.** `.githooks/pre-commit`, `.githooks/pre-push` (enabled by `pnpm install` → `prepare`
script), workflows in `.github/workflows/`, `main` ruleset with required checks, and the Claude hook
`.claude/hooks/require-contract.sh` that blocks `--no-verify`, a commit that ticks a progress step without
evidence, and (on push) a missing review or an incomplete progress block. `tests/arch/workflow-steps.spec.ts`
keeps `workflow.md`, the handoff template and the Gates table in sync with `workflow-steps.json`.
