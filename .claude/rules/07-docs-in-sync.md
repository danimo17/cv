# 07 · Living documentation in the same commit

**What.** When a component, store, composable, util, token, CSS class, i18n key, script, gate or workflow is
created or changed, the corresponding file in `.claude/docs/catalog/` is updated **in the same change**, not
"later."

- Component → `docs/catalog/components.md` (block `### ComponentName` with ALL props, their possible values, and the CSS class each one activates: this is the component's usage standard)
- Store/composable/util → `docs/catalog/state.md` (block `### name`)
- Token/class/state → `docs/catalog/styles.md`
- Key area → `docs/catalog/i18n.md`
- Script/gate/hook/workflow → `docs/catalog/ai-workflow.md`
  **Why.** The catalog is the context that keeps coherence between sessions; if it lies it's worse than not having one.
  **Before developing** a new page or component, the catalog is read and what already exists is reused (decision 027).
  **How it's checked.** `tests/arch/docs-sync.spec.ts` (every `.vue`, store, composable and util must have its block).
