# 037 · CustomImage ready for srcset, not generating sizes yet

**Decision (D4 of the post-launch handoff).** `CustomImage` (post-038 name) accepts optional `srcset` and
`sizes` props that, if passed, are reflected as-is onto the `<img>`. Without these props, it behaves as now
(a single `src`). No additional photo sizes are generated for now: YAGNI until Lighthouse asks for it.
**Consequences.** Small, additive change to the primitive; no real use of `srcset`/`sizes` for now. Component
catalog (`docs/catalog/components.md`) documents the new props.
