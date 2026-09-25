# 051 · task-close-gate checks "is this a closing commit" before the disk-based contract check

**Context.** `task-close-gate` (rule 10 extension) needed to allow a commit that deletes
`.claude/tasks/<slug>/` entirely, once a fully-checked `.claude/tasks/closed/<slug>.md` archive is staged
alongside it. The original spec assumed this new check would run only after the existing disk-based
`contract.md`-must-exist check passed. In practice, a realistic closing commit does `git rm -r
.claude/tasks/<slug>/` before `git commit` — which deletes `contract.md` from disk immediately, before the
hook ever runs. Under the original ordering, the pre-existing check would always fail first with the generic
"no active contract" message, and the new close-gate check would never fire.

**Decision.** For a non-empty `ACTIVE` slug, `require-contract.py` first determines whether this commit is a
"closing commit" (every path currently tracked under `.claude/tasks/<slug>/` is staged for deletion). If so,
it goes straight to the archive/checklist validation, skipping the now-moot disk-based `contract.md` check
entirely. If not, behavior is unchanged from before this task.

**Consequences.** The two checks are mutually exclusive by construction (a commit is either closing the active
task or it isn't) rather than sequential — slightly different from the contract's literal wording but
equivalent in effect, and the only ordering that actually works given `git rm` semantics. Found and flagged by
the implementing subagent per rule 11 rather than silently deviating.
