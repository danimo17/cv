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
