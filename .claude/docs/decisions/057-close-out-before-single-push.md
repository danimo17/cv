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

**Known limits (stated, rule 19).** Progress evidence is checked for presence, not truth; `story`, `validate`
and `deploy-check` are `human` in `workflow-steps.json`. The branch-name slug assumes the `feat/<slug>`
convention (rule 06). Review freshness remains in `workflow-integrity-hardening`.
