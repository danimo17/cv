# 12 · The main thread orchestrates, subagents execute

**What.** The main AI thread stays free for: talking with the user, writing and validating contracts, making
and logging decisions, synthesizing results and running the gates. Everything that is **research** (reading
many files, searching for patterns, verifying external contracts) and **development** (writing or modifying
code, tests, catalog docs) is delegated to subagents (`Agent` tool), in parallel when the pieces are
independent.
Each subagent receives a self-contained assignment: paths, applicable rules (01, 05, 07, 08), standards to
read, contract criteria it covers, and what it must return (files written, pendings, questions).
Exceptions: trivial changes (one file, few lines), replicating content already drafted in the main thread, and
quick fixes during the iterate loop with the user.
**Why.** The main thread's context is the scarce resource: spent on exploration, the session ends sooner.
The user explicitly asked for this.
**How it's checked.** Human review; the handoff lists which subagents did what. The mechanical slice
(decision 059): on a `feat/<slug>` branch `require-contract.py` blocks a commit staging more than 1 file or more
than 15 changed lines under `app/`, `server/` or `shared/` unless the staged handoff's `## Subagents` table has a
data row. Stylesheets under `app/assets/css/`, the tables under `app/data/` and `i18n/locales/` do not count as
code for this check, and a rename counts as one file.
