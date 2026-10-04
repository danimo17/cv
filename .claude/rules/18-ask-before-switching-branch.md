# 18 · Ask before switching branch/story mid-task

**What.** When a new request arrives while the AI is mid-task on a branch, it never silently branches away,
switches context, or starts implementing something else. It stops and asks: continue this on the current
branch/story, or start a new one? If the answer is "new one" (or the AI hasn't asked yet and isn't sure), the
default action is to **write the story** (`.claude/tasks/<slug>/story.md`, status "queued") and leave it as a
documented pending item — not to branch, not to set `ACTIVE`, not to touch code — until the current work is
finished or the user explicitly says to switch now.

**Why.** This is the exact mechanism behind the session that motivated rule 18 in the first place: mid-task on
`feat/ux-redesign`, a later request ("add spacing tokens") was treated as license to branch straight off `main`
and start fresh, silently orphaning 13 done commits. It happened again in the same session, smaller scale:
mid-review of `feat/spacing-tokens`'s rebase, a "regions" request turned into a brand-new branch
(`feat/composable-store-regions`) with implementation already done, asked about only after the fact.
Branching reflexively is the disease; `workflow-integrity-hardening`'s unmerged-branch-check (item 1) is a
mechanical net for when this rule is forgotten anyway — this rule is the actual fix, upstream of needing a net.

**How to apply.** A new request mid-task gets a direct question with two options: "same branch, or queue it as
a new story for after this?" Only proceed on the current branch, or only start a new one, once the user
answers. Small/trivial requests are not exempt — size is not the criterion, timing is.

**How it's checked.** Human review; the user is the enforcement mechanism today, same honest limitation as
rule 12 (see the mechanization sweep in `workflow-integrity-hardening`).
