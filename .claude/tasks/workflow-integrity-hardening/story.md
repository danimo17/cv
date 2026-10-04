# Story: workflow-integrity-hardening

**Status: queued, NOT started.** Do not set `.claude/tasks/ACTIVE` or branch for this until both
`feat/ux-redesign` and `feat/spacing-tokens` are merged (item 1 below, once it's a real rule — don't stack a
third open branch while two are in flight). This file exists so the gaps below survive until then; do not
delete or shrink it without the user's say-so.

**As** the user, **I want** the AI workflow to mechanically catch the gaps below **for** so that nothing
built, decided, or left mid-flight is ever silently lost or left inconsistent again.

Rule 16 (UI/UX pattern consistency, `.claude/rules/16-ui-pattern-consistency.md`) was already written directly
into the project on 2026-09-25 — not queued here, it's live. Same for rule 17 (verify via gates, not manual
browsing, `.claude/rules/17-verify-via-gates-not-manual-browsing.md`) and rule 18 (ask before switching
branch/story mid-task, `.claude/rules/18-ask-before-switching-branch.md`) — both also live. Rule numbers below
start at 19.

## Origin (2026-09-25 session, branch `feat/spacing-tokens`/`feat/ux-redesign`)

Found in one session, all real, all already happened:

1. `feat/spacing-tokens` was branched straight from `main`, silently orphaning `feat/ux-redesign`
   (13 commits, a 17-criteria contract, both phases done) — nobody checked for other unmerged `feat/*`
   branches before starting fresh. Discovered only because the user asked "where did the button/timeline work
   go?".
2. `e2e/meme-flow.spec.ts` kept clicking `[data-testid="meme-search-submit"]` long after `meme-search-copy`
   (ux-redesign Phase 2) removed that button for debounced auto-search — rule 07 synced the catalog but
   nothing forced syncing the e2e suite. `gate:push` caught it, but only because it was run — a stale
   `data-testid` reference is a class of bug that's mechanically detectable.
3. Criterion 10's "continuous timeline line" fix was applied to `ExperienceItem`'s `--detailed` variant /
   `experience-section__list` only. `EducationSection.vue` reuses the exact same `ExperienceItem` component
   (twice) with `--compact`, and nobody asked "does this apply everywhere this component is used?" — the fix
   sat half-applied until the user pointed it out directly.
4. The main thread (this AI) kept doing multi-file investigation-and-fix work directly instead of dispatching
   it to a subagent, repeatedly, despite rule 12 already being a hard rule. The rule's "trivial changes"
   exception is subjective enough that it kept getting stretched to cover things it shouldn't.

## Scope (four sub-fixes, each independent, can land as separate commits under one contract)

1. **Unmerged-branch check before starting new work.** Before `git checkout -b feat/*` / `git switch -c
feat/*` / `git branch feat/*`, run `git branch --no-merged main`. Any hit besides the branch being created
   is unfinished work — block (extend `.claude/hooks/require-contract.py`, same PreToolUse-on-Bash hook
   already used for rules 09/10/11) and surface the list to the user (branch name + last commit subject) with
   a direct question: resume it, merge it first, or explicitly proceed anyway. An explicit "proceed anyway"
   needs a documented escape hatch (e.g. an env var the AI sets only after the user's explicit go-ahead in
   chat, mirroring how `--no-verify` is a hard no but this is a softer, overridable rule) — never a silent
   bypass. New rule 19.

2. **Synchronized change — no orphaned references.** When an artifact's public surface changes (removed/
   renamed prop, class, `data-testid`, i18n key, store action, API route), the same change updates every place
   that references it — not just the catalog (rule 07 already covers that), but existing tests too (unit
   **and** e2e). Concretely:
   - New rule 20 (or fold into 07 — decide when writing the contract) stating this explicitly.
   - `.claude/rules/12-orchestration.md`'s subagent-brief guidance gets a mandatory line: every build
     assignment that removes or renames something must include "grep the whole repo (`app/`, `tests/`,
     `e2e/`, `.claude/docs/`) for every reference to what you're changing, and update them in this same
     change."
   - A new automated guard, `tests/arch/no-orphan-testids.spec.ts`: every `data-testid` referenced in
     `e2e/**/*.spec.ts` (via `getByTestId(...)` or `[data-testid="..."]` locators) must exist as a literal
     `data-testid="..."` somewhere in `app/**/*.vue`. This is the one slice of "orphaned reference" that's
     mechanically checkable with zero ambiguity — it would have caught both the `locale-ca` and
     `meme-search-submit` breakages the moment they happened, at `pnpm gate` time, not at `gate:push` or later.
   - `templates/review-checklist.md` gets a new line for this.

3. **Reusable-component change scope check.** When the user asks to change a shared/reusable component's
   look or behavior (anything under `app/components/shared/`, or any component used from more than one
   parent — check call sites via grep before assuming), the AI must ask explicitly: "only this one place, or
   everywhere this component is used?" before writing the contract — never assume single-site scope for a
   multi-consumer component. This is a rule-11-shaped directive-clarification requirement, not a new
   mechanism: add it to `.claude/rules/11-directives.md` (or a new rule referencing 11) and to `workflow.md`'s
   Story step ("before writing the story, grep for every consumer of the component named").

4. **Mechanical rule-12 delegation check.** Extend `require-contract.py`'s existing commit-time check
   (same file, same pattern as the `DECISION_WORTHY` config check) so that: if the staged diff touches
   `app/`, `server/`, or `shared/` files beyond a small objective threshold (e.g. more than 1 file, or more
   than ~15 changed lines total in the commit) AND `handoff.md`'s `## Subagents (rule 12)` table has no rows
   beyond its header for this task, block the commit with a reminder of rule 12. Escape hatch: a change under
   the threshold is allowed through without a subagent row (matches rule 12's own "trivial changes" exception,
   made objective instead of left to judgment). This directly targets gap #4 above — a hook, not a promise.

5. **Mechanize every hard rule currently enforced only by "human review".** Origin: the user asked directly
   "how do you ensure hard rules are always followed?" — honest answer given in-session: rules backed by a
   git hook/CI/arch-test hold regardless of what the AI remembers; rules backed by "human review" only hold as
   well as the AI's in-context compliance, which this same session showed slipping (rule 12, three times,
   before the user caught it). The user's response: mechanize as many as realistically possible, don't leave
   it at "I'll try to remember." Per rule, as of 2026-09-25:

   | Rule                      | Today                                                                                                                                | Mechanizable?                                                                                                                                                                                                                                                                                                      |
   | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
   | 02 no company code        | human review only                                                                                                                    | partial — a grep for known past-employer/internal-tool names as a backlog-priority `tests/arch/no-company-references.spec.ts`; can't replace judgment on prose that merely _describes_ past work legitimately                                                                                                      |
   | 06 branch discipline      | push-to-`main` blocked by global hook; staying on the right `feat/<slug>` branch is not                                              | yes — extend `require-contract.py` (or a new PreToolUse-on-Edit/Write hook) to check `git branch --show-current` matches `feat/<ACTIVE slug>` before allowing edits under `app/`/`server/`/`shared/`                                                                                                               |
   | 11 decisions logged       | partial (`DECISION_WORTHY` config-file check already exists)                                                                         | extend that same check: a commit touching `.claude/hard-rules.md` or `.claude/rules/*.md` also requires a decision file staged (a rule change is architecturally significant); the "did the AI silently substitute a directive" half stays human-only — inherently about the AI's internal choice, no file to grep |
   | 12 orchestration          | human review only                                                                                                                    | yes — item 4 above                                                                                                                                                                                                                                                                                                 |
   | 13 English only           | human review only (already flagged "consider" in `rules/13`)                                                                         | yes, heuristically — promote the already-suggested `tests/arch/language.spec.ts` from "consider" to build: flag `ç`/`ñ`/inverted punctuation/common ca-es stopwords outside `i18n/locales/*.json`; won't be 100% precise, still catches the common case                                                            |
   | 14 no code comments       | human review only (already a named backlog item)                                                                                     | yes — promote `arch-no-comments-no-suppressions` (already in `.claude/backlog.md`) from `todo` to done as part of this task                                                                                                                                                                                        |
   | 15 lint suppressions      | `pnpm gate` catches real lint errors; the `eslint-disable`/`@ts-expect-error`/`@ts-ignore` grep is the same named backlog item as 14 | yes — same test as above, one pass covers both                                                                                                                                                                                                                                                                     |
   | 16 UI pattern consistency | human review only                                                                                                                    | no realistic general check — visual/design judgment; stays human review, documented as a deliberate, permanent exception, not an oversight                                                                                                                                                                         |

   Net result: rules 02 and 16 stay honestly human-only (say so, don't fake a check); everything else gets a
   real hook or arch test. Update each rule's `.claude/rules/NN-*.md` "How it's checked" line to match once
   built — don't leave stale rows claiming "human review" once a test exists.

## Out of scope

- Actually building the CSS architecture change (`css-tailwind-first`, separate story/task).
- Any change to how `.claude/tasks/ACTIVE` itself works (still a single-slug pointer; the fix here is
  detecting _other_ unmerged branches, not redesigning ACTIVE into a multi-task registry — a file-based
  registry would have the same per-branch-invisibility flaw that caused gap #1 in the first place; `git
branch --no-merged main` is already a complete, always-accurate, cross-branch source of truth and needs no
  new file).

## External dependencies

None — pure `.claude/` process, hook (Python, already a dependency), and one new Vitest arch test.
