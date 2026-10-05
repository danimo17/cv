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

| Hook                                                                                  | Runs                                                                                                                                                                                                 | Blocks                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.githooks/pre-commit`                                                                | `require-contract.py --commit`, then `pnpm gate`                                                                                                                                                     | the commit (any client: Claude, an editor, a terminal)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `.githooks/pre-push`                                                                  | `require-contract.py --pre-push` (reads git's stdin lines, gates the pushed SHA), then `exec pnpm gate:push`                                                                                         | the push (any client)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `.claude/hooks/require-contract.sh` (PreToolUse Bash, Claude) → `require-contract.py` | same script, no argument (JSON on stdin): looks for real `git commit`/`git push` calls in the command                                                                                                | `--no-verify`/`-n` (rule 09); `git commit` (also `require-contract.py --commit`, the pre-commit git hook): a commit that stages the deletion of every tracked file of any `.claude/tasks/<slug>/` folder (any slug but `closed`, whatever `ACTIVE` holds) without a staged, new `.claude/tasks/closed/<slug>.md`, or with that archive holding an unchecked box other than the `push-pr` progress line (rule 10, task-close-gate, decisions 051 and 057); otherwise, with no active task (a non-`feat/` branch whose `ACTIVE` is empty, a `feat/<slug>` branch whose task is already archived, or a closing commit) any staged file outside `.claude/` (rule 10); otherwise no `story.md` or no `contract.md` with "Given" for the task slug (rule 10; the slug is the `feat/<slug>` branch name, `ACTIVE` only on other branches, decision 057 amendment); a staged `handoff.md` or `closed/*.md` that ticks a `## Workflow progress` step with empty evidence, or a `commit`/`review`/`close-out` step whose evidence has no 7-40 hex sha resolving to a commit (rule 09); staging `nuxt.config.ts` or `eslint.config.mjs` without also staging a file under `.claude/docs/decisions/` (rule 11, decision 041); `git push` (also `--pre-push` and `--ci`): every destination `feat/<slug>` branch, using the tip of the pushed source ref (not the checked-out branch): review evidence and every `pre-push` step before `push-pr` ticked with valid evidence, read from that commit's tree (`<slug>/handoff.md` if it exists there, else `closed/<slug>.md`, neither → block) (rule 09, push-review-gate, decisions 054 and 057) |
| `ci.yml` job `workflow-gate` (GitHub Actions)                                         | `python3 .claude/hooks/require-contract.py --ci "$HEAD_REF" "$HEAD_SHA"` on `pull_request` events whose head branch starts with `feat/` (`fetch-depth: 0`; skipped for other PRs such as Dependabot) | the PR merge, if the job is a required check; always visible on the PR (cannot be run locally, untested in Actions)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |

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
meaning for commit checks (push checks only apply to `feat/*` destinations).

- `git commit`, in order:
  1. **Closing detection (task-close-gate).** For every `.claude/tasks/<slug>/` (any slug except `closed`)
     tracked in `HEAD` whose tracked files ALL appear as `D` in the staged diff, `.claude/tasks/closed/<slug>.md`
     must be staged as `A` (new file) and its staged content must have no `- [ ]` box, except the single
     `- [ ] push-pr — evidence:` progress line (the archive is committed before the push). `ACTIVE` is never
     consulted for this, so a close that already emptied it is still checked.
  2. **Contract.** The slug is the branch slug on `feat/*` (a branch whose `.claude/tasks/<slug>/` folder is
     gone from the working tree and whose `closed/<slug>.md` is in the index counts as closed, i.e. no active
     task) or, on other branches, `ACTIVE` read from the working tree. On a closing commit or with no active
     task every staged file must be under `.claude/` (a close does not need an active contract). Otherwise
     `.claude/tasks/<slug>/story.md` must exist and `contract.md` must contain "Given".
  3. **Progress evidence.** For every staged `.claude/tasks/*/handoff.md` and `.claude/tasks/closed/*.md`
     (added or modified), any `- [x] <id> — evidence:` line with empty (or whitespace) evidence inside
     `## Workflow progress` blocks the commit and names the id. Ticks outside that section are ignored.
  4. **Decision record.** `nuxt.config.ts` / `eslint.config.mjs` staged without a file under
     `.claude/docs/decisions/` (rule 11).
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
- **Evidence validation (commit and push).** A ticked step needs non-empty evidence. For `commit`, `review` and
  `close-out` the evidence must also contain a 7-40 character hex token (not glued to other word characters)
  for which `git cat-file -e <token>^{commit}` succeeds in the repository being checked; any other step is
  free text. `[X]` counts as ticked like `[x]` everywhere (progress regex `^- \[( |x|X)\] (\S+) — evidence:\s*(.*)$`).
  Messages name the step and why (`no evidence`, or the sha requirement).

**Which refs the Claude hook gates (decision 057 amendment).** Claude's Bash tool call is parsed per
`git push [flags] [remote] [refspec...]` (`shlex`; flags taking a value are skipped: `-o`, `--push-option`,
`--receive-pack`, `--exec`, `--repo`): each refspec is `[+]src[:dst]`; `dst` may be `refs/heads/<b>` or `HEAD`
(resolved to the current branch); a destination not starting with `feat/` is not gated; the tip of `src`
(`git rev-parse --verify <src>^{commit}`) is what is checked, and a source that does not resolve blocks. No
refspec means the current branch; on a detached HEAD that blocks with a clear message (`--tags` alone is not
gated). `--delete`/`-d` and `:dst` refspecs are not gated. `--all`, `--mirror` and wildcard refspecs gate
every local `feat/*` branch.

**One script, three callers (decision 057 amendment).** `require-contract.py` has four invocations, same checks,
same exit codes (0 pass, 2 block) and same messages: no argument = Claude PreToolUse hook (JSON on stdin,
`CLAUDE_PROJECT_DIR` is the repo); `--commit` = index checks (the commit half above), run by
`.githooks/pre-commit` BEFORE `pnpm gate`; `--pre-push` = reads git's pre-push stdin lines
`<local ref> <local sha> <remote ref> <remote sha>`, and for every remote ref `refs/heads/feat/<slug>` (all-zero
local sha = delete, skipped) runs the push gate on the LOCAL SHA's tree, run by `.githooks/pre-push` before
`exec pnpm gate:push`; `--ci <branch> <sha>` = the push gate for one branch + commit (branch may carry
`refs/heads/`; non-`feat/` branches pass), run by the `workflow-gate` job of `ci.yml`. The three CLI modes use
the git repository of the current directory and ignore `CLAUDE_PROJECT_DIR`, so a git hook launched from a
Claude session in another worktree never reads that worktree.

Limits (rule 19): evidence is checked for presence and, for `commit`/`review`/`close-out`, for being a real
commit sha — not for being the right one; `story` content and `validate` are not judged; the Claude hook only
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
evidence and `[X]` ticks) plus a block that pins the pre-057 commit rules and the non-`feat/` meaning of
`ACTIVE`. Fixtures use `@SHA@` for a real commit sha of the throwaway repo. Never touches the real repo's git
state and has no test-only override of the hook under test (criterion 16, enforced by `workflow-steps.spec.ts`).

**Arch test `tests/arch/workflow-steps.spec.ts`:** keeps `workflow-steps.json`, `workflow.md`, the handoff and
close-checklist templates and the Gates table consistent (ids, order, titles, gates); checks the close
checklist has only pre-merge-provable items and the `## Review` / `## Workflow progress` sections; checks
close-out precedes gate-push/push and `deploy-check` is a post-merge, non-blocking step; checks decision 057
and this catalog exist; checks `.githooks/pre-commit`, `.githooks/pre-push` and `ci.yml` call `require-contract.py`
with the right mode (`--commit`, `--pre-push`, `--ci "$HEAD_REF" "$HEAD_SHA"`, before the pnpm gates and with
`fetch-depth: 0` for CI); checks no arch spec references a test-only hook override.

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

| Workflow       | Trigger                                            | Jobs (= check name)                 | What it does                                                                                                                                                                        |
| -------------- | -------------------------------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ci.yml`       | `pull_request`, `push` to `main`                   | `gate`, `workflow-gate`             | `gate`: `pnpm gate` + `build` + e2e (chromium), uploads `playwright-report` on failure. `workflow-gate`: only on `feat/*` PRs, `require-contract.py --ci` (decision 057 amendment). |
| `security.yml` | `pull_request`, `push` to `main`, Monday 06:00 UTC | `gitleaks`, `audit`, `CodeQL`       | secrets across the whole history, `pnpm audit --audit-level=high`, CodeQL javascript-typescript.                                                                                    |
| `preview.yml`  | `pull_request`                                     | `preview`                           | `wrangler versions upload --preview-alias pr-<n>` and comments the URL on the PR. Skips if there are no secrets.                                                                    |
| `deploy.yml`   | `workflow_run` of `ci` finishing green on `main`   | `deploy` (environment `production`) | checkout of the exact `head_sha`, build, `wrangler deploy`, then a separate step uploads `NUXT_GIPHY_API_KEY`.                                                                      |

Dependabot (`.github/dependabot.yml`): npm (pnpm-lock) weekly with minor+patch grouped, GitHub Actions weekly grouped.

Audit configuration (decision 056, 2026-10-04): `pnpm-workspace.yaml` carries `overrides` (patched `brace-expansion`, `devalue`, `undici`) and `auditConfig.ignoreGhsas` (`GHSA-86w9-cpqp-85rv` node-forge, `GHSA-vfj7-8cjw-p6xm` braces: no patched version on npm). The `audit` job still fails on any other high advisory; each ignore has a REMOVE-WHEN condition in the decision.

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
