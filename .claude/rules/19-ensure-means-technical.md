# 19 · "Ensure" means a technical check, not a promise

**What.** When the user says "make sure", "ensure", or gives an equivalent instruction (in any language) that
something always happens a certain way, the answer is never "I'll remember to" or "I'll try to." It's a
concrete, technically verifiable mechanism — a hook, a gate, a test, a file the next step is forced to read —
that holds regardless of whether the AI remembers, is paying attention, or is even the one carrying out the
next step. If no such mechanism is feasible for a given case, that limitation is stated honestly (see rule 17's
"How it's checked" pattern), not papered over with a restated promise.

**Why.** Directly requested after this AI skipped workflow step 8 (review-checklist + `/code-review` before a
push) despite the step being written down, then offered to "make sure" it wouldn't happen again in words. The
user's point: a workflow step that only exists as text the AI is supposed to remember to follow is exactly as
reliable as any other hard rule enforced only by "human review" (see rule 12's honest self-assessment,
`workflow-integrity-hardening`'s mechanization sweep) — worth building a check for, not re-promising.

**How to apply.** Before answering "yes, I'll make sure of that", ask: what file, hook, or gate would
mechanically fail if this weren't true? Build that. If the honest answer is "nothing feasible", say so instead
of promising compliance a memory lapse could quietly break.

**How it's checked.** Human review of whether a new "ensure" request actually got a mechanism — this rule
itself is subject to itself; if it drifts into "human review" enforcement long-term without follow-through,
that's a live rule-19 failure worth naming.
