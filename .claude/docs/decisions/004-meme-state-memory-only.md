# 004 · The chosen meme does NOT survive a reload

**Decision.** The meme state lives only in Pinia (memory). It survives navigation via the router; a reload restores the original photo. This is deliberate: it demonstrates client state.
**Consequences.** No persistence in the `hero` store. Do not propose localStorage for this again.
