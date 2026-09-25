# 16 · UI/UX pattern consistency (unicity)

**What.** A visual or structural treatment introduced in one place — an icon next to a heading, a spacing or
timeline mechanism, a hover/elevation effect, a control's height, a card's padding — is not a one-off. Before
shipping it, grep for every other location in the project that plays the same role (every section title,
every timeline instance, every card header, every control of that kind) and make them match. If a place is
deliberately different, that's a decision (rule 11), written down, never an accidental omission discovered
later by the user.

**Why.** Happened twice in one session: only `EducationSection`'s "Certificacions" subtitle got an icon while
no other section title has one, and the continuous-timeline-line fix (criterion 10, `feat/ux-redesign`) was
applied to `ExperienceItem`'s `--detailed` variant only, leaving `--compact` (education, certifications —
the exact same component, reused) with the old broken-line gap. Both are the same root cause: a pattern
changed in one call site without checking the others that share it.

**How to apply.** When a story/contract touches a component or pattern used in more than one place (grep for
its consumers first — `grep -rn "ComponentName" app/`), the contract lists every other location using that
pattern and states explicitly whether each one is being aligned too or is a deliberate exception. Applies to
shared components (`app/components/shared/`), repeated structural patterns across `cv/` sections (section
titles, timeline items, card layouts), and repeated CSS treatments (`app/assets/css/components/*.css`).

**How it's checked.** Human review (like rules 02/11); `.claude/templates/review-checklist.md` carries a line
for it. No generic automated check is realistic for visual consistency — the mechanically-checkable slices of
this problem (e.g. dangling test references) are covered by rule 17 instead.
