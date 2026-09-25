# 044 · Header active nav link is raised, not sunken

**Context.** `docs/standards/styling.md` documents active nav as inset (`shadow-neu-inset-sm`, owned by
`custom-link.css`'s default `--active` class) and states a primitive's look changes in the primitive's CSS,
never a consumer's. Criterion 1 of `ux-redesign` (header restyle, no brand text, active-link style no longer
the pressed-pill look) explicitly wants a non-sunken header treatment. The `header-nav` subagent implemented
this via `CustomLink`'s existing `activeClass` prop, pointing `AppHeader` at a new `.app-header__link--active`
class (raised `shadow-neu-sm` chip) instead of editing `custom-link.css` globally, and flagged the standards
conflict per rule 11 rather than silently resolving it.

**Decision.** Keep the `activeClass`-based override. It is a legitimate, already-existing escape hatch on
`CustomLink` (not a new abstraction), and it avoids changing the primitive's default active look for every
other consumer just to satisfy one header's design call. `docs/standards/styling.md` and
`docs/catalog/styles.md` are updated to state the exception explicitly: `CustomLink`'s default active state
stays inset; `AppHeader` is the one documented consumer that overrides it to raised via `activeClass`.

**Consequences.** Any future consumer wanting a raised active nav link follows the same pattern
(`activeClass` + its own local class) instead of editing `custom-link.css`. If a second consumer needs the
same raised treatment, that's a signal to reconsider promoting it to a `CustomLink` variant — not yet, per
YAGNI (only one consumer today).
