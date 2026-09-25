# Story: task-close-gate

**As** the user, **I want** a task's close-out (criteria done, gate green, PR merged, deploy verified,
decisions/catalog promoted) to be mechanically checked before the commit that deletes the task folder and
clears `ACTIVE` is allowed, **for** so "I verified it" is never just something the AI claims — closing a task
is gated exactly like committing code already is (rule 09/10).

## Origin (2026-09-25 session)

Hit live: `require-contract.py` blocks every `git commit` unless `.claude/tasks/ACTIVE` names a slug with a
real `contract.md` — with no exception for a pure administrative "close the finished task" commit. That forced
opening a new task (`dependency-prs-triage`) prematurely, just to have a valid contract to commit
`ux-redesign`'s cleanup under — the exact coupling that already happened once before (commit `8230c7e`,
"close bootstrap... open post-launch", same commit). The user confirmed via grill-me: this is a real
structural gap, not a one-off, and asked for it fixed with an actual mechanical gate, not another paragraph of
prose in `workflow.md` that depends on the AI remembering to follow it.

## Decisions (grill-me, 2026-09-25)

1. **`ACTIVE` can be genuinely empty** between tasks (not forced to immediately name the next task). Sentinel:
   empty/whitespace-only file content.
2. **In that empty state, the hook still gates real code.** A commit is allowed through with no active
   contract only if every staged file is under `.claude/` (pure process/docs bookkeeping — closing a task,
   drafting the next story, editing rules/catalog/decisions). Any staged file under `app/`, `server/`,
   `shared/`, or other real code paths still requires `ACTIVE` to name a slug with a valid contract, exactly as
   today.
3. **Closing a task requires an archived, fully-checked checklist in the same commit.** When a commit's
   staged changes delete `.claude/tasks/<ACTIVE-slug>/` (the whole folder), the hook requires
   `.claude/tasks/closed/<ACTIVE-slug>.md` to be staged as a new file in that same commit, and its content to
   contain zero unchecked `- [ ]` boxes (all must be `- [x]`). This file is never deleted — it's a permanent,
   append-only archive of how each task actually closed (evidence, not a promise), distinct from the
   real-time branch registry (`git branch --no-merged main`, already established as sufficient for "what's
   currently open" — this is the complementary "what closed and how" record).
4. **The checklist's item list** operationalizes `workflow.md` step 13's "promote what is durable" clause
   into concrete, checkable items (see `contract.md` criterion 2 for the exact list).
5. **`ux-redesign` itself closes manually** under today's process (already fully, individually verified this
   session — contract criteria, real `gate:push` exit codes, PR #9 merged, deploy run green, decisions
   043/044 and catalog entries confirmed present) — not blocked on this fix landing first. This task's hook,
   once built, applies to every task closed from here on.

## Scope

- `.claude/hooks/require-contract.py`: the two new checks above (empty-ACTIVE-allows-docs-only-commits;
  close-commit-requires-checked-archive).
- `.claude/templates/close-checklist.md`: new template with the item list.
- `.claude/hooks/require-contract.sh`'s docstring / `.claude/docs/catalog/ai-workflow.md`: document the new
  hook behavior (rule 07 — this IS a workflow/hook, the catalog area explicitly covers that).
- `workflow.md` step 13 rewritten to reference the real mechanism instead of prose-only "promote what is
  durable, delete, clear ACTIVE."
- `.claude/hard-rules.md` rule 10's "Enforced by" column gets this hook's new behavior appended.

## Out of scope

- The other `workflow-integrity-hardening` items (unmerged-branch-before-new-work check, orphaned-test-
  reference check, reusable-component scope check, generic rule-mechanization sweep) — still queued there,
  unrelated mechanism, don't fold in here just because both touch `require-contract.py`.
- Retroactively writing closed-checklists for `bootstrap`/`post-launch`/`deploy-secrets-order` (already closed
  under the old process, before this existed) — not worth the archaeology; this starts from `ux-redesign`
  onward.

## External dependencies

None — pure Python (already the hook's language) + one new Markdown template.
