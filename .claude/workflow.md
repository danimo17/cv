# AI work workflow (binding)

```
story → contract → build ⟲ iterate → consolidate (gate) → validate → handoff → commit → review → close-out → gate:push → push + PR (AI) → CI+security → merge (human) → deploy-check (non-blocking)
```

The step list lives in one place: `.claude/workflow-steps.json` (decision 057). Every entry below carries the
same id order and title as that file, the handoff's `## Workflow progress` block has one checkbox per
`pre-push` id, and the Gates table at the bottom names every gate the file refers to
(`tests/arch/workflow-steps.spec.ts`). Steps 1-11 are `pre-push`: they all happen on the `feat/<slug>` branch
**before the single push**. Steps 12-13 are `post-merge`. One task = one branch = one PR = one merge.

1. **Story** — `.claude/tasks/<slug>/story.md` (template `templates/story.md`): "As a <actor> I want <what> for
   <value>", out of scope, external dependencies. Added to `.claude/backlog.md` with status `doing` and
   Branch `feat/<slug>`: the slug is the branch name, so `.claude/tasks/ACTIVE` is neither required nor updated on
   feat branches (decision 057 amendment: several `feat/*` branches can run in parallel without sharing a
   file; the hooks ignore `ACTIVE` there). If the story touches a shared component (see step 2), say so in
   the story: the scope question comes right after it.
2. **Contract** — `contract.md` (template `templates/contract.md`): Given/When/Then criteria, each with the
   test that will cover it (file + name), declared data sources (rule 02), standards to consult, open
   questions with a destination (`decided:` / `owner:` / `docs/decisions/NNN`). The `require-contract` hook blocks
   commits if it doesn't exist. The contract is written by the main thread (rule 12). For any component under
   `app/components/shared/` or used from more than one parent, grep its consumers and **ask** the user before
   writing the contract whether the change applies only here or everywhere; the grep result and the answer go in
   the contract's `## Shared component consumers` section (rules 11, 16, 20).
3. **Build / iterate** — the main thread breaks the contract into assignments for subagents (rule 12), by
   layer (config → server → state → components → pages), each artifact with its own CSS (rule 08), its own
   block in the catalog (rule 07) and its own test if it has logic. During human corrections the full gate is
   not run: one report line per change, contract updated if scope shifts. Every correction requested by the
   human earns a test in the same change.
4. **Consolidate** — `pnpm gate`. What fails gets fixed. If a test is wrong, it's justified in the contract.
5. **Validate** — **real** output of `pnpm gate` in `handoff.md` (N tests, 0 lint, 0 type errors) and what the
   suite does NOT cover.
6. **Handoff** — `handoff.md` = the branch's true state + **User pendings** + which subagents did
   what. It opens with the `## Workflow progress` status bar: one line per `pre-push` id in order, ticked
   (`- [x] <id> — evidence: <commit sha / gate output line / date>`) only when the step is really done, with
   the evidence filled in (a tick without evidence is blocked at commit time by `require-contract`).
   Updated whenever something stops being true, not only at the end.
7. **Commit** — commits on `feat/<slug>` (pre-commit = gate).
8. **Review** (decision 039) — right before opening the PR, not before the first commit: `templates/review-checklist.md`
   (compliance) + `/code-review` (bugs/quality) over the whole branch diff. A finding is a claim: the file is
   opened and confirmed before acting. If there are corrections, they are committed again. The result is
   written into the handoff's `## Review` section (checklist fully checked, `/code-review` outcome noted with
   its effort level and date) — `push-review-gate` mechanically requires it, so it can't be silently skipped
   under time pressure. The `review` progress evidence is the sha of the commit that recorded the review
   (an ancestor of the tip whose diff changed the content of the `## Review` section of `handoff.md` or
   `closed/<slug>.md`: a commit that only ticks progress or edits Pending does not count). A review is only
   valid for the code it saw: if the branch's own diff against its base (`main`) changes in any path outside
   `.claude/`, or in `.claude/hooks/` or `.claude/workflow-steps.json` (the gate itself), after the review
   commit, the review is stale and the gates (`push-review-gate`, `task-close-gate`) block, naming the sha,
   the path and the first later commit, and the command `/code-review high` to run again; the result is
   recorded in a new commit and the `review` evidence re-pointed at it. Merging `main` into the branch
   after the review does not stale it (only the branch's own changes are compared; decision 057 amendments
   2026-10-06). A fix after the review is exempt from staleness only when its commit also changes a file under
   `tests/` or `e2e/` (a finding becomes a test), and once the `review` step is ticked a commit that stages code
   without a test is blocked at commit time. Every finding is written as a `- finding <id> — outcome: ... —
proof: ...` line of `## Review` and checked at push and close (see `## Review policy`).
9. **Close-out** (decision 057) — still on the same branch, before the push, so the one PR the user merges
   carries the feature **and** its own closing. Fill `.claude/templates/close-checklist.md`'s copy at
   `.claude/tasks/<slug>/close-checklist.md` with items provable before merge only (contract criteria, real
   `gate:push` log tail, `/code-review` evidence, decisions/catalog/standards promoted, no open rule-11
   conflict, backlog row). Paste the handoff's `## Review` and `## Workflow progress` blocks into it. Then, in
   one commit: stage it as `.claude/tasks/closed/<slug>.md` (new file, never deleted — the permanent
   record), delete `.claude/tasks/<slug>/`, mark `done` in the backlog. `require-contract.py`
   (`task-close-gate`) detects the close from the commit's own staged deletions of any task folder (never
   from `ACTIVE`) and blocks it if the archive is missing, has an unchecked box, or cites a stale review. PR
   merge and deploy are not archived: they cannot exist yet and are covered by steps 12-13.
   **The close-out is the last commit before the push**, taken only after the final review of the full diff
   (a user-run `/code-review` included) and every fix that review asked for: code changed after a review makes
   it stale (step 8), so closing earlier only produces a close that the gates reject. If a later review
   finds something after the close-out, reopen: `git revert <close-out sha>` restores the task folder and
   removes the archive, fix the finding (tests first), commit, re-review, record the new review evidence, and
   close again (a fresh close-out commit, once more the last one before the push).
10. **Gate push** — full `pnpm gate:push` (gate + build + e2e) green before push (rule 09). Its real log tail
    is the evidence for this step and for the close checklist; because close-out only touches `.claude/`, that
    run stays valid for the close commit, and `.githooks/pre-push` re-runs it on the actual push.
11. **Push and PR** — with the user's explicit permission for that specific push (decision 031), the AI runs
    `git push` on the `feat/*` branch **once** and opens the PR with `gh pr create` (decision 039: title in
    English with no prefix, body with fixed sections Summary/Acceptance criteria/Review/User pendings/Test
    plan). `push-review-gate` (decision 054, extended by 057) blocks the push unless the review evidence is in
    the committed tree and every `pre-push` step before this one is ticked with valid evidence (a real commit
    sha for `commit`, `review` and `close-out`). The slug is the destination `feat/<slug>` branch name (never
    `ACTIVE`); the gate reads `.claude/tasks/<slug>/handoff.md` from the tip commit of the pushed ref, else
    `.claude/tasks/closed/<slug>.md`, and follows the refspec, not the checked-out branch. The same script
    runs from `.githooks/pre-push` (any git client) and from the `workflow-gate` job of CI on every `feat/*`
    pull request. `push-pr` is ticked last, after the push and the PR exist. CI also repeats the gate, runs
    build + e2e and the security scans; the PR gets a preview URL.
12. **Merge** — the human reviews and merges once (rule 06); GitHub only allows it once all checks are
    green. Merging to `main` triggers `deploy.yml` (decision 042: this is a trigger, not a guarantee — it can
    still fail on Cloudflare's side after CI was green). Post-merge steps are not listed in the handoff's
    progress block.
13. **Deploy check** (decision 042, relaxed by 057) — post-merge and non-blocking: the AI polls
    `gh run list --branch main --limit 1 --workflow deploy.yml` until the run for the merge shows `success`
    and reports the result in chat. It is not archived and not a commit requirement. A failed run is flagged
    prominently and fixed in a new task/commit (new story, new branch), never by reopening a closed task
    folder.

## Gates (what blocks what)

| Gate                              | Runs                                                                                                                                                                         | Blocks                                      |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `pre-commit` (git hook)           | `require-contract.py --commit`, then `pnpm gate`                                                                                                                             | the commit (any client)                     |
| `pre-push` (git hook)             | `require-contract.py --pre-push` (gates the pushed SHA), then `pnpm gate:push`                                                                                               | the push (any client)                       |
| `require-contract` (Claude hook)  | active story + contract, `--no-verify`, progress ticks need evidence                                                                                                         | commits from the AI                         |
| `task-close-gate` (Claude hook)   | commit that deletes any `.claude/tasks/<slug>/` folder must stage a fully-checked `closed/<slug>.md` citing a fresh review                                                   | the closing commit                          |
| `push-review-gate` (Claude hook)  | push to `feat/<slug>`: review evidence + every pre-push progress step ticked with valid evidence (handoff, else closed archive; slug from the branch, tip of the pushed ref) | the push from the AI (also git hook and CI) |
| `git-safety` (global Claude hook) | commit/push to `main`                                                                                                                                                        | the command                                 |
| `ci` (CI `ci.yml`)                | gate + build + e2e; job `workflow-gate`: `require-contract.py --ci` on `feat/*` PRs                                                                                          | the PR merge                                |
| `security.yml`                    | gitleaks, pnpm audit, CodeQL                                                                                                                                                 | the PR merge                                |
| `main` ruleset (GitHub)           | requires the above checks + PR                                                                                                                                               | the direct merge                            |
| `deploy.yml`                      | only on push to `main` with CI green                                                                                                                                         | the deploy (not the task: deploy-check, 13) |

Steps whose `gate` is `human` in `workflow-steps.json` (`validate`, `deploy-check`) have no mechanical
check today: a progress tick with non-empty evidence is the only trace for `validate`, and the deploy check is
reported in chat. That is stated, not hidden (rule 19). (`story` is gated by `require-contract`: an active task
without `story.md` blocks commits.)

Legitimately unblocking = making it pass. Never `--no-verify`, never `skip`, never delete the test.

## Review policy

Decision 057, amendment `2026-10-06 (third review: findings become tests, search first)`. This is the
convergence policy of the review step; the mechanisms named here are checks in `require-contract.py`, not
reminders.

- **A finding becomes a test.** Every bug a review finds is closed by a test that fails without the fix, never by
  prose. After the `review` step is ticked, a commit that stages code must stage a file under `tests/` or `e2e/`
  (commit time); a later code commit without a test makes the review stale; every finding is a line of `## Review`,
  `- finding <id> — outcome: <fixed|queued|no_change_needed> — proof: <text>`, whose proof is checked at push and at
  the close. Enforced by hooks, not memory (rule 19).
- **Search first.** Before writing a test, search `tests/` and `e2e/` for one that already covers the behavior and
  strengthen an existing test; create a new one only when none exists. `fixed` therefore has two proofs:
  `strengthened <tests/file> › <test name>` (the test exists at the base ref and its file differs from the base) or
  `new <tests/file> › <test name> — searched: <term>[, <term>...]` (the title is not at the base, and the gate
  performs the search itself: any other describe/it/test title matching a term blocks the push unless the line
  adds `— differs: <why a new test is needed>`). Titles are unique per file
  (`tests/arch/no-duplicate-test-titles.spec.ts`).
- **The test is the verification, not a second review.** A fix is not re-reviewed: the test that failed before and
  passes now is the evidence.
- **At most two review rounds per task.** The second reviews only the delta (`/code-review` on
  `git diff <last-reviewed-sha>..HEAD`), then the close.
- **Deliberate evasions are queued, not blocking.** A finding that only a deliberate attack on the gate triggers
  goes to `workflow-integrity-hardening` with a severity (`outcome: queued`); only normal-use correctness findings
  block the close.
- **Honest limit.** A test proves that bug cannot return, not that the fix adds none elsewhere: the full suite,
  `gate:push` and CI are the net, and a new bug class gets a new test. Duplicate detection is by titles and search
  terms, not semantic.
