# 10 · Contract before code

**What.** No code change without `.claude/tasks/ACTIVE` pointing to `.claude/tasks/<slug>/` with `story.md`
and `contract.md` (Given/When/Then criteria, each with the test that will cover it). If scope shifts, the
contract is updated at that moment.
**Why.** Without a contract there's no definition of "done" and validation is just an opinion.
**How it's checked.** `.claude/hooks/require-contract.sh` blocks commits if there's no contract with criteria.
