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
   `.claude/tasks/ACTIVE` is set to contain the slug. Branch `feat/<slug>`.
2. **Contract** — `contract.md` (template `templates/contract.md`): Given/When/Then criteria, each with the
   test that will cover it (file + name), declared data sources (rule 02), standards to consult, open
   questions with a destination (`decided:` / `owner:` / `docs/decisions/NNN`). The `require-contract` hook blocks
   commits if it doesn't exist. The contract is written by the main thread (rule 12).
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
   under time pressure.
9. **Close-out** (decision 057) — still on the same branch, before the push, so the one PR the user merges
   carries the feature **and** its own closing. Fill `.claude/templates/close-checklist.md`'s copy at
   `.claude/tasks/<slug>/close-checklist.md` with items provable before merge only (contract criteria, real
   `gate:push` log tail, `/code-review` evidence, decisions/catalog/standards promoted, no open rule-11
   conflict, backlog row). Paste the handoff's `## Review` and `## Workflow progress` blocks into it. Then, in
   one commit: stage it as `.claude/tasks/closed/<slug>.md` (new file, never deleted — the permanent
   record), delete `.claude/tasks/<slug>/`, clear `ACTIVE` (empty is a valid state), mark `done` in the
   backlog. `require-contract.py` (`task-close-gate`) detects the close from the commit's own staged
   deletions of any task folder (not from `ACTIVE`, which is already empty by then) and blocks it if the
   archive is missing or has an unchecked box. PR merge and deploy are not archived: they cannot exist yet
   and are covered by steps 12-13.
10. **Gate push** — full `pnpm gate:push` (gate + build + e2e) green before push (rule 09). Its real log tail
    is the evidence for this step and for the close checklist; because close-out only touches `.claude/`, that
    run stays valid for the close commit, and `.githooks/pre-push` re-runs it on the actual push.
11. **Push and PR** — with the user's explicit permission for that specific push (decision 031), the AI runs
    `git push` on the `feat/*` branch **once** and opens the PR with `gh pr create` (decision 039: title in
    English with no prefix, body with fixed sections Summary/Acceptance criteria/Review/User pendings/Test
    plan). `push-review-gate` (decision 054, extended by 057) blocks the push unless the review evidence is in
    the committed tree and every `pre-push` step before this one is ticked with evidence: it reads the
    handoff when `ACTIVE` is set, and `.claude/tasks/closed/<slug>.md` (slug taken from the `feat/<slug>`
    branch name) when `ACTIVE` is empty. `push-pr` is ticked last, after the push and the PR exist. CI repeats the
    gate, runs build + e2e and the security scans; the PR gets a preview URL.
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

| Gate                              | Runs                                                                                                            | Blocks                                      |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `pre-commit` (git hook)           | `pnpm gate`                                                                                                     | the commit                                  |
| `pre-push` (git hook)             | `pnpm gate:push`                                                                                                | the push                                    |
| `require-contract` (Claude hook)  | active contract, `--no-verify`, progress ticks need evidence                                                    | commits from the AI                         |
| `task-close-gate` (Claude hook)   | commit that deletes any `.claude/tasks/<slug>/` folder must stage a fully-checked `closed/<slug>.md`            | the closing commit                          |
| `push-review-gate` (Claude hook)  | `feat/<slug>` push: review evidence + every pre-push progress step ticked (handoff, or closed archive if empty) | the push from the AI                        |
| `git-safety` (global Claude hook) | commit/push to `main`                                                                                           | the command                                 |
| `ci` (CI `ci.yml`)                | gate + build + e2e                                                                                              | the PR merge                                |
| `security.yml`                    | gitleaks, pnpm audit, CodeQL                                                                                    | the PR merge                                |
| `main` ruleset (GitHub)           | requires the above checks + PR                                                                                  | the direct merge                            |
| `deploy.yml`                      | only on push to `main` with CI green                                                                            | the deploy (not the task: deploy-check, 13) |

Steps whose `gate` is `human` in `workflow-steps.json` (`story`, `validate`, `deploy-check`) have no mechanical
check today: a progress tick with non-empty evidence is the only trace for the first two, and the deploy check is
reported in chat. That is stated, not hidden (rule 19).

Legitimately unblocking = making it pass. Never `--no-verify`, never `skip`, never delete the test.
