# 10 · Contract before code

**What.** No code change without `.claude/tasks/<slug>/` with `story.md` and `contract.md` (Given/When/Then
criteria, each with the test that will cover it). On a `feat/<slug>` branch the slug is the branch name and
`.claude/tasks/ACTIVE` is neither required nor consulted (decision 057 amendment: parallel branches never share
it). If scope shifts, the contract is updated at that moment.

With no active task, a commit is only allowed if every staged file is under `.claude/` (pure process/docs
bookkeeping); anything touching `app/`, `server/` or `shared/` still needs a contract. "No active task" means,
on a `feat/<slug>` branch, that the task is already closed there (archive committed, folder gone); on any
other branch, that `ACTIVE` is empty (there `ACTIVE` keeps its old meaning and an empty one is a valid idle
state).

Closing a task (decisions 051 and 057, "task-close-gate") is itself gated and happens **on the feature
branch, before the single push**, so the PR the user merges carries the feature and its own closing. The
commit that deletes the whole `.claude/tasks/<slug>/` tree (any task folder, detected from the commit's own
staged deletions, never from `ACTIVE`) must, in the same commit, stage
`.claude/tasks/closed/<slug>.md` — a copy of `.claude/templates/close-checklist.md` with every box checked
(contract criteria verified, real `gate:push` output, `/code-review` evidence, decisions/catalog/standards
promoted, no open rule-11 conflict, backlog row set to `done`) plus the pasted `## Review` and
`## Workflow progress` blocks. Only items provable before merge are required: PR merge and deploy are not
archived (the post-merge deploy check is reported in chat). That file is never deleted afterward — a permanent,
append-only record of how the task actually closed.

**Why.** Without a contract there's no definition of "done" and validation is just an opinion. Without a
gated close, "I promoted everything before deleting the task" is just as unverifiable a claim as "I tested it"
was before rule 09 existed — same fix, same reasoning. Requiring merge/deploy facts in the archive forced a
second close-only PR per task, and keying detection on `ACTIVE` meant the check could skip itself
(decision 057).

**How it's checked.** `.claude/hooks/require-contract.sh` (Claude) and `.githooks/pre-commit`
(`require-contract.py --commit`, any git client) block commits if there's no story or contract with criteria
for the branch's slug, if a commit with no active task touches code outside `.claude/`, or if a commit deleting
any task folder lacks a fully-checked archive.
