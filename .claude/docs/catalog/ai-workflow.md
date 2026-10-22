# Catalog · AI workflow (scripts, gates, hooks and workflows)

Living documentation (rule 07): every new or changed script, gate, hook or workflow is updated here in the same commit.

## Scripts (`package.json`)

| Script                            | Does                                                                                     | Who calls it           |
| --------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------- |
| `dev` / `build` / `preview`       | `nuxt dev` / `nuxt build` (preset `cloudflare_module`) / `nuxt preview`                  | you, CI                |
| `gate`                            | `format:check` + `lint` + `typecheck` + `test` (unit + arch)                             | `pre-commit`, `ci.yml` |
| `gate:push`                       | `gate` + `build` + `test:e2e`                                                            | `pre-push`             |
| `test` / `test:arch` / `test:e2e` | vitest / only `tests/arch` / Playwright (chromium, against `nuxt dev`, decision 019)     | you, CI                |
| `cf:dev` / `cf:deploy`            | `wrangler dev` / `wrangler deploy` (local testing only; the real deploy is `deploy.yml`) | you                    |
| `prepare` / `postinstall`         | `git config core.hooksPath .githooks` / `nuxt prepare`                                   | `pnpm install`         |

## Gates and hooks

| Hook                                                                                  | Runs                                                                                                                                                                                                                                                                                                                                      | Blocks                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.githooks/pre-commit`                                                                | `require-contract.py --commit`, then `pnpm gate`                                                                                                                                                                                                                                                                                          | the commit (any client: Claude, an editor, a terminal)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `.githooks/pre-push`                                                                  | `require-contract.py --pre-push` (reads git's stdin lines, gates the pushed SHA), then `exec pnpm gate:push`                                                                                                                                                                                                                              | the push (any client)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `.claude/hooks/require-contract.sh` (PreToolUse Bash, Claude) → `require-contract.py` | same script, no argument (JSON on stdin): looks for real `git commit`/`git push` calls in the command                                                                                                                                                                                                                                     | `--no-verify`, `git commit -n` (also a short-flag cluster such as `-nm`/`-anm`; `git push -n` is a dry run and stays allowed) and a `core.hooksPath` override (`-c core.hooksPath=...` in any case, `--config-env`, a chained `git config ... core.hooksPath`, `GIT_CONFIG_KEY_<n>=core.hooksPath`) on `git commit`/`git push` (rule 09); `git commit` (also `require-contract.py --commit`, the pre-commit git hook): a commit that stages the deletion of every tracked file of any `.claude/tasks/<slug>/` folder (any slug but `closed`, whatever `ACTIVE` holds) without a staged, new `.claude/tasks/closed/<slug>.md`, or with that archive holding an unchecked box other than the `push-pr` progress line (rule 10, task-close-gate, decisions 051 and 057); otherwise, with no active task (a non-`feat/` branch whose `ACTIVE` is empty, a `feat/<slug>` branch whose task is already archived, or a closing commit) any staged file outside `.claude/` (rule 10; skipped for non-closing commits while a merge, rebase, cherry-pick or revert is in progress); otherwise no `story.md` or no `contract.md` with "Given" for the task slug (rule 10; the slug is the `feat/<slug>` branch name, `ACTIVE` only on other branches, decision 057 amendment); a staged `handoff.md` or `closed/*.md` that ticks a `## Workflow progress` step with empty evidence, or a `commit`/`review`/`close-out` step whose evidence has no 7-40 hex sha resolving to a commit (rule 09); staging `nuxt.config.ts` or `eslint.config.mjs` without also staging a file under `.claude/docs/decisions/` (rule 11, decision 041); once the handoff's `review` step is ticked at `HEAD`, a non-closing commit that stages code with no file under `tests/` or `e2e/` (rule 09, decision 057 third amendment; merge/rebase/cherry-pick/revert exempt); `git push` (also `--pre-push` and `--ci`): every destination `feat/<slug>` branch, using the tip of the pushed source ref (not the checked-out branch): review evidence (fresh, and every `## Review` finding line with its proof) and every `pre-push` step before `push-pr` ticked with valid evidence, read from that commit's tree (`<slug>/handoff.md` if it exists there, else `closed/<slug>.md`, neither → block) (rule 09, push-review-gate, decisions 054 and 057) |
| `ci.yml` job `workflow-gate` (GitHub Actions)                                         | the BASE branch's copy of `require-contract.py --ci "$HEAD_REF" "$HEAD_SHA" --base "origin/$BASE_REF"` (fallback to the PR's copy with a `::notice::` unless the base copy mentions both `--ci` and `--base`) on `pull_request` events whose head branch starts with `feat/` (`fetch-depth: 0`; skipped for other PRs such as Dependabot) | the PR merge, if the job is a required check; always visible on the PR (cannot be run locally, untested in Actions)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |

Manual check of the hook (the automated one is `tests/arch/require-contract-hook.spec.ts`): from Claude, on a `feat/<slug>` branch with no `.claude/tasks/<slug>/contract.md`, `git commit -m x` must fail with "Rule 10: no commit without a contract" (a non-`feat/` branch with `ACTIVE` empty and a file outside `.claude/` staged must fail with "Rule 10: no active task ..."); `git commit --no-verify -m x` must fail with "Rule 09: --no-verify / -n is not allowed"; from a terminal, `echo "refs/heads/feat/<slug> $(git rev-parse HEAD) refs/heads/feat/<slug> 0000000000000000000000000000000000000000" | python3 .claude/hooks/require-contract.py --pre-push` runs the push gate on that commit. It only looks at actual git invocations (start of line or after `;`, `&&`, `||`, `|`), not prose inside heredocs. Staging `nuxt.config.ts`/`eslint.config.mjs` alone (no decision file staged) must fail with "Rule 11: this commit changes nuxt.config.ts or eslint.config.mjs...".

## Workflow step list and progress block (decision 057)

`.claude/workflow-steps.json` is the single ordered list of workflow steps: an array of
`{ "id", "phase", "title", "gate" }`. `phase` is `pre-push` (everything on the `feat/<slug>` branch before the
single push) or `post-merge`; `gate` names what mechanically fails if the step is skipped (`require-contract`,
`pre-commit`, `task-close-gate`, `push-review-gate`, `pre-push`, `ci`) or `human` where no mechanical check
exists today.

| Id             | Phase      | Title           | Gate               |
| -------------- | ---------- | --------------- | ------------------ |
| `story`        | pre-push   | Story           | `require-contract` |
| `contract`     | pre-push   | Contract        | `require-contract` |
| `build`        | pre-push   | Build / iterate | `pre-commit`       |
| `consolidate`  | pre-push   | Consolidate     | `pre-commit`       |
| `validate`     | pre-push   | Validate        | `human`            |
| `handoff`      | pre-push   | Handoff         | `require-contract` |
| `commit`       | pre-push   | Commit          | `pre-commit`       |
| `review`       | pre-push   | Review          | `push-review-gate` |
| `close-out`    | pre-push   | Close-out       | `task-close-gate`  |
| `gate-push`    | pre-push   | Gate push       | `pre-push`         |
| `push-pr`      | pre-push   | Push and PR     | `push-review-gate` |
| `merge`        | post-merge | Merge           | `ci`               |
| `deploy-check` | post-merge | Deploy check    | `human`            |

Consumers: `workflow.md` (one numbered entry per id, same order and titles, plus the Gates table), the handoff
template and the close checklist template (one progress line per `pre-push` id), and
`tests/arch/workflow-steps.spec.ts`. A step added to the json without an entry, a checkbox and a named gate row
fails the test.

**Handoff `## Workflow progress`** (first section of `.claude/templates/handoff.md`, copied into the closed
archive at close-out). One line per `pre-push` id: `- [ ] <id> — evidence:`; ticked is
`- [x] <id> — evidence: <commit sha / gate output line / date>`. Machine format (regex used by the hook):
`^- \[( |x)\] (\S+) — evidence:\s*(.*)$`. `push-pr` is ticked last (after the push), so it is the one line
allowed to be unticked in the archive; the post-merge ids are not listed.

**Hook behavior (`.claude/hooks/require-contract.py`, decisions 051, 054 and 057).** Commit-time state is read
from the index (`git diff --cached --name-status --no-renames -z`, `git show :path`) and push-time state from
the pushed commit's tree (`git show <sha>:path`), never from the working tree, so the order in which files were
edited before the git command cannot change the verdict. Step ids come from `.claude/workflow-steps.json` (the
pushed tree's copy at push time, the project root's at commit time); the progress line regex is
`^- \[( |x|X)\] (\S+) — evidence:\s*(.*)$`. **Task slug:** on a `feat/<slug>` branch it is `<slug>` and
`.claude/tasks/ACTIVE` is ignored (parallel branches never share it); on any other branch `ACTIVE` keeps its
meaning for commit checks (push checks only apply to `feat/*` destinations). Amendment 2026-10-06: the
close-out is the LAST commit before the push (only after the final review of the full diff, a user-run
`/code-review` included, and its fixes); to reopen after a later finding, `git revert <close-out sha>` brings
the folder back and removes the archive, then fix, re-review, close again (enforced by the stale review gate).

- `git commit`, in order:
  1. **Closing detection (task-close-gate).** For every `.claude/tasks/<slug>/` (any slug except `closed`)
     tracked in `HEAD` whose tracked files ALL appear as `D` in the staged diff, `.claude/tasks/closed/<slug>.md`
     must be staged as `A` (new file) and its staged content must have no `- [ ]` box, except the single
     `- [ ] push-pr — evidence:` progress line (the archive is committed before the push). `ACTIVE` is never
     consulted for this, so a close that already emptied it is still checked. The archive's `review` evidence
     must also not be stale (see "Stale review" below), checked against `HEAD` as the tip.
  2. **Contract.** The slug is the branch slug on `feat/*` (a branch whose `.claude/tasks/<slug>/` folder is
     gone from the working tree and whose `closed/<slug>.md` is in the index counts as closed, i.e. no active
     task) or, on other branches, `ACTIVE` read from the working tree. On a closing commit or with no active
     task every staged file must be under `.claude/` (a close does not need an active contract), except while
     a merge, rebase, cherry-pick or revert is in progress (`.git/MERGE_HEAD`, `rebase-merge/`,
     `rebase-apply/`, `CHERRY_PICK_HEAD` or `REVERT_HEAD`, resolved with `git rev-parse --git-path`), when a
     non-closing commit skips that docs-only rule (every other check stays). Otherwise
     `.claude/tasks/<slug>/story.md` must exist and `contract.md` must contain "Given".
  3. **Progress evidence.** For every staged `.claude/tasks/*/handoff.md` and `.claude/tasks/closed/*.md`
     (added or modified), any `- [x] <id> — evidence:` line with empty (or whitespace) evidence inside
     `## Workflow progress` blocks the commit and names the id. Ticks outside that section are ignored.
  4. **Decision record.** `nuxt.config.ts` / `eslint.config.mjs` staged without a file under
     `.claude/docs/decisions/` (rule 11).
  5. **After a recorded review every code change needs its test (decision 057 third amendment).** When the
     handoff (`.claude/tasks/<slug>/handoff.md`, else `closed/<slug>.md`) at `HEAD` has the `review` step ticked,
     a non-closing commit that stages any code path (see "Stale review" for the code paths; `tests/` and `e2e/`
     are not code) must also stage a file under `tests/` or `e2e/`, else exit 2 (`Rule 09 ... needs its test`).
     Exempt: merge, rebase, cherry-pick and revert commits and closing commits; nothing applies before the
     review is ticked, and a handoff that ticks the review in the same commit is not yet "recorded" (state is read
     from `HEAD`). The slug is the branch slug, or `ACTIVE` on non-feat branches.
- `git push` (push gate, `push_gate(branch, sha)`): runs once per destination branch that starts with `feat/`,
  with `<slug>` = branch name minus `feat/` and `ACTIVE` never consulted:
  - `<slug>/handoff.md` exists in the pushed commit's tree (`git show <sha>:path`): it must have a `## Review`
    section (prefix-match heading) with no `- [ ]` box that mentions `code-review` (decision 054, unchanged),
    and every `pre-push` id except `push-pr` must be a ticked line with valid evidence in
    `## Workflow progress`.
  - Otherwise `closed/<slug>.md` in that tree must exist, have no unchecked box (except the `push-pr`
    progress line), a `## Review` section mentioning `code-review` and the same fully ticked
    `## Workflow progress`. Neither file present blocks, naming both paths.
  - The step list is read from `workflow-steps.json` in the pushed tree (working-tree copy as fallback).
  - Messages name the file, the section and the offending step ids. All problems of one push are reported
    together (one problem: the plain message; several: `N problems blocking the push of <branch>:` plus one bullet each).
  - `--ci ... --base <ref>` reads the step list from `<ref>:.claude/workflow-steps.json` first (falling back to
    the pushed tree's copy when the base has none), so a PR cannot drop a step from its own gate.
- **Evidence validation (commit and push).** A ticked step needs non-empty evidence. For `commit`, `review` and
  `close-out` the evidence must also contain a 7-40 character hex token (not glued to other word characters)
  for which `git cat-file -e <token>^{commit}` succeeds in the repository being checked, and (decision 057
  amendment 2026-10-06) the commit must be tied to its step: an ancestor of the tip (`HEAD` at commit time, the
  pushed sha at push time) for all three, and for `review` additionally a commit that changed the CONTENT of the
  `## Review` section of `.claude/tasks/<slug>/handoff.md` or `.claude/tasks/closed/<slug>.md` versus its first
  parent (a root commit counts as changed if the section exists; a commit that only ticks progress, edits
  Pending or drops the section does not), i.e. the commit that recorded the review; if several shas are cited,
  any qualifying one passes. `close-out` cannot cite its own commit (a commit cannot name its sha), only an earlier one. Any other
  step is free text. `[X]` counts as ticked like `[x]` everywhere (progress regex
  `^- \[( |x|X)\] (\S+) — evidence:\s*(.*)$`). Messages name the step and why (`no evidence`, the sha
  requirement, the ancestry requirement or the review-commit requirement).
- **Stale review (push gate, and the closing commit with `HEAD` as the tip).** The commit cited as `review`
  evidence is the review point. The review is stale when the BRANCH'S OWN code changed after it. Code paths are
  everything outside `.claude/` plus `.claude/hooks/` and `.claude/workflow-steps.json` (the gate itself; a path
  such as `.claude/hooks-notes.md` is not code; `.githooks/` is outside `.claude/`, so it is code). Base ref:
  `--base` (CI), else `origin/main` if it resolves, else `main`. For the code paths changed by the branch at the
  review commit or at the tip (`git diff --name-only <base>...<rev>`), the hook compares the branch-only diffs
  `git diff --binary -U0 <base>...<review>` and `...<tip>` with `index` lines and hunk headers normalized away;
  equal means fresh. Because a three-dot diff is taken against the merge-base, a merge of `main` after the
  review that only brings main's code does not stale it, and neither does main editing another hunk of a file
  the branch changed; a merge commit that also needs a code edit by the branch, or any later commit changing
  branch code, does. A stale review blocks naming the review sha, the first differing path and the first later
  commit that touched it, and the command `/code-review high`, to be followed by re-recording the review result
  (a new commit that changes the `## Review` section) and the `review` evidence. If there is no base ref, or no
  merge-base with it, the older rule applies: any commit in `<review sha>..<tip>` (first-parent diff for merges)
  that touches a code path makes it stale. Limits: an out-of-date local `origin/main` makes a merge of newer
  main look like branch changes (fetch first), and auto-merged edits that change the branch's own hunk are
  seen as branch changes. Decision 057 third amendment: `tests/` and `e2e/` are not code paths, and a later code
  commit that also changes a file under `tests/` or `e2e/` is a fix with its test and does not stale the review (the
  walk lists the later commits that touch a changed code path and ignores those that also touch a test file; the
  first one without a test is named, with "a fix needs its test, else `/code-review high`"). When a `git diff`
  cannot be read the freshness check fails closed (the commit walk decides, two unreadable diffs are never
  "equal"). A review sha that is not an ancestor of the tip is rejected by the evidence rule
  above. Mechanically this is what keeps the close-out commit last (workflow step 9): code committed after the
  review, even after the close, blocks the push.
- **Unchecked scan.** Only real list items count: lines matching `^\s*(?:[-*+]|\d+[.)])\s+\[ \]` (a `-`, `*` or
  `+` bullet, or `1.` / `1)` numbering, then `[ ]`) outside fenced code blocks (lines starting with three
  backticks or tildes toggle a fence). Prose and fenced examples that mention `[ ]` do not block; a `## `
  heading inside a fenced block does not end a section. The exempt progress line stays `- [ ] push-pr —
evidence:`.
- **Finding proof (push gate, every caller, and the closing commit; decision 057 third amendment, search first).**
  Every list item of `## Review` (handoff or archive, outside fences) that starts with `finding` must match
  `- finding <id> — outcome: <fixed|queued|no_change_needed> — proof: <text>` (em dashes, outcome one word),
  read from the pushed tree (the index at the closing commit); a Review with no finding line must state
  `findings: none`. `fixed` has two forms. `strengthened <tests|e2e/file.spec.ts> › <test name>`: the test (a
  `describe`/`it`/`test` title, name optionally quoted) must exist in that file at the base ref (`--base`, else
  `origin/main`, else `main`; no base blocks) and in the file at the tip, and the file must differ between base and
  tip. `new <file> › <test name> — searched: <term>[, <term>...]`: the title must not exist in any `*.spec.ts`
  under `tests/` or `e2e/` at the base ref, must exist at the tip in the cited file, `searched:` needs at least one
  term, and the gate greps (case-insensitive substring) every describe/it/test title of every spec under `tests/`
  and `e2e/` at the tip for each term (titles are read from lines that start with `it`, `test` or `describe`,
  `.each` tables included, so fixture strings do not count); any OTHER title (the cited file and title excluded)
  blocks with `a test for this may already exist: strengthen it, or justify with — differs: <why a new test is
needed>` and the matches, unless the line carries a non-empty `— differs: <reason>`. `queued`: the proof must
  contain a slug that is a row of `.claude/backlog.md` at that tree, has a `.claude/tasks/<slug>/story.md`, or has
  `.claude/tasks/closed/<slug>.md`. `no_change_needed`: non-empty reason. Every bad finding is a bullet of the
  usual multi-problem output. Limits: titles are matched textually (no semantic duplicate detection), a test created
  on the same branch as the finding can only be `new` (the base does not have it), and the search only sees
  titles, not what a test asserts.

**Which refs the Claude hook gates (decision 057 amendment).** Claude's Bash tool call is parsed per
`git push [flags] [remote] [refspec...]` (`shlex`; flags taking a value are skipped: `-o`, `--push-option`,
`--receive-pack`, `--exec`, `--repo`): each refspec is `[+]src[:dst]`; `dst` may be `refs/heads/<b>` or `HEAD`
(resolved to the current branch); a destination not starting with `feat/` is not gated; the tip of `src`
(`git rev-parse --verify <src>^{commit}`) is what is checked, and a source that does not resolve blocks. No
refspec means the current branch; on a detached HEAD that blocks with a clear message (`--tags` alone is not
gated). `--delete`/`-d` and `:dst` refspecs are not gated. `--all`, `--mirror` and wildcard refspecs gate
every local `feat/*` branch. **Global git options** before the subcommand (`-C <dir>`, `-c k=v`, `--git-dir=...`,
`--work-tree`, `--no-pager`, `-p`, ...) do not hide `commit`/`push` from the hook, and `--no-verify`/`-n` stay
refused with them.

**One script, three callers (decision 057 amendment).** `require-contract.py` has four invocations, same checks,
same exit codes (0 pass, 2 block) and same messages: no argument = Claude PreToolUse hook (JSON on stdin,
`CLAUDE_PROJECT_DIR` is the repo); `--commit` = index checks (the commit half above), run by
`.githooks/pre-commit` BEFORE `pnpm gate`; `--pre-push` = reads git's pre-push stdin lines
`<local ref> <local sha> <remote ref> <remote sha>`, and for every remote ref `refs/heads/feat/<slug>` (all-zero
local sha = delete, skipped) runs the push gate on the LOCAL SHA's tree, run by `.githooks/pre-push` before
`exec pnpm gate:push`; `--ci <branch> <sha>` = the push gate for one branch + commit (branch may carry
`refs/heads/`; non-`feat/` branches pass), run by the `workflow-gate` job of `ci.yml`; `--ci <branch> <sha> --base
<ref>` additionally reads the step list from the base ref (the job passes `--base origin/<base_ref>` and runs the
BASE branch's copy of the script, fetched with `git show origin/$BASE_REF:.claude/hooks/require-contract.py`,
when that copy mentions both `--ci` and `--base` (two `grep -q -e` probes); otherwise it prints
`::notice::base branch has no --ci/--base gate yet (this PR introduces it), using the PR copy` and runs the PR's
copy, whose base is then resolved locally: `origin/main`). The three CLI modes use
the git repository of the current directory and ignore `CLAUDE_PROJECT_DIR`, so a git hook launched from a
Claude session in another worktree never reads that worktree.

Limits (rule 19): evidence is checked for presence and, for `commit`/`review`/`close-out`, for being a real
commit sha tied to its step (ancestry, and for `review` having changed the `## Review` section) — not for the
review actually having happened or covered the whole diff; the freshness check ignores `.claude/` process
files other than the gate itself (`.claude/hooks/`, `.claude/workflow-steps.json`), compares branch diffs
textually (an out-of-date `origin/main` or a main edit that overlaps the branch's hunk reads as a branch change,
so it errs towards stale) and cannot see a `core.hooksPath` set in an earlier command, a git config file or an
exported environment variable (it sees `-c`/`--config-env`, a chained `git config ... core.hooksPath` and
`GIT_CONFIG_KEY_<n>=core.hooksPath` in the same command); rewriting the `## Review` text after later code changes
and re-pointing the evidence resets freshness (queued in `workflow-integrity-hardening` item 8, mitigated by the
test requirement and the finding proof); `story` content and `validate` are not judged; the Claude hook only
sees git commands run through Claude's Bash tool, but the git hooks and the CI job run the same script for every
other client (`git push --no-verify` or a missing `core.hooksPath` skips the git hooks; CI is the backstop, and
only if `workflow-gate` is a required check). The `workflow-gate` job could not be executed locally; its first
real run is the first `feat/*` pull request after it lands. A single-quoted refspec with shell variables or
command substitution is parsed as text, not expanded.

**Post-merge deploy check (decision 042, relaxed by 057):** CI green on the PR only proves the code is correct
— it never proves `deploy.yml` actually reached Cloudflare (PR #2, 2026-09-18: CI green, deploy failed on
Cloudflare error 10215, unnoticed for 2 days because no step checked). After the user merges, the AI runs
`gh run list --branch main --limit 1 --workflow deploy.yml` and reports the result in chat. It is
non-blocking and not archived; a failed deploy opens a new task/commit and never reopens a closed task folder.

**Arch test `tests/arch/require-contract-hook.spec.ts`:** builds a throwaway git repo per case (temp dir,
`core.hooksPath` pointing at an empty dir, a copy of `workflow-steps.json`), stages or commits fixtures and runs
the real hook through `python3` with `CLAUDE_PROJECT_DIR` set to that repo, asserting exit code (0 or 2) and
that stderr names the problem. One `describe` per contract criterion (1, 2, 4, 5, 7, 8: close without archive,
archive checkboxes, 054 push gate, closed-archive push gate, evidence on ticks, fully ticked progress; 12-15:
branch slug / ACTIVE ignored, pushed-refspec gating, `--commit` / `--pre-push` / `--ci` CLI modes, sha-verified
evidence and `[X]` ticks; 17-22: stale review, merge/rebase/revert commits, `--ci --base`, global git options,
evidence tied to its step, fenced unchecked scan; 25-30: review evidence = a commit that changed the Review
section, merging main does not stale, gate files count as code, `core.hooksPath` refused, every list marker;
31-33: a later code commit with a test does not stale the review and a code commit without one is blocked at commit
time after a recorded review, finding proofs (`strengthened` / `new` after a real search / queued / no_change_needed),
and the third-round cases added next to their siblings: `core.hooksPath` via `git config`/`GIT_CONFIG_KEY_<n>`,
`-nm`/`-anm`, env prefixes with digits, freshness fails closed) plus a block that pins the pre-057 commit rules and the
non-`feat/` meaning of `ACTIVE`. Fixtures use `@SHA@` for a real commit sha of the throwaway repo (the seed
commit) and `@REVIEW@` for a commit that added a `## Review` section to the task's handoff and archive (what a
`review` sha must be). Never touches the real repo's git
state and has no test-only override of the hook under test (criterion 16, enforced by `workflow-steps.spec.ts`).

**Arch test `tests/arch/no-duplicate-test-titles.spec.ts`:** fails when a spec under `tests/` or `e2e/` repeats an
`it`/`test`/`describe` title inside the same describe scope (scope = nearest enclosing `describe`, found by
indentation, the specs are prettier-formatted; `.each` tables count by their title template). It is the arch half of
"search first, strengthen an existing test": a duplicate is merged into the existing test, not kept.

**Arch test `tests/arch/workflow-steps.spec.ts`:** keeps `workflow-steps.json`, `workflow.md`, the handoff and
close-checklist templates and the Gates table consistent (ids, order, titles, gates); checks the close
checklist has only pre-merge-provable items and the `## Review` / `## Workflow progress` sections; checks
close-out precedes gate-push/push and `deploy-check` is a post-merge, non-blocking step; checks decision 057
and this catalog exist; checks `.githooks/pre-commit`, `.githooks/pre-push` and `ci.yml` call `require-contract.py`
with the right mode (`--commit`, `--pre-push`, `--ci "$HEAD_REF" "$HEAD_SHA"`, before the pnpm gates and with
`fetch-depth: 0` for CI); checks `ci.yml` runs the base branch's copy with `--base`, probes both `--ci` and `--base` before using it (a test executes the extracted job script against fake base scripts) and prints the fallback notice;
checks `workflow.md`, rules 09/10, decision 057, the templates and this catalog put the close-out last and
document reopening via `git revert <close-out sha>`; checks `workflow.md`'s `## Review policy` (finding becomes a test, search first, test is the verification, two rounds, deliberate evasions queued, honest limit) and rule 09, decision 057 and both templates carry the finding formats; checks every `hard-rules.md` table row stays under 700
characters (detail lives in `rules/NN-*.md`); checks no arch spec references a test-only hook override.

**Arch test `tests/arch/audit-overrides.spec.ts`** (decisions 056, 058, 061; the CI `audit` job runs `pnpm audit
--audit-level=high`): parses `pnpm-workspace.yaml` and checks that every `overrides` entry has a selector with an
exclusive upper bound (`pkg@<range <patched`) and a caret value whose floor is at least that patched version, that a
decision quotes both the selector and the value, that `pnpm-lock.yaml` resolves nothing inside the vulnerable
range, that every `auditConfig.ignoreGhsas` entry is a well-formed GHSA id, and that each one sits in a decision
entry naming its package and a remove-when condition. An override or an ignore added without its decision, or a
lockfile regeneration that drops a transitive back into a vulnerable range, fails the test. It also guards the
`patchedDependencies` entry of decision 058 (`@nuxt/devtools@3.4.2` to `patches/@nuxt__devtools@3.4.2.patch`, which
switches devtools to the named `simpleGit` export of `simple-git` 4.x): `simple-git` resolves only at or above
`4.0.1`, each patch file exists under `patches/`, contains `simpleGit as Git` and targets the version locked in
`pnpm-lock.yaml` (a devtools bump fails with the instruction to remove the patch and the `simple-git` override), the
patch and the override come together, and a decision names each patch with a remove-when condition. Decision 061 added two
checks: the lockfile resolves `@modelcontextprotocol/server`, `vite` and `launch-editor` only at or above their patched
versions (so a removed override or a regenerated lockfile cannot bring the vulnerable range back), and every decision
that explains an override carries a remove-when condition.

**Test setup `tests/setup/clean-git-env.ts` (vitest `setupFiles`) and arch test `tests/arch/test-env-isolation.spec.ts`:**
git sets `GIT_DIR`, `GIT_INDEX_FILE`, `GIT_WORK_TREE` and friends for hooks, and in a linked worktree `GIT_DIR` is an
absolute path. Specs that build throwaway repos (`cwd: tmpdir`) then wrote into the real repository: stray `seed`,
`review` and `base` commits, `feat/demo`-style branches, and a `core.hooksPath` pointing at a temp dir (shared by all
worktrees, so every hook silently stopped running). The setup file exports `scrubGitEnv(env)` (returns the removed
names) and calls it on `process.env` when imported, before any spec runs. It removes the repository-redirecting
variables (`GIT_DIR`, `GIT_WORK_TREE`, `GIT_INDEX_FILE`, `GIT_OBJECT_DIRECTORY`, `GIT_ALTERNATE_OBJECT_DIRECTORIES`,
`GIT_NAMESPACE`, `GIT_PREFIX`, `GIT_COMMON_DIR`, `GIT_CONFIG_PARAMETERS`, `GIT_CONFIG_COUNT`, `GIT_CONFIG_KEY_<n>`,
`GIT_CONFIG_VALUE_<n>`) and the identity/date overrides (`GIT_AUTHOR_*`, `GIT_COMMITTER_*`: they do not redirect the
repository, but they beat the `git config user.*` the fixtures set, so a leaked value would make fixture commits
depend on the caller). `PATH`, `HOME`, `GIT_EXEC_PATH` and `GIT_CONFIG_GLOBAL` are kept. The spec unit-tests
`scrubGitEnv` with a fake environment holding every variable (and one with unrelated variables), checks that the real
`process.env` is clean, and asserts that `vitest.config.ts` registers the file in `setupFiles`, so removing the
registration fails the spec instead of silently turning the scrub off.

**Arch tests for rules 02, 13, 14 and 15 (decision 060).** Shared helper `tests/arch/support/repo-files.ts` lists the
tracked-plus-untracked-not-ignored files (`git ls-files --cached --others --exclude-standard`) and reads them as
text (binary files are skipped).

- `tests/arch/no-code-comments.spec.ts` (rule 14): tokenizes `.ts`/`.mts`/`.js`/`.mjs`/`.cjs`/`.vue`/`.css` under
  `app/`, `server/`, `shared/` and `nuxt.config.ts`, `eslint.config.mjs`, `vitest.config.ts`, `playwright.config.ts`
  (strings, template literals and regex literals are skipped, so `https://` is not a comment; a `/` after `)`, `]`,
  `}` or an identifier, including `list_of` / `a$in` / `item2`, is division; the opening `<script>`/`<style>` tag is
  parsed with quoted attribute values). Any `//`, `/* */` or `<!-- -->` fails, except
  `// #region <Static variables|Reactive variables|Methods|Component data|Lifecycle|State|Getters>` and
  `// #endregion` under `app/composables/` and `app/stores/`, and the exact first-line `// @ts-check` pragma of the
  four root config files. Limit: comments inside Vue template expressions are not scanned (queued in
  `workflow-integrity-hardening`). Further tests pin the scanner (false positives and misses), the marker rule and
  the pragma exemption.
- `tests/arch/no-lint-suppressions.spec.ts` (rule 15): `eslint-disable`, `eslint-enable`, `@ts-expect-error`,
  `@ts-ignore`, `@ts-nocheck` in any tracked file, `tests/` and `e2e/` included. Only markdown files under `.claude/`
  (documentation prose that quotes the directives) and the lockfile are skipped; the spec builds its samples from
  fragments so it matches nothing itself and no test file is exempt.
- `tests/arch/language.spec.ts` (rule 13): per line, flags a Catalan/Spanish letter, or at least two distinct words
  from a curated Catalan/Spanish stopword list (function words that are not English words nor locale codes), in every
  tracked text file outside `i18n/locales/`. An unaccented Catalan sentence is caught by its function words; one foreign
  word in an English line is not. The allowlist is per token (exact proper names or labels, masked only in the named
  files, each group with a reason; at most ten groups, asserted, and each token must still exist in its file); the spec
  itself is the one whole-file exception. A false positive is a token entry, not a weaker heuristic.
- `tests/arch/no-internal-resources.spec.ts` (rule 02): Atlassian cloud hosts, Jira ticket / Confluence / Slack message
  URLs, GitHub URLs of the company organization, company sub-domains other than `www`, company e-mail addresses and internal-looking
  hostnames in any tracked file. Each marker has a sample the spec proves it matches; `https://www.pdpaola.com`
  (public CV fact) must stay unmatched.
- `tests/arch/rules-enforced-by-tests.spec.ts`: rules 02, 13, 14, 15 name their spec in "How it's checked", the spec
  exists, and the rule's own `hard-rules.md` row names it (a spec named only in another rule's row does not count).
  The backlog row status is deliberately not asserted: it is transient bookkeeping, not part of the rule.
  A third test checks that every `decision NNN` cited in those four specs has a file under `.claude/docs/decisions/`
  (a stale citation fails).

## Environments and deploy

Decisions: 021 (environments), 022 (scans), 024 (GitHub environment, secrets, ruleset).

### Environments

| Environment    | How                                                                                      | Giphy secret                                         |
| -------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **local**      | `pnpm dev` + local `.env` (`NUXT_GIPHY_API_KEY`)                                         | `.env`, never committed                              |
| **preview**    | an ephemeral URL per PR: `pr-<n>-cv.<subdomain>.workers.dev` (alias) and `<version>-cv…` | inherits the secrets from the production Worker      |
| **production** | Worker `cv` at `danimorales.dev` (`workers_dev: false`)                                  | uploaded by `deploy.yml` from GitHub on every deploy |

There is no staging. Previews don't work until the Worker exists (first merge to `main`).

### Workflows (`.github/workflows/`)

| Workflow       | Trigger                                            | Jobs (= check name)                 | What it does                                                                                                                                                                                                              |
| -------------- | -------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ci.yml`       | `pull_request`, `push` to `main`                   | `gate`, `workflow-gate`             | `gate`: `pnpm gate` + `build` + e2e (chromium), uploads `playwright-report` on failure. `workflow-gate`: only on `feat/*` PRs, the base branch's copy of `require-contract.py --ci ... --base` (decision 057 amendments). |
| `security.yml` | `pull_request`, `push` to `main`, Monday 06:00 UTC | `gitleaks`, `audit`, `CodeQL`       | secrets across the whole history, `pnpm audit --audit-level=high`, CodeQL javascript-typescript.                                                                                                                          |
| `preview.yml`  | `pull_request`                                     | `preview`                           | `wrangler versions upload --preview-alias pr-<n>` and comments the URL on the PR. Skips if there are no secrets.                                                                                                          |
| `deploy.yml`   | `workflow_run` of `ci` finishing green on `main`   | `deploy` (environment `production`) | checkout of the exact `head_sha`, build, `wrangler deploy`, then a separate step uploads `NUXT_GIPHY_API_KEY`.                                                                                                            |

Dependabot (`.github/dependabot.yml`): npm (pnpm-lock) weekly with minor+patch grouped, GitHub Actions weekly grouped.

Audit configuration (decision 056, 2026-10-04): `pnpm-workspace.yaml` carries `overrides` (patched `brace-expansion`, `devalue`, `undici`; decision 058 adds more, including `simple-git@<4.0.1` with the `patchedDependencies` patch for `@nuxt/devtools@3.4.2`) and `auditConfig.ignoreGhsas` (`GHSA-86w9-cpqp-85rv` node-forge, `GHSA-vfj7-8cjw-p6xm` braces: no patched version on npm). The `audit` job still fails on any other high advisory; each ignore has a REMOVE-WHEN condition in the decision.

Action versions (verified 2026-09-14): `actions/checkout@v7`, `actions/setup-node@v7`, `pnpm/action-setup@v6` (reads `packageManager` from `package.json`), `actions/upload-artifact@v7`, `actions/github-script@v9`, `cloudflare/wrangler-action@v4`, `gitleaks/gitleaks-action@v3`, `github/codeql-action@v4`. Dependabot keeps them up to date.

Why `workflow_run` and not `push`: it only deploys the commit that has already passed the gate, without re-running it or duplicating its definition. Trade-off: the workflow has to already exist on `main` to trigger, and the deploy run doesn't show up on the PR (it shows up under Actions → deploy).

### pnpm 12 in CI

- `pnpm install --frozen-lockfile` always: CI never resolves new versions, it only installs the lockfile. Node comes from `.node-version` (24), not from `engines`.
- `minimumReleaseAge` (default 1440 min = 1 day) also applies to the lockfile: a version published less than a day ago makes the install fail, including in CI. One-off exceptions in `pnpm-workspace.yaml`'s `minimumReleaseAgeExclude` (currently: `wrangler`, `miniflare`), removed once no longer needed.
- `allowBuilds` (`pnpm-workspace.yaml`) is the list of deps allowed to run build scripts (`esbuild`, `unrs-resolver`, `workerd`). A new dep with a `postinstall` makes the install fail until it's added there; never `dangerouslyAllowAllBuilds`.

### Secrets

| Secret                  | Where it lives (GitHub)                 | Who creates it             | What for                                                                                                                                                                                            | Rotation                                                          |
| ----------------------- | --------------------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`  | `production` environment and repository | you (Cloudflare dashboard) | `deploy.yml` (env) and `preview.yml` (repo)                                                                                                                                                         | new token in Cloudflare → update both places → revoke the old one |
| `CLOUDFLARE_ACCOUNT_ID` | `production` environment and repository | you                        | same                                                                                                                                                                                                | doesn't rotate                                                    |
| `NUXT_GIPHY_API_KEY`    | `production` environment                | you (developers.giphy.com) | `deploy.yml` uploads it to the Worker in a step after `wrangler deploy` (uploading before the deploy makes Cloudflare reject it with error 10215 when the latest Worker version isn't deployed yet) | change it on GitHub → next deploy (or re-run deploy)              |

The two repository secrets (previews) can hold the same values as the environment ones. Never in chat, never in the repo (rule 01). The Worker is never touched by hand: if someone sets a secret in the dashboard, the next deploy overwrites it.

### Protection of `main` (ruleset)

Required checks, with the exact job name: `gate`, `gitleaks`, `audit`, `CodeQL` (source: GitHub Actions, app id 15368). Plus: PR required, no force push, no branch deletion, and a "code scanning" rule with CodeQL.

UI: Settings → Rules → Rulesets → New branch ruleset (target: default branch). Or, with `gh` authenticated as a repo admin:

```bash
gh api -X POST repos/danimo17/cv/rulesets --input ruleset.json
```

`ruleset.json`:

```json
{
  "name": "main",
  "target": "branch",
  "enforcement": "active",
  "conditions": { "ref_name": { "include": ["~DEFAULT_BRANCH"], "exclude": [] } },
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 0,
        "dismiss_stale_reviews_on_push": false,
        "require_code_owner_review": false,
        "require_last_push_approval": false,
        "required_review_thread_resolution": false,
        "allowed_merge_methods": ["squash", "merge"]
      }
    },
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": false,
        "do_not_enforce_on_create": true,
        "required_status_checks": [
          { "context": "gate", "integration_id": 15368 },
          { "context": "gitleaks", "integration_id": 15368 },
          { "context": "audit", "integration_id": 15368 },
          { "context": "CodeQL", "integration_id": 15368 }
        ]
      }
    },
    {
      "type": "code_scanning",
      "parameters": {
        "code_scanning_tools": [
          {
            "tool": "CodeQL",
            "security_alerts_threshold": "high_or_higher",
            "alerts_threshold": "errors"
          }
        ]
      }
    }
  ]
}
```

No `bypass_actors`: not even the admin can skip the gate. If that's ever needed, it's added from the UI.
