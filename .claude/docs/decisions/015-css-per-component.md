# 015 · One CSS file per component with semantic states

**Decision.** Semantic tokens in `tokens.css` (`primary, secondary, neutral, success, info, warning, danger` + `surface, text, border`, light and dark). Each component has `assets/css/components/<kebab>.css` with BEM-lite and `@apply`. Only its own classes in the template. See rule 08 and `docs/standards/styling.md`.
