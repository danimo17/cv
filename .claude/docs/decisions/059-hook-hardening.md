# 059 · Hook hardening: payload cwd, orphaned-branch check, delegation, structural config, shared components

**Context.** `workflow-integrity-hardening` (backlog) and the `require-contract-decision-check` row listed five
process gaps still on "human review" (rules 06, 11, 12, 16), and the worktree finding of 2026-10-13 showed the
Claude hook evaluating the wrong checkout: it read `CLAUDE_PROJECT_DIR`, which in a session started on `main`
points at the primary checkout, so a commit made inside a `git worktree` was judged against `main` while the git
pre-commit hook (which runs in the worktree) was the only real gate. Rule 19 asks for a technical check, not a
promise.

While this task was built, the worktree pollution incident of 2026-10-19 showed the same class of problem on the
test side: the pre-commit hook runs `pnpm test` with git's hook variables (`GIT_DIR`, `GIT_INDEX_FILE`, ...) in the
environment, so the arch specs that create scratch repositories in temp dirs wrote into the real repository of the
linked worktree (stray commits, test branches, `core.bare`, `core.hooksPath` and `user.*` rewritten in the shared
`.git/config`). The isolation fix of `arch-rule-gates` (commit `f5a2bfd`) is carried by this task too, because the
commit that adds it also changes `vitest.config.ts`, which the widened rule 11 check below treats as structural.

**Decision.** `.claude/hooks/require-contract.py` (tests in `tests/arch/require-contract-hook.spec.ts`) gets:

1. **Repo from the payload `cwd`.** `claude_hook` resolves the repository with `git -C <cwd> rev-parse
--show-toplevel`; when `cwd` is missing or not inside a repository it falls back to `CLAUDE_PROJECT_DIR`
   (same resolution), then to `.`.
2. **Unmerged-branch check on branch creation (Claude hook only).** `git checkout -b|-B feat/...`, `git switch
-c|-C|--create|--force-create feat/...` and `git branch feat/...` (no listing/delete/rename flags) are blocked
   when another `feat/*` branch, local (`refs/heads/feat/*`) or remote (`refs/remotes/origin/feat/*`), is not
   merged into `origin/main` (or `main`). Each branch is listed once (slug, where it exists, last commit subject).
   Not counted: the branch being created, and any slug that is a `doing` row of `.claude/backlog.md`, read from
   the working tree and from the candidate branch's own tip. Escape hatch: the command-prefix variable
   `ALLOW_UNMERGED_FEAT=1` (`ALLOW_UNMERGED_FEAT=1 git checkout -b feat/x`), valid for that command only.
3. **Rule 12 delegation.** On a `feat/<slug>` branch a commit staging more than 1 file or more than 15 changed
   lines (added plus deleted, `git diff --cached --numstat`) under `app/`, `server/` or `shared/` needs at least
   one data row in the `## Subagents` table of the staged `handoff.md` (a row after the header and separator
   with a non-empty first cell; fenced examples do not count).
4. **Rule 11 structural config.** The existing `nuxt.config.ts`/`eslint.config.mjs` check widens to
   `playwright.config.ts`, `vitest.config.ts`, `wrangler.jsonc`, `pnpm-workspace.yaml`, `.github/workflows/*`,
   `.githooks/*`, `.claude/hooks/*`, `.claude/hard-rules.md`, `.claude/rules/*.md` and `package.json` when the
   staged change differs in `dependencies`, `devDependencies`, `peerDependencies`, `optionalDependencies`,
   `pnpm`, `overrides`, `packageManager` or `engines` (compared as parsed JSON, so `version` and `scripts` text
   edits are not structural; invalid JSON counts as structural). A staged, non-deleted file under
   `.claude/docs/decisions/` satisfies it.
5. **Rule 16 shared components.** A staged path under `app/components/shared/` (add, modify or delete) needs the
   task's `contract.md` (staged copy) to have a non-empty `## Shared component consumers` section: the grep of
   consumers and the decision (only here / everywhere).

6. **Test isolation (vitest).** `vitest.config.ts` loads `tests/setup/clean-git-env.ts` as a setup file, which
   deletes `GIT_DIR`, `GIT_WORK_TREE`, `GIT_INDEX_FILE`, `GIT_OBJECT_DIRECTORY`, `GIT_COMMON_DIR` and `GIT_PREFIX`
   from `process.env` before any spec runs; `tests/arch/test-env-isolation.spec.ts` fails if one leaks through.
   Specs that spawn git in a scratch repo therefore never see the hook's variables.

Items 3-5 run in the commit checks (Claude hook and `--commit`). Merge, rebase, cherry-pick and revert commits
are exempt from 3 and 5 and from the widened part of 4 (what they bring in was checked when it was committed on
its own branch); the original `nuxt.config.ts`/`eslint.config.mjs` check keeps applying during them. A closing
commit and a branch whose task is closed skip 3 and 5.

**Deviation from the original story text.** `workflow-integrity-hardening` asked to block creating a branch while
any unmerged `feat/*` branch exists. On 2026-10-13 the user decided to run tasks in parallel in separate
worktrees, each with its own unmerged `feat/*` branch, so that rule would block the very workflow in use. The
check therefore tolerates a branch whose slug is a `doing` row of the backlog (a task legitimately running in
parallel) and blocks only the rest, the orphans.

**Consequences.**

- The hooks guard `.claude/hooks/*` and the rules with a decision from now on: the commit that edits them stages
  a decision (this one, for this task).
- Limits, stated honestly: the branch check sees only a branch creation typed in a Claude Bash command (`git
worktree add -b feat/x`, an editor or a terminal are not covered); a `doing` row left behind for an abandoned
  branch hides it until the row is changed; "unmerged" is by ancestry, so a squash-merged branch is reported
  until it is deleted; the `doing` rows are matched on any cell after the slug being exactly `doing`; the
  subagent row proves a row exists, not that the work was really delegated; the 1 file / 15 lines threshold is
  from the story and is revisited here if it blocks legitimate small multi-file edits.
- `ALLOW_UNMERGED_FEAT=1` is the only escape hatch added; the commit checks have none (rule 09: never
  `--no-verify`).

## Amendment 2026-10-19 — high-effort `/code-review` round (9 findings)

A read-only reviewer agent ran a `high` effort `/code-review` over the branch diff at the user's request. The normal-use
findings are applied here; each one has a test in `tests/arch/require-contract-hook.spec.ts` (and
`tests/arch/workflow-steps.spec.ts` for the docs). Changes to `require-contract.py`:

1. **Target repository.** The Claude hook no longer reads the payload `cwd` only: each `git` call is judged in the
   directory it acts on, resolved as the `cd <dir>` commands that precede it in the command, then its `-C <dir>`
   options (relative paths resolve against the previous directory; a directory that does not exist is ignored), on
   top of the payload `cwd`, else `CLAUDE_PROJECT_DIR`, else `.`. The new-branch check uses the same resolution.
2. **Only this project.** A repository is gated only when it is the project (`CLAUDE_PROJECT_DIR`, else the repository
   of the hook script) or a worktree sharing its git common dir (`git rev-parse --git-common-dir`, real paths). A call
   in any other repository is ignored: the hook exits 0 and does not even refuse `--no-verify` there. A directory
   that does not exist, or the fallbacks (`CLAUDE_PROJECT_DIR`, `.`), are trusted as the project.
3. **Rule 11 needs a decision that mentions the file.** A structural change passes when a decision record under
   `.claude/docs/decisions/` that contains the file name or its directory prefix (`.claude/hooks/`, `.github/workflows/`,
   `.claude/rules/`, ...) is staged in the commit (not deleted) or was added or modified earlier on the branch (diff
   `origin/main...HEAD`, else `main...HEAD`). An unrelated decision no longer satisfies it, and a follow-up commit no
   longer needs a new decision when the branch already carries one that names the file. Every changed structural
   file must be covered, and the message lists the uncovered ones.
4. **Rule 12 counting.** Renames are detected (`git diff --cached -M`) and count as one file. Paths under
   `app/assets/css/`, `app/data/` and `i18n/locales/` do not count as code (stylesheets and content tables are not the
   logic that rule 12 asks to delegate); a real code file needs its `## Subagents` row as before.
5. **Quoted and heredoc text is not a command.** Before matching, heredoc bodies (when the delimiter line exists) and
   the contents of single and double quoted strings are masked; commit and push calls and the branch-creating
   calls are matched on the masked text only, and their options and arguments are read from the real text.
6. **One read per run.** `commit_checks` reads the current branch and the merge/rebase markers once and passes the
   values down.
7. **Helpers.** One backlog-table parser (slug cells may be written in backticks) serves the `doing` rows and the
   `queued` proofs; one reader for the working-tree `ACTIVE` and backlog; `use_cwd_repo` reuses `repo_containing`;
   the legacy structural files are the head of `STRUCTURAL_FILES`; `package_json_keys` always returns a dict.
8. **Fail closed.** The orphaned-branch check blocks when no base branch resolves or `git for-each-ref` fails; the
   rule 12 size check blocks when `git diff --cached --numstat` fails; the rule 11 `package.json` comparison blocks
   when the file cannot be read from `HEAD` or the index. Each message names the failure; `ALLOW_UNMERGED_FEAT=1`
   still skips the branch check.

Documentation: the catalog row of the Claude hook covers rules 06/18, 10, 11, 12 and 16, the test isolation of
`tests/setup/clean-git-env.ts` is documented in the catalog and `docs/standards/testing.md`, and the contract
template carries a real `## Shared component consumers` section.

Deliberate-evasion findings are queued, not built (`workflow-integrity-hardening` item 11): branch creation through
`checkout --orphan`, `switch --orphan`, `worktree add -b`, `branch -c`, wrappers (`sh -c`, `xargs`), the unaudited
`ALLOW_UNMERGED_FEAT=1` prefix, and the placeholder-row weakness of the rule 12 table (any non-empty first cell
passes).

Limits: the cd/`-C` resolution ignores subshells, pipelines and shell variables (`cd $DIR`); the masking is a
lexical scan (an unterminated heredoc is left unmasked, a nested quote inside `$(...)` inside a double quote can
leave a stretch of text unmasked); a decision satisfies rule 11 by mentioning the file name anywhere in its text.
