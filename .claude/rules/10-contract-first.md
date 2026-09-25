# 10 · Contract before code

**What.** No code change without `.claude/tasks/ACTIVE` pointing to `.claude/tasks/<slug>/` with `story.md`
and `contract.md` (Given/When/Then criteria, each with the test that will cover it). If scope shifts, the
contract is updated at that moment.

`ACTIVE` can be genuinely empty between tasks — that's a valid idle state, not an error. While empty, a commit
is only allowed if every staged file is under `.claude/` (pure process/docs bookkeeping); anything touching
`app/`, `server/` or `shared/` still needs an active contract, exactly as when `ACTIVE` is set.

Closing a task (decision 051, "task-close-gate") is itself gated: the commit that deletes the whole
`.claude/tasks/<slug>/` tree must, in the same commit, stage `.claude/tasks/closed/<slug>.md` — a copy of
`.claude/templates/close-checklist.md` with every box checked (contract criteria verified, real `gate:push`
output, PR merged, deploy verified per decision 042, decisions/catalog/standards promoted, no open rule-11
conflict, backlog row set to `done`). That file is never deleted afterward — a permanent, append-only record
of how the task actually closed.

**Why.** Without a contract there's no definition of "done" and validation is just an opinion. Without a
gated close, "I promoted everything before deleting the task" is just as unverifiable a claim as "I tested it"
was before rule 09 existed — same fix, same reasoning.

**How it's checked.** `.claude/hooks/require-contract.sh` blocks commits if there's no contract with criteria,
if an empty-`ACTIVE` commit touches code outside `.claude/`, or if a task-closing commit lacks a fully-checked
archive.
