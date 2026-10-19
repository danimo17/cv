# 11 · Directives and decisions

**What.** If the user gives a clear directive ("base it on X", "look for Y", "add Z") and it can't be
fulfilled, or it's judged that it shouldn't be fulfilled, it is **never** silently replaced with something
else nor mentioned in passing in a plan. Work stops and a direct grill-me style question is asked: concrete
options + a recommendation.
A related case that is asked before the contract exists: a change to a component under `app/components/shared/`
(or used from more than one parent) asks for its scope, only here or everywhere, and the answer is written in the
contract's `## Shared component consumers` section (rule 20).
Every answer or decision is logged in `.claude/docs/decisions/NNN-<slug>.md` (context, decision, consequences) and
**is not asked again** if the situation is the same.
**Why.** The user read in a plan "LinkedIn blocks access; using the PDF instead" after having explicitly said
to use LinkedIn. A question was needed, not a substitution.
**How it's checked.** Human review. Before asking, read `.claude/docs/decisions/`.
