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
**How it's checked.** Human review; the handoff lists which subagents did what.
