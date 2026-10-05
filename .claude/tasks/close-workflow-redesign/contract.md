# Contract: close-workflow-redesign

**Story:** `story.md` · **Declared data sources (rule 02):** none — pure `.claude/` process, hook (Python) and
Vitest arch tests; no company material.

Scope shifts from the story's "Fix direction" are logged in decision 057 (written in this task): (a) closing is
detected from the commit's own staged deletions, not from `ACTIVE`, so it works for any task folder; (b) the
close-out lands **before the single push**, and `push-review-gate` derives the slug from the branch name when
`ACTIVE` is empty and reads the review evidence from the closed archive — one push, one PR, one merge, with no
second push needed to keep the gate alive.

## Acceptance criteria

| #   | Given / When / Then                                                                                                                                                                                                                                                                                                                                                         | Test that covers it                                                                                                                                            |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Given a commit stages the deletion of every tracked file of `.claude/tasks/<s>/` (any slug, whatever `ACTIVE` contains in the working tree, even already emptied) and does not stage `.claude/tasks/closed/<s>.md`, When the `require-contract` hook runs on `git commit`, Then it exits 2 naming the missing archive                                                       | `tests/arch/require-contract-hook.spec.ts` › "blocks a close with no archive even when ACTIVE is already empty"                                                |
| 2   | Given the same close commit stages `closed/<s>.md` with an unchecked `- [ ]` box, When the hook runs, Then it exits 2 listing the unchecked lines; with every box checked it exits 0                                                                                                                                                                                        | `tests/arch/require-contract-hook.spec.ts` › "close archive: unchecked box blocks, fully checked passes"                                                       |
| 3   | Given `.claude/templates/close-checklist.md`, When read, Then it has NO "PR merged" or "deploy verified" item (not provable before merge) and DOES have pre-merge items: contract criteria verified, real `gate:push` output, review evidence (`code-review` effort + date), decisions/catalog/standards promoted, no open rule-11 conflict, backlog row `done`             | `tests/arch/workflow-steps.spec.ts` › "close checklist template has only pre-merge-provable items"                                                             |
| 4   | Given a `feat/<slug>` branch with `ACTIVE` non-empty, When `git push` runs, Then behavior of decision 054 is unchanged (handoff `## Review` exists, no unchecked box, mentions `code-review`; otherwise exit 2)                                                                                                                                                             | `tests/arch/require-contract-hook.spec.ts` › "push gate with ACTIVE set: 054 behavior unchanged"                                                               |
| 5   | Given a `feat/<slug>` branch whose `ACTIVE` is empty (task closed in this branch), When `git push` runs, Then the hook derives `<slug>` from the branch name and requires `.claude/tasks/closed/<slug>.md` in `HEAD`, fully checked, with a review section mentioning `code-review`; a missing archive, an unchecked box or no `code-review` mention exits 2 (no more skip) | `tests/arch/require-contract-hook.spec.ts` › "push gate with ACTIVE empty reads the closed archive"                                                            |
| 6   | Given `.claude/workflow-steps.json` is the single list of workflow step ids (each with `phase: pre-push` or `post-merge`), When tests run, Then `workflow.md` has exactly one heading/entry per id in the same order, `.claude/templates/handoff.md`'s `## Workflow progress` has one checkbox line per pre-push id, and the Gates table lists every gate named in the json | `tests/arch/workflow-steps.spec.ts` › "workflow.md, handoff template and gates table match workflow-steps.json"                                                |
| 7   | Given a staged `handoff.md` whose `## Workflow progress` ticks a step (`- [x] <id>`) without an `evidence:` value, When the hook runs on `git commit`, Then it exits 2 naming the step; a tick with evidence passes                                                                                                                                                         | `tests/arch/require-contract-hook.spec.ts` › "ticking a progress step requires evidence"                                                                       |
| 8   | Given a `feat/<slug>` push with `ACTIVE` set, When the handoff's `## Workflow progress` has any pre-push step (before `push-pr`) unticked or without evidence, Then the hook exits 2 listing them; ACTIVE-empty pushes check the same block copied into the closed archive                                                                                                  | `tests/arch/require-contract-hook.spec.ts` › "push requires every pre-push step ticked with evidence"                                                          |
| 9   | Given `workflow.md`, When read, Then close-out precedes `gate-push`/`push-pr` (one PR carries feature + close), and `deploy-check` is a post-merge, non-blocking step the AI reports in chat (failed deploy = new task, never reopening a closed one); `hard-rules.md` rules 09/10, `rules/09-gates.md`, `rules/10-contract-first.md` describe the same ordering            | `tests/arch/workflow-steps.spec.ts` › "workflow.md orders close-out before push and deploy-check after merge"; rule docs checked in review (`## Review`)       |
| 10  | Given this task's own close, When the close commit is made, Then it passes through the fixed hook (dogfooding): `spacing-tokens` is closed in this same branch (its archive in `closed/`, folder deleted) and this task closes last, both before the single push                                                                                                            | the commits themselves: hook output in `handoff.md` `## Workflow progress` evidence; `closed/spacing-tokens.md`, `closed/close-workflow-redesign.md` in the PR |
| 11  | Given decisions 042 and 051, When this task ships, Then decision 057 records the new flow and states exactly which parts of 042 (deploy verification blocks closing) and 051 (archive requires merged PR + deploy; ACTIVE-based detection) it supersedes; `.claude/docs/catalog/ai-workflow.md` documents the new hook behavior, step list and progress block (rule 07)     | `tests/arch/docs-sync.spec.ts` (existing) + `tests/arch/workflow-steps.spec.ts` › "decision 057 and ai-workflow catalog exist"                                 |

## Subagent assignments (rule 12)

| Subagent       | Scope                                                                                                                                                                                                              | Criteria         |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- |
| hook-and-tests | `require-contract.py` rewrite (closing by staged deletions, HEAD-based, ACTIVE-empty push via branch slug, progress verification) + `tests/arch/require-contract-hook.spec.ts` (spawns the hook in temp git repos) | 1, 2, 4, 5, 7, 8 |
| workflow-docs  | `workflow-steps.json`, `workflow.md`, templates (`close-checklist.md`, `handoff.md`), rules 09/10, hard-rules, decision 057, catalog, `tests/arch/workflow-steps.spec.ts`                                          | 3, 6, 9, 11      |
| closer         | Close `spacing-tokens` then this task through the fixed hook, after the two above are merged into the branch and green                                                                                             | 10               |

## Standards to consult

- `.claude/docs/standards/testing.md`, `.claude/docs/standards/code-style.md`
- `.claude/docs/decisions/042-verify-deploy-after-merge.md`, `051-close-gate-checks-closing-before-disk-contract.md`, `054-push-review-gate.md`

## Open questions (each with a destination)

- Single push with close-out before it, instead of the story's push → close → second push → decided: yes,
  `.claude/docs/decisions/057-…` (the story's own ordering concern, `ACTIVE` blinding the push gate, is solved
  by reading the closed archive; it also needs one push permission, not two, rule 06).
- Where the step list lives → decided: `.claude/workflow-steps.json`, read by the hook and the arch test, so a
  step cannot exist without a checkbox and a gate (`workflow-integrity-hardening` item 7 builds the broader
  step-to-gate audit on top of it).
- Review freshness (stale reviews) and the "always prompt `/code-review`" nudge → owner: user, stays in
  `workflow-integrity-hardening` item 6; not built here.
