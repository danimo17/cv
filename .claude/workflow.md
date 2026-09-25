# AI work workflow (binding)

```
story → contract → build ⟲ iterate → consolidate (gate) → validate → handoff → commit → review → gate:push → PR (AI) → CI+security → merge → deploy → verify deploy → close
```

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
   what. Updated whenever something stops being true, not only at the end.
7. **Commit** — commits on `feat/<slug>` (pre-commit = gate).
8. **Review** (decision 039) — right before opening the PR, not before the first commit: `templates/review-checklist.md`
   (compliance) + `/code-review` (bugs/quality) over the whole branch diff. A finding is a claim: the file is
   opened and confirmed before acting. If there are corrections, they are committed again.
9. **`gate:push`** — full build + e2e green before push (rule 09).
10. **Push / PR (AI)** — with the user's explicit permission for that specific push (decision 031), the AI runs
    `git push` on the `feat/*` branch and opens the PR with `gh pr create` (decision 039: title in English with no
    prefix, body with fixed sections Summary/Acceptance criteria/Review/User pendings/Test plan). CI repeats
    the gate, runs build + e2e and the security scans; the PR gets a preview URL.
11. **Merge / deploy** — the human reviews and merges (rule 06); GitHub only allows it once all checks are
    green. Merging to `main` triggers `deploy.yml` (decision 042: this is a trigger, not a guarantee — it can
    still fail on Cloudflare's side after CI was green).
12. **Verify deploy** (decision 042) — mandatory, not skippable: `gh run list --branch main --limit 1
--workflow deploy.yml` (or the equivalent in the GitHub UI) until the run for this merge shows `success`.
    A failed run is treated as an open bug on the active task, not a footnote — fix it before closing.
13. **Close** — only after step 12 confirms green: fill `.claude/templates/close-checklist.md`'s copy at
    `.claude/tasks/<slug>/close-checklist.md` (every box, verified, not assumed — contract criteria, real
    `gate:push` output, PR merge link+SHA, deploy run, decisions/catalog/standards promoted, no open rule-11
    conflict, backlog row). Then, in one commit: stage the fully-checked checklist as
    `.claude/tasks/closed/<slug>.md` (new file, never deleted — the permanent record), delete
    `.claude/tasks/<slug>/`, clear `ACTIVE` (empty is a valid state — no need to immediately open the next
    task), mark `done` in the backlog. `require-contract.py` (task-close-gate, decision 051) blocks this
    commit if the archive is missing or has any unchecked box — "I promoted everything" is enforced, not
    trusted.

## Gates (what blocks what)

| Gate                              | Runs                                     | Blocks              |
| --------------------------------- | ---------------------------------------- | ------------------- |
| `pre-commit` (git hook)           | `pnpm gate`                              | the commit          |
| `pre-push` (git hook)             | `pnpm gate:push`                         | the push            |
| `require-contract` (Claude hook)  | checks active contract and `--no-verify` | commits from the AI |
| `git-safety` (global Claude hook) | commit/push to `main`                    | the command         |
| CI `ci.yml`                       | gate + build + e2e                       | the PR merge        |
| `security.yml`                    | gitleaks, pnpm audit, CodeQL             | the PR merge        |
| `main` ruleset (GitHub)           | requires the above checks + PR           | the direct merge    |
| `deploy.yml`                      | only on push to `main` with CI green     | the deploy          |
| verify deploy (decision 042)      | `gh run list --workflow deploy.yml`      | closing the task    |

Legitimately unblocking = making it pass. Never `--no-verify`, never `skip`, never delete the test.
