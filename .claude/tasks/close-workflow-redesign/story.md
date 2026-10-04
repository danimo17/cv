# Story: close-workflow-redesign

**Status: queued, NOT started.** Written per the user's explicit request (2026-09-26) right after living
through the exact problem it fixes — do not start without re-reading this in full, it captures a real design
flaw plus a self-audit finding about the current mechanism's actual (non-)enforcement.

**As** the user, **I want** closing a task to ride inside the same PR as the feature work **for** one merge
action per task, not two.

## Problem 1 — the two-PR pattern (user's direct complaint)

Every task closed this session (`ux-redesign`, `task-close-gate`, `dependency-prs-triage`,
`composable-store-regions`, `push-review-gate`) needed its own **separate** close-only PR/branch
(`chore/close-<slug>`), opened and merged _after_ the feature PR. The user's reaction, verbatim intent: once
they accept a PR, closing should already be included — never two PRs for one task.

**Root cause.** `task-close-gate`'s close-checklist (`.claude/templates/close-checklist.md`) requires, as
checked boxes before the closing commit is allowed: "PR merged (link + merge commit SHA)" and "post-merge
deploy verified green". Neither fact can exist until _after_ the feature PR has already merged — so the
archive can only honestly be written in a commit that comes after merge, which (because `main` requires a PR)
forces a second PR every single time. This is structural, not an oversight in how any single task was closed.

## Problem 2 — self-audit finding: the mechanism may never have actually fired

While diagnosing problem 1, re-read `require-contract.py`'s task-close-gate branch closely (not from memory):

```python
if slug:
    ...  # closing-detection + archive verification lives here
else:
    if not all(f.startswith(".claude/") for f in staged):
        ...  # empty-ACTIVE docs-only check
```

`slug` is read fresh from `.claude/tasks/ACTIVE` **at hook-check time** — i.e. whatever is on disk in the
working tree the instant `git commit` is about to run, _including any edit already made and staged in this
same turn_. Every close this session followed the same sequence: write the archive → `rm -rf
.claude/tasks/<slug>/` **and** `printf '' > ACTIVE` together → `git add -A` → `git commit`. By the time the
hook ran, `.claude/tasks/ACTIVE` was **already empty** (the working-tree edit had already happened) — so
`slug=""`, the `if slug:` branch (the actual archive-completeness check) never executed, and every close
instead passed through the much weaker `else` branch (only checks "every staged file is under `.claude/`").

Traced through the code logically and via a sandbox rehearsal of the exact sequence (a global git-safety hook
blocked the final live invocation in `/tmp` regardless of branch name, so the last step wasn't executed
end-to-end — treat this as code-trace-confirmed, not sandbox-execution-confirmed, and verify empirically before
relying on the fix). If confirmed, **no close this session was ever actually gated by the archive-completeness
check it was supposed to enforce** — each one happened to be correct anyway because it was written carefully
by hand, but the safety net had a hole the whole time.

**Fix direction for this bug specifically**: the hook should determine "is a task active for this commit" from
the _pre-commit_ state (`git show HEAD:.claude/tasks/ACTIVE`, matching how the closing-detection already reads
`git ls-tree ... HEAD ...` for the tracked-files check) rather than the live working-tree file — so the check
fires correctly regardless of what order the AI happens to edit files in.

## Fix direction for problem 1

Fold the close-out into the feature branch's own PR, submitted _before_ merge:

1. Feature work, review (`## Review` section filled, push-review-gate's actual target), `gate:push`, **push**,
   open the PR — exactly as today, unchanged.
2. As a **follow-up commit on the same branch** (not a new branch), write the close archive, delete the task
   folder, clear `ACTIVE` — using a checklist that only requires things provable _before_ merge: contract
   criteria done, `gate:push` green, decisions/catalog/standards promoted, no open rule-11 conflict, backlog
   row set to `done` (with "pending merge" until the SHA exists, or just no PR-number placeholder at all).
   Push again to the **same PR** (a second push, not a second PR).
3. The user reviews and merges **once** — the diff they approve already contains both the feature and its own
   closing.
4. Post-merge: deploy verification (decision 042) becomes a lightweight confirmation the AI performs and
   reports on directly in chat — `gh run list --workflow deploy.yml` — **not** a blocking commit requirement.
   A failed deploy is flagged prominently and fixed via a **new** task/commit (matching how a real incident
   gets a new ticket), never by trying to reopen an already-closed, already-deleted task folder.

**Interaction with `push-review-gate` to design carefully**: that gate reads `.claude/tasks/<ACTIVE-slug>/handoff.md`'s
`## Review` section at `git show HEAD:<path>` — keyed off the **current** `ACTIVE` content at push time. If the
close-commit (which clears `ACTIVE`) lands _before_ the push that matters, `push-review-gate` would see an
empty `ACTIVE` and skip checking entirely for that push — silently defeating it, the same class of bug as
problem 2. The ordering above (review commit → push → _then_ close-commit → second push) avoids this because
the first push happens while `ACTIVE` still names the task and `handoff.md` still exists; the second push
happens under an already-empty `ACTIVE`, which is correctly exempt (nothing new to review, just closing
paperwork). Any implementation of this story must preserve that ordering deliberately, not by accident.

## Scope

- `.claude/templates/close-checklist.md`: remove "PR merged"/"deploy verified" as pre-close blocking items;
  add whatever pre-merge-provable items replace them.
- `.claude/hooks/require-contract.py`: fix problem 2 (read `ACTIVE`'s pre-commit/HEAD state for the
  closing-detection branch, not the live working-tree file) — verify with a real, executed sandbox transcript
  this time (route around the global git-safety hook by testing on a real non-`main` branch name it actually
  recognizes, or ask the user how they'd prefer this verified without fighting that hook).
- `.claude/workflow.md`: restructure steps so close-out folds into the push/PR step, and deploy verification
  moves to a post-merge, non-blocking confirmation step.
- `.claude/hard-rules.md` rule 09/10, `.claude/rules/09-gates.md`, `.claude/rules/10-contract-first.md`: update
  to describe the new ordering.
- A new decision record explaining the change and superseding the relevant parts of decisions 042 and 051.

## Out of scope

- Re-closing the 5 tasks already closed this session under the old (possibly-unenforced) pattern — not worth
  the archaeology; this starts from the next task closed onward.
- Any change to `push-review-gate`'s own review-content requirements (the checklist/`code-review` substance
  check) — only its interaction with the new close-ordering is in scope here.

## External dependencies

None.
