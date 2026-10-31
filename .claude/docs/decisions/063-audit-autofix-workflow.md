# 063 · Weekly audit auto-fix workflow (`audit-fix.yml`)

**Context.** The required `audit` check (`pnpm audit --audit-level=high`, decision 056) went red three times in two
weeks on `main`'s own lockfile (decisions 058, 061 and the next one), each time blocking every open PR until an
`audit-overrides-N` task added overrides by hand. On 2026-10-29 the owner decided to automate the overrides instead of
loosening the gate (no ignore, no `continue-on-error`, no non-required check). Scope: task `audit-autofix`, contract
criteria 1-7.

**What `pnpm audit --fix` really does in this repo (pnpm 11.17.0, verified 2026-10-29 in a throwaway copy of the
repo, never in the worktree).**

- A bare `pnpm audit --fix` fails with `ERR_PNPM_INVALID_FIX_OPTION` ("Invalid value for --fix: true"); the method must
  be explicit, `--fix=override` (the documented default) or `--fix=update`. The workflow uses `--fix=override`.
- `--fix=override` writes the new `overrides` into `pnpm-workspace.yaml`, not `package.json`, and leaves
  `pnpm-lock.yaml` untouched until `pnpm install` runs. Against the advisories of that day it added 26 overrides for
  19 high advisories and exited 0.
- It does not respect `minimumReleaseAge`: it also appends one `minimumReleaseAgeExclude` entry per patched version
  (12 entries, exact versions such as `zod@4.6.6`), which switches the one-day supply-chain wait off for them, and it
  adds an entry even for a version that does not exist on npm.
- Its selectors are not always `<patched`: it emits `<=last-vulnerable` ranges (`seroval@<=1.6.7` to `^1.6.8`) and
  several overlapping ranges for the same package.
- The overrides are not guaranteed to be installable. Two real failures that day: it proposed `deepmerge@>=4.2.0 <=4.3.1`
  to `^4.3.2` although 4.3.2 is not published (`ERR_PNPM_NO_MATCHING_VERSION` on install), and the `nuxt` override moved
  `@nuxt/devtools` past the version patched by decision 058 (`ERR_PNPM_UNUSED_PATCH`). `--fix=update` fails the same
  way on the patch and also writes the `minimumReleaseAgeExclude` entries.
- In CI `pnpm install` defaults to `--frozen-lockfile`, which rejects the changed overrides
  (`ERR_PNPM_LOCKFILE_CONFIG_MISMATCH`); the second install needs `--no-frozen-lockfile`.

So the first real run is expected to take the "cannot clear" path below, not the pull request path; that is the
design working, not a defect.

**Decision.** `.github/workflows/audit-fix.yml`, Monday 07:30 UTC (after Dependabot and the 06:00 scan of
`security.yml`) plus `workflow_dispatch`, from the default branch only:

1. Require the repository secret `AUDIT_FIX_TOKEN`; install with `pnpm install --frozen-lockfile --ignore-scripts`
   (no dependency code runs while the token is on the runner).
2. Run `pnpm audit --audit-level=high`; clean means exit with nothing to do. An open pull request from a
   `chore/audit-fix-` branch also means exit, so advisories never pile up as duplicate pull requests.
3. Run `pnpm audit --fix=override`, then restore `minimumReleaseAgeExclude` to its previous content (an awk filter),
   so the age wait still applies to every version the fix pulls in.
4. `pnpm install --no-frozen-lockfile --ignore-scripts`, then `pnpm audit --audit-level=high` again.
5. Only if all of that passed and `git status` shows changes: branch `chore/audit-fix-<YYYYMMDD>`, a generated
   decision file `.claude/docs/decisions/audit-fix-<YYYYMMDD>.md` (suffixed with the run number when the branch name is taken, so an
   earlier merged file is never overwritten; each override in backticks plus a REMOVE-WHEN
   condition), commit `fix(deps): auto-fix audit advisories` as `danimo17`, push and `gh pr create` against the default
   branch. The body lists the overrides and tells the owner to review and merge.
6. If the fix, the install or the second audit fails: open or update ONE issue titled
   `audit: advisories left after auto-fix` with the logs and the remaining advisories, and fail the job. Nothing is
   written: no ignore, no `auditConfig`, no `--ignore`. Whether to ignore an advisory stays a rule-11 question.

**Why a dedicated token (`AUDIT_FIX_TOKEN`).** Pushes and pull requests made with the default `GITHUB_TOKEN` do not
trigger other workflows, so the required checks (`gate`, `gitleaks`, `audit`, `CodeQL`) would never run on the
generated pull request and it could never be merged. A fine-grained token of the owner makes the branch, the commit
push and the pull request come from `danimo17`, so CI runs normally. The default `GITHUB_TOKEN` is kept read-only
(`contents: read`) plus `issues: write` for the issue only, and the token is never printed: checkout uses
`persist-credentials: false` and `gh auth setup-git` hands the token to git through the credential helper.

**Why no auto-merge.** Rule 06: merging is always the owner's. The workflow never runs `gh pr merge`, never enables
merge-when-ready on the pull request and never pushes to the default branch; the owner reads the overrides and merges.
The arch spec asserts all of it.

**Why no ignores.** An ignore hides an open advisory (rule 15's spirit, decision 056). When `--fix` cannot clear the
audit the owner is told through the issue and decides.

**The one manual step (owner, once, never pasted in chat or in the repo, rule 01).** Create a fine-grained personal
access token for `danimo17` with resource owner `danimo17`, repository access limited to `danimo17/cv`, and these
repository permissions only: Contents read and write, Pull requests read and write (Metadata read is implied). Add it
as the repository secret `AUDIT_FIX_TOKEN` (Settings, Secrets and variables, Actions). Set a short expiry and rotate
it by creating a new token and replacing the secret. No other permission is needed: the issue uses the default token.

**Safe dry run.** The workflow cannot run locally. After adding the secret, trigger `workflow_dispatch` once
(Actions, audit-fix, Run workflow on the default branch) and check the outcome: either a pull request from a
`chore/audit-fix-<date>` branch with the required checks running, or the issue `audit: advisories left after
auto-fix`; or a green run saying nothing needs fixing. Nothing can be merged or ignored by the run itself.

**Consequences.**

- `tests/arch/audit-fix-workflow.spec.ts` asserts the schedule, the permissions, the SHA pin of third-party actions,
  the token wiring, the step order, the absence of merge/ignore/force/`--no-verify`, and runs the two awk filters
  against fixtures. `pnpm/action-setup` is not a first-party `actions/*` action, so it is pinned to the commit of tag
  `v6` (`0977fd99725f1db4007ccb2928dbb4e90d06cc86`, resolved 2026-10-29); `ci.yml` and `security.yml` keep the tag.
- `tests/arch/audit-overrides.spec.ts` accepts `<=last-vulnerable` selectors when the caret floor is strictly above
  the last vulnerable version, because `pnpm audit --fix` emits them, and the generated decision file satisfies its
  "every override is explained, with a remove-when condition" checks without a human writing it.
- `pnpm install --ignore-scripts` is used so the `prepare` script does not set `core.hooksPath` on the runner (the
  commit is made without the local git hooks; the pull request runs the whole gate in CI instead).
- Risk: an override can bump a framework (`nuxt`) by a minor; the required checks on the pull request are the net, and
  the owner reviews it.
- Risk: the token is a long-lived credential of the owner limited to this repository; rotate it on expiry or if the
  workflow file is ever changed by someone else.

REMOVE-WHEN: the workflow and the token are removed when the owner stops wanting automated override pull requests, or
when Dependabot security updates open pull requests that clear these advisories on their own in this repository (then
the `audit` check no longer needs a bot of ours). Each generated decision file carries its own REMOVE-WHEN for its
overrides.
