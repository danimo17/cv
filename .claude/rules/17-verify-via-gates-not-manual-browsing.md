# 17 · Verify via tests/gates, not manual browsing — unless asked

**What.** To confirm a change works, default to the project's own test suite: `pnpm gate` (unit/arch) and
`pnpm gate:push`'s e2e run. Do not open a local dev server / localhost preview in the browser to manually
click through and check something works. The one exception: the user explicitly asks to see it verified that
way, or explicitly accepts it when the AI asks first — permission is per-instance, not a standing grant.

**Why.** The user's call: tests and gates are the actual evidence ("I tested it" is not evidence, the gate
is — rule 09); a manual browser poke-around is not more trustworthy and burns time/tokens the automated suite
already covers. If the suite doesn't cover something, that's a gap in the suite to close (a new test), not a
reason to fall back on manual clicking as the default.

**How to apply.** Before starting a dev server or using the Browser pane to check a UI change, stop and ask:
"want me to verify this manually in the browser, or is the existing/updated test suite enough?" Proceed only
on an explicit yes for that specific instance. Writing a new test (unit, arch, or e2e) to cover a gap does not
need this permission — that's normal development, not manual verification.

**How it's checked.** Human review; consider a Claude Code hook on `preview_start`/browser-tool use once one
is feasible (tracked in `workflow-integrity-hardening`, mechanization sweep).
