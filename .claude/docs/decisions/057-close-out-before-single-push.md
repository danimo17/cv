# 057 · Close-out before a single push; step list in one file

**Context.** Every task closed so far (`ux-redesign`, `task-close-gate`, `dependency-prs-triage`,
`composable-store-regions`, `push-review-gate`) needed a second, close-only PR (`chore/close-<slug>`) after the
feature PR. Cause: the close checklist (decision 051) required "PR merged (link + SHA)" and "deploy verified
green" (decision 042) as checked boxes, and neither fact exists until after the feature PR merges, so the
archive could only be written in a post-merge commit that `main`'s PR requirement turned into a second PR.

A self-audit of `require-contract.py` found a second flaw: closing was detected from `.claude/tasks/ACTIVE` read
off the working tree at hook time. Every close wrote the archive, deleted the folder and emptied `ACTIVE`
together before `git commit`, so the hook saw `ACTIVE` empty and fell through to the weak "only `.claude/`
files staged" branch. The archive-completeness check was never keyed off the real commit. (Code-trace
confirmed; the live sandbox run is part of this task's hook work.)

A third gap: nothing tied the handoff to the workflow. The user asked for every workflow step to be covered by
a gate and for each handoff to show which step the branch is at.

**Decision.**

1. **Close-out comes before the single push.** Order: review → close-out (archive + folder deletion + `ACTIVE`
   cleared + backlog `done`, one commit on the feature branch) → `gate:push` → one push and one PR. The user
   merges once; the diff already contains the feature and its closing. The checklist keeps only items
   provable before merge (criteria verified, real `gate:push` tail, `/code-review` evidence, decisions /
   catalog / standards promoted, no open rule-11 conflict, backlog `done`).
2. **Closing is detected from the commit itself**: a commit that stages the deletion of every tracked file of
   any `.claude/tasks/<slug>/` folder is a closing commit, whatever `ACTIVE` contains in the working tree.
3. **`push-review-gate` survives an empty `ACTIVE`**: when `ACTIVE` is empty on a `feat/<slug>` branch it takes
   `<slug>` from the branch name and reads `.claude/tasks/closed/<slug>.md` from `HEAD` (fully checked, a
   `## Review` section mentioning `code-review`, a fully ticked `## Workflow progress`). With `ACTIVE` set it
   reads the handoff exactly as in decision 054. This is why the story's "push, then close, then push again"
   is not needed: one push, one permission (rule 06).
4. **`.claude/workflow-steps.json` is the single step list** (`id`, `phase` `pre-push` | `post-merge`, `title`,
   `gate`). `workflow.md`, the handoff template, the close checklist template and the Gates table are tested
   against it (`tests/arch/workflow-steps.spec.ts`), so a step cannot exist without a checkbox and a named
   gate; steps with no mechanical check say `human` instead of faking one.
5. **Handoff `## Workflow progress`**: first section of every handoff, one `- [ ] <id> — evidence:` line per
   `pre-push` id. A commit may not tick a step without evidence; a push requires every `pre-push` step before
   `push-pr` ticked with evidence (`push-pr` is ticked last, after the push). The block is copied into the
   closed archive so the ACTIVE-empty push reads the same data.
6. **Deploy check is post-merge and non-blocking**: the AI runs `gh run list --branch main --workflow
deploy.yml` and reports in chat. A failed deploy opens a new task/commit, never a reopened task folder.

**What this supersedes.**

- From decision 042: the point that "Verify deploy" is a mandatory step between merge and close and that a
  failed run is an open bug on the active task to be fixed before closing, and the handoff's "Post-merge deploy
  check" section. What stays: deploy verification itself still happens after every merge (`gh run list`),
  because CI green does not prove the deploy reached Cloudflare.
- From decision 051: the requirement that the archive contain a merged PR and a verified deploy (they cannot
  exist before merge), and the `ACTIVE`-based detection of a closing commit (the "slug read from `ACTIVE`"
  premise). What stays: a closing commit is checked before the disk-based contract check, the archive must be
  staged and fully checked, and it is never deleted.
- Decision 054 is extended, not superseded: its handoff-based review check is unchanged when `ACTIVE` is set.

**Consequences.** One PR, one merge per task. The archive records pre-merge facts only; the deploy outcome lives
in chat and, if it fails, in a new task. Unticked `push-pr` in the archive's progress copy is the one allowed
unchecked line (the hook must exempt it). `gate:push` is run before the close commit and re-run by
`.githooks/pre-push`; the close commit only touches `.claude/`, so the earlier run stays valid.

**Known limits (stated, rule 19).** Progress evidence is checked for presence, not truth; `validate` and
`deploy-check` are `human` in `workflow-steps.json` (`story` is `require-contract`: an active task without
`story.md` blocks commits, but the story's content is not judged). The hook reads the index and `HEAD`, so it
cannot see a commit made outside Claude's Bash tool or a push whose refspec differs from the checked-out
branch. The branch-name slug assumes the `feat/<slug>`
convention (rule 06). Review freshness remains in `workflow-integrity-hardening`.

## Amendment 2026-10-05 — branch-keyed slug, one script for every client, verified evidence

Prompted by a high-effort `/code-review` of `feat/close-workflow-redesign` and by the user's two requirements:
every workflow step must be mechanically gated no matter who or what runs git, and many `feat/*` branches must
be able to run in parallel. The decision above stays as written; this section changes the following parts.

1. **The slug comes from the branch, `ACTIVE` is ignored on `feat/*` (supersedes decision point 3 and the
   "ACTIVE set vs empty" split).** On a `feat/<slug>` branch the hook uses `<slug>` for the commit checks
   (`.claude/tasks/<slug>/{story,contract}.md`) and for the push gate, which reads
   `.claude/tasks/<slug>/handoff.md` from the pushed commit's tree if it exists there, else
   `.claude/tasks/closed/<slug>.md`; neither present blocks. A feat branch whose folder is gone and whose archive
   is staged/committed counts as closed (docs-only commits). On other branches `ACTIVE` keeps today's meaning for
   commit checks. `ACTIVE` and its other consumers are not deleted; it is just no longer required or updated on
   feat branches, so parallel branches never fight over one file nor get gated against another task's handoff.
2. **One script, three callers (supersedes the "Known limits" sentence that the hook only sees Claude's Bash
   tool).** `.claude/hooks/require-contract.py` keeps its stdin-JSON Claude mode and gains `--commit`
   (`.githooks/pre-commit`, before `pnpm gate`), `--pre-push` (`.githooks/pre-push`, before `pnpm gate:push`;
   gates the LOCAL SHA of every pushed `refs/heads/feat/<slug>` from git's stdin lines) and `--ci <branch> <sha>`
   (job `workflow-gate` of `ci.yml`, on `pull_request` events whose head branch starts with `feat/`). Same checks,
   exit codes and messages. `--no-verify` can still skip the git hooks; CI is the backstop (a required check
   closes it; the job could not be run locally, its first real run is the next feat PR).
3. **The Claude push gate follows the refspec.** `git push [flags] [remote] [refspec...]` is parsed; every
   destination starting with `feat/` is gated on the tip of its source ref. No refspec = current branch;
   detached HEAD with no refspec blocks. `--delete`, `:dst` and non-feat destinations are not gated; `--all`,
   `--mirror` and wildcard refspecs gate every local `feat/*` branch. This replaces "reads the checked-out
   branch" from the known limits.
4. **Evidence is validated, not just present.** For `commit`, `review` and `close-out` the evidence must contain a
   7-40 character hex token that resolves with `git cat-file -e <tok>^{commit}` in the repository being checked
   (commit time and push time); other steps stay free text but non-empty. `[X]` counts as ticked like `[x]`
   everywhere. The check proves the sha exists, not that it is the right commit.
5. **No test-only hook override.** `HOOK_UNDER_TEST` is removed from `tests/arch/require-contract-hook.spec.ts`
   and `tests/arch/workflow-steps.spec.ts` fails if any arch spec brings one back. The proof that the earlier
   spec failed on the pre-rewrite hook (`git show 73871d8:.claude/hooks/require-contract.py`) is recorded once in
   the task handoff.

**Consequences.** Branch slug = task slug becomes load-bearing (rule 06 convention); a branch named differently
from its task folder is blocked by the hook until it is renamed. Closing a task no longer clears `ACTIVE` on feat
branches. The `commit` / `close-out` evidence of a commit can only cite an earlier commit (a commit cannot name
its own sha), which is the intended reading: the evidence points at the work that was gated.

## Amendment 2026-10-06 — the close-out is last; reviews go stale; the gate cannot be weakened by its own PR

Prompted by the user's high-effort `/code-review` of the whole `feat/close-workflow-redesign` branch (six findings)
and by the premature close of that task (reverted in `c1d0785`): a close-out taken before the final review makes
every later fix either bypass the review or force a messy reopening. The decision above and the 2026-10-05
amendment stay as written; this section adds the following.

1. **The close-out is the LAST commit before the push**, taken only after the final review of the full diff (a
   user-run `/code-review` included) and every fix that review asked for. Code changed after a review makes the
   review stale. To reopen after a later finding: `git revert <close-out sha>` restores the task folder and
   removes the archive, fix (tests first), re-review, record the new review evidence, close again.
2. **Stale-review gate (supersedes "Review freshness remains in `workflow-integrity-hardening`" for the
   mechanical part).** The `review` progress evidence is the sha of the commit that recorded the review (an
   ancestor of the tip that changed the task's `handoff.md` or `closed/<slug>.md`). In `push_gate` (Claude hook,
   `--pre-push`, `--ci`) and in the closing commit (`HEAD` as the tip), any commit in `<review sha>..<tip>` whose
   diff touches a path outside `.claude/` blocks, naming the review sha, the first such commit and the command
   `/code-review high`. Merge commits are judged by their first-parent diff, so a merge of `main` counts for what
   it brings. A review at or after the last code commit passes. Still in `workflow-integrity-hardening` item 6:
   the proactive "always prompt `/code-review`" wording and a minimum effort level (the gate does not read the
   effort).
3. **Evidence is tied to its step.** `commit` and `close-out` evidence must be an ancestor of the tip being
   checked (`HEAD` at commit time, the pushed sha at push time); `review` evidence additionally must be a commit
   that touched `.claude/tasks/<slug>/handoff.md` or `.claude/tasks/closed/<slug>.md`. `close-out` cannot cite
   its own commit (a commit cannot name its sha): it cites the earlier work that was gated, as before.
4. **CI runs the base branch's copy of the gate.** The `workflow-gate` job runs
   `git show origin/$BASE_REF:.claude/hooks/require-contract.py` with `--base origin/$BASE_REF` (the step list
   comes from the base ref too) when that copy supports `--ci`, so a PR cannot weaken its own gate. The PR that
   introduces the mode falls back to its own copy and prints a notice. `--ci <branch> <sha> [--base <ref>]`.
5. **Smaller gate fixes.** Merge, rebase, cherry-pick and revert commits (`MERGE_HEAD`, `rebase-merge/`,
   `rebase-apply/`, `CHERRY_PICK_HEAD`, `REVERT_HEAD`) skip the "docs-only because closed/no active task" rule
   (other checks stay); the Claude hook sees `git -C <dir>`, `git -c k=v`, `git --git-dir=...`, `git --no-pager`
   before `commit`/`push`; the unchecked scan counts only real list items (`^\s*- \[ \]`) outside fenced code
   blocks; the `hard-rules.md` table rows stay short (rows 09/10 are summaries, details live in
   `rules/09-gates.md` and `rules/10-contract-first.md`, tested by `hard-rules rows stay short`).

**Consequences.** After a review the only commits that do not stale it are `.claude/`-only ones (docs, handoff,
archive, backlog). (Superseded in part by the second 2026-10-06 amendment below: edits to the gate itself under
`.claude/hooks/` and `.claude/workflow-steps.json` do stale a review, and merging `main` does not.) The first CI
run of `workflow-gate` on this branch uses the PR copy (the base has no `--ci` yet); from the next PR on, the base
copy gates. The user adds `workflow-gate` to the `main` ruleset's required checks after the first CI run.

## Amendment 2026-10-06 (second review)

Prompted by the user's second high-effort `/code-review` of the same branch, which found six more weaknesses in
the gate added by the previous amendment. Everything above stays as written except where this section says it is
superseded; the criteria are 25-30 of the task contract.

1. **Review evidence is the commit that changed the `## Review` section (tightens amendment 2026-10-06, point
   3).** Touching `handoff.md` or `closed/<slug>.md` was too weak: a progress tick or a Pending edit would
   qualify. The cited commit must have changed the content of the `## Review` section versus its first parent (a
   root commit counts if the section exists; dropping the section does not). If several shas are cited, any
   qualifying one passes.
2. **Freshness compares the branch's own diff, not every reachable commit (supersedes the commit-walk of point 2
   of the previous amendment).** Walking `<review>..<tip>` made a merge of `main` stale the review for what
   main brought. The base ref is `--base` (CI), else `origin/main` if it resolves, else `main`; the review is
   fresh when `git diff <base>...<review>` and `git diff <base>...<tip>`, restricted to code paths and compared
   after dropping `index` lines and hunk headers (`-U0`, `--binary`), are equal. A three-dot diff is taken
   against the merge-base, so main's own changes drop out. With no base or no merge-base it falls back to the old
   walk (first-parent diff per commit). Known imprecision, stated: a stale local `origin/main`, or a main edit
   that overlaps a hunk the branch changed, reads as a branch change and errs towards stale.
3. **The gate itself counts as code (supersedes "a `.claude/` change after the review does not stale it").** Code
   paths for freshness are everything outside `.claude/` plus `.claude/hooks/` and `.claude/workflow-steps.json`
   (`.githooks/` is outside `.claude/` already). Other `.claude/` files (docs, rules, handoff, archive, backlog)
   still do not.
4. **`core.hooksPath` overrides are refused like `--no-verify`.** `git -c core.hooksPath=<x> commit|push` (key
   matched case-insensitively), `--config-env=core.hooksPath=...` and `--config-env core.hooksPath ...` switch
   the git hooks off; the Claude hook refuses them with a rule 09 message. Limit: the same effect through git
   config files or `GIT_CONFIG_*` environment variables is not seen by the Claude hook (CI is the backstop).
5. **CI probes both `--ci` and `--base` in the base copy (tightens point 4 of the previous amendment).** A base
   script that supports `--ci` but not `--base` would fail on the unknown argument; the job now requires both
   strings in the base copy, else it falls back to the PR copy with the notice `base branch has no --ci/--base
gate yet`. `workflow-steps.spec.ts` also runs the extracted job script against fake base scripts.
6. **The unchecked scan covers every list marker (extends point 5 of the previous amendment).** `^\s*(?:[-*+]|\d+[.)])\s+\[ \]`
   outside fenced code: `* [ ]`, `+ [ ]`, `1. [ ]` and `1) [ ]` count like `- [ ]`. The exempt progress line is
   still `- [ ] push-pr`.

**Consequences.** The review recorded before this amendment is stale by construction (this amendment changes
`.claude/hooks/`), so a fresh user-run `/code-review high` of the final diff is required before the close-out.
Merging `main` into a feature branch after its review is now safe. Editing the gate (`.claude/hooks/`,
`.claude/workflow-steps.json`) after a review always asks for a new review, which is the point: the gate protects
the process the same way the product code is protected.
