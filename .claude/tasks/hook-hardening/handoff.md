# Handoff: hook-hardening

_Updated: 2026-10-19. REAL state of the `feat/hook-hardening` branch (based on `cbba912`; origin/main has moved by one commit since, merge at PR time)._

## Workflow progress

- [x] story — evidence: 535061c story.md (re-authored from the test identity)
- [x] contract — evidence: 535061c contract.md, criteria 1-6
- [x] build — evidence: edb3b66 hook, specs, decision 059, docs, backlog, vitest GIT\_\* isolation; review-round fixes aee7c5e, afbba9e, f2e2e49
- [x] consolidate — evidence: pre-commit pnpm gate of f2e2e49: 26 files, 636 tests passed, lint 0 errors
- [x] validate — evidence: 2026-10-19 full tests/arch/require-contract-hook.spec.ts green inside the gate (17 new tests red against the old hook first; review round: 15 tests observed red against the hook before the fix, in two batches of 5 and 10; the rename, comment and unterminated-quote cases were added after those red runs and were not run red on their own)
- [x] handoff — evidence: 2026-10-19 this file
- [x] commit — evidence: f2e2e49 last code and docs commit of the review round (535061c story and contract, edb3b66 build commit)
- [x] review — evidence: 0484507 (the commit that recorded the `## Review` section: high-effort `/code-review` of 2026-10-19 by a read-only reviewer agent, one line per finding with its proof; no code change after it)
- [x] close-out — evidence: 60b1b9d (close-workflow-redesign, the previous close made through this gate); this task's own close commit is the last commit of the branch and cannot cite itself, its archive is `.claude/tasks/closed/hook-hardening.md`
- [x] gate-push — evidence: pnpm gate:push on 0484507 (2026-10-19, real log read, EXIT=0): Test Files 26 passed (26), Tests 636 passed (636), nuxt build "Build complete!", e2e 5 passed (12.5s)
- [ ] push-pr — evidence:

## Done (verified)

- Criterion 1: `claude_hook` resolves the repo from the payload `cwd` (`git -C <cwd> rev-parse --show-toplevel`), then `CLAUDE_PROJECT_DIR`, then `.`. Tests: "hook resolves the repo from the payload cwd" plus a real `git worktree` case and the fallbacks. Review round: each git call is judged in the repository of its own `cd <dir>` / `git -C <dir>` target (else the payload cwd), and only the project repository or a worktree sharing its git common dir is gated (an unrelated repository exits 0).
- Criterion 2: branch creation (`checkout -b/-B`, `switch -c/-C/--create`, `branch`) of `feat/*` is blocked by orphaned unmerged local or remote `feat/*` branches; a slug that is a `doing` row (working-tree backlog or the branch's own tip, slug cells in backticks included) is tolerated; `ALLOW_UNMERGED_FEAT=1` prefix is the escape hatch. Test: "new feat branch is blocked by orphaned unmerged branches, not by parallel doing tasks" plus variants. Review round: it fails closed (no base branch or a failing `git for-each-ref` blocks), uses the same target-repository resolution, and heredoc bodies, quoted strings and comments are no longer taken for a branch creation.
- Criterion 3: rule 12 delegation check (more than 1 file or 15 changed lines under app/ server/ shared/, staged handoff `## Subagents` needs a data row). Test: "multi-file code commits need a subagent row in the handoff" plus variants. Review round: a rename counts as one file, `app/assets/css/`, `app/data/` and `i18n/locales/` do not count as code, a failing `git diff --cached --numstat` blocks.
- Criterion 4: rule 11 widened to the structural config list, `package.json` compared as parsed JSON on the dependency keys. Test: "structural config changes need a decision record" plus variants. Review round: the decision must mention the changed file name or its directory and may be staged now or added earlier on the branch (an unrelated decision no longer satisfies it); a `package.json` that cannot be read blocks. Siblings strengthened: "a change to the gate itself is code too" and "staging nuxt.config.ts or eslint.config.mjs without a decision file blocks".
- Criterion 5: shared component consumers section. Test: "shared component changes need a consumers section in the contract" plus variants.
- Criterion 6: decision 059 (with the 2026-10-19 amendment), catalog `ai-workflow.md` sections "Hook hardening (decision 059)" and "Test isolation", "How it's checked" of rules 06, 11, 12 and 16, contract template (`## Shared component consumers` is a real section now), `docs/standards/testing.md`. Tests: "decision 059 and the hardening rules are documented" and "the code-review round of decision 059 is documented in the rules, catalog, standards and templates" in `tests/arch/workflow-steps.spec.ts`.
- Helpers deduplicated in the hook: one backlog-table parser, one working-tree reader, `use_cwd_repo` reuses `repo_containing`, one `package_json_keys` shape; the branch and the merge markers are read once per commit check.
- Carried from `arch-rule-gates` (`f5a2bfd`): `tests/setup/clean-git-env.ts`, `tests/arch/test-env-isolation.spec.ts` and the `setupFiles` entry in `vitest.config.ts` (worktree pollution incident of 2026-10-19), documented in decision 059, the catalog and `docs/standards/testing.md`.
- Backlog: `hook-hardening` row added as `doing`; `require-contract-decision-check` set to `doing` (covered by this task).

## In progress / not done

- Close-out is the last commit of the branch (archive `.claude/tasks/closed/hook-hardening.md`, task folder removed); push-pr is not done (the push needs the user's explicit permission, decision 031).
- Limits (decision 059): the branch check sees only branch creation typed in a Claude Bash command in a recognised form (`git worktree add -b`, `checkout --orphan`, `switch --orphan`, `branch -c`, wrappers such as `sh -c` or `xargs`, a terminal and an editor are not covered; queued as `workflow-integrity-hardening` item 9); a `doing` row left behind hides an abandoned branch; unmerged is by ancestry, so a squash-merged branch is reported until deleted; the cd/`-C` resolution ignores subshells, pipelines and shell variables; the quote/heredoc masking is a lexical scan.
- The live Claude hook in a session started on another checkout still runs the old logic until the session restarts; the git hooks in `.githooks/` are the real gate.
- Merge conflicts with sibling tasks are likely in `.claude/backlog.md`, the rules, `ai-workflow.md`, `workflow-integrity-hardening/story.md` and `tests/arch/workflow-steps.spec.ts`; the `vitest.config.ts` isolation change is identical to `f5a2bfd`.

## Subagents (rule 12)

| Subagent                                 | What it did                                                                               | Result                                                        |
| ---------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| hook-hardening (own worktree)            | hook changes, specs (red then green), decision 059, catalog, rules, backlog, handoff      | criteria 1-6 green in the gate                                |
| code-review reviewer (read-only agent)   | `/code-review` at high effort over the branch diff, at the user's request, 2026-10-19     | 9 findings plus an evasion appendix, recorded in `## Review`  |
| hook-hardening review-fix (own worktree) | applied the findings tests first (red then green), docs, queue item, review and close-out | commits aee7c5e, afbba9e, f2e2e49; review recorded in 0484507 |

## Validation (actual output of the last gate)

```
pnpm gate (pre-commit of f2e2e49) → prettier ok, eslint 0 errors (1 pre-existing warning in CustomInput.vue), nuxt typecheck ok, Test Files 26 passed (26), Tests 636 passed (636)
pnpm gate:push on 0484507 (EXIT=0) → same gate: Test Files 26 passed (26), Tests 636 passed (636); nuxt build "Build complete!"; playwright 5 passed (12.5s)
```

Not covered: the end-to-end behavior of the live Claude PreToolUse hook (the specs run it as a subprocess with the same stdin payload); the e2e suite covers none of the hook.

## Review (workflow step `review`, rule 09)

Review checklist (`.claude/templates/review-checklist.md`) run over the full branch diff, items that do not apply to a hook, spec and docs diff marked n/a:

- [x] Secrets (01): no key in the diff; n/a beyond that
- [x] Company (02): no company code or resources; sources declared none in the contract
- [x] Giphy boundary (03): n/a, untouched
- [x] PII (04): no phone or address in the diff
- [x] i18n (05): n/a, no user-facing strings
- [x] Branch (06): work is on `feat/hook-hardening`, nothing pushed
- [x] Catalog (07): the catalog rows for the hook, hook hardening and test isolation were updated in the same change (f2e2e49)
- [x] CSS (08): n/a, no component
- [x] Gates (09): `pnpm gate` green on every commit (output in Validation); `pnpm gate:push` run before the push
- [x] Contract (10): criteria 1-6 each have a named test; the review round adds tests per finding
- [x] Decisions (11): decision 059 amendment 2026-10-19 records every change; the structural commits stage or carry a decision that mentions the files
- [x] Primitives (026, 038): n/a, no template
- [x] Living docs (027): the catalog was consulted before changing anything
- [x] Subagents (12): the Subagents table states who did what
- [x] Accessibility: n/a
- [x] UI pattern consistency (16): n/a, no UI; the contract template gained the real consumers section the hook checks

`/code-review` result: high effort, 2026-10-19, round 1, run by a read-only reviewer agent at the user's request, 9 findings (the numbering below follows the request; its item 10, evasion and fail-open, is recorded as F10a-F10d). Every finding is a line below with its outcome and proof; the tests are in `tests/arch/require-contract-hook.spec.ts` unless the proof names another file.

- finding F1 — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › git -C and cd directories select the repository the command acts on — searched: git -C and cd directories
- finding F1b — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › branch creation is checked in the repository selected by the payload cwd, -C and cd — searched: selected by the payload cwd
- finding F2 — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › a cwd inside an unrelated repository is not this project and the hook allows the command — searched: unrelated repository
- finding F3 — outcome: fixed — proof: strengthened tests/arch/require-contract-hook.spec.ts › a change to the gate itself is code too
- finding F3b — outcome: fixed — proof: strengthened tests/arch/require-contract-hook.spec.ts › staging nuxt.config.ts or eslint.config.mjs without a decision file blocks
- finding F3c — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › only a decision that mentions the changed file or its directory satisfies rule 11 — searched: mentions the changed file
- finding F3d — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › a decision added earlier on the branch satisfies rule 11 for later commits, one from the base does not — searched: added earlier on the branch
- finding F4 — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › a rename counts as one file, and css, i18n and data paths are not code — searched: rename counts
- finding F5 — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › heredoc bodies and quoted text are never taken for a git command — searched: never taken for a git command
- finding F5b — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › a heredoc or quoted text that mentions branch creation is not a branch creation — searched: mentions branch creation
- finding F6 — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › a commit check reads the branch and each merge marker once — searched: each merge marker once
- finding F7 — outcome: fixed — proof: strengthened tests/arch/require-contract-hook.spec.ts › queued: a backlog slug, an open task folder or a closed archive passes
- finding F7b — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › a doing row whose slug is written in backticks still marks a parallel task — searched: written in backticks
- finding F8 — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › every branch-creating form of checkout, switch and branch is recognised — searched: every branch-creating form
- finding F9 — outcome: fixed — proof: new tests/arch/workflow-steps.spec.ts › the code-review round of decision 059 is documented in the rules, catalog, standards and templates — searched: code-review round
- finding F10a — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › the branch scan blocks when git cannot list the feat branches or no base branch exists — searched: cannot list the feat branches
- finding F10b — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › rule 12 blocks when the staged diff cannot be read — searched: staged diff cannot be read
- finding F10c — outcome: fixed — proof: new tests/arch/require-contract-hook.spec.ts › rule 11 blocks when package.json cannot be read from the index or HEAD — searched: cannot be read from the index
- finding F10d — outcome: queued — proof: workflow-integrity-hardening item 9: branch creation through `checkout --orphan`, `switch --orphan`, `worktree add -b`, `branch -c`, wrappers (`sh -c`, `xargs`), the unaudited `ALLOW_UNMERGED_FEAT=1` prefix and the placeholder-row weakness of the rule 12 table; deliberate evasions, low severity

## Pending on the user

| #   | What                                                                             | Blocks  | Status  |
| --- | -------------------------------------------------------------------------------- | ------- | ------- |
| 1   | `/code-review high` on the branch diff: done by a reviewer agent, recorded above | review  | done    |
| 2   | Decide push and PR after review, close-out and `pnpm gate:push`                  | push-pr | pending |

## Decisions made in this task

- → `.claude/docs/decisions/059-hook-hardening.md` (including the 2026-10-19 amendment)
