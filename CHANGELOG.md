# Changelog

## 1.2.0 — 2026-11-15
- **Contract hours guaranteed**: each plan reaches each person's contract hours net of leave and permits, and never goes over them. A day of leave is worth weekly hours ÷ working days (new field "Working days per week"); hourly permits count their hours.
- **Overtime only on request**: if slots stay uncovered, Otto asks whether to allow overtime (max hours per person adjustable), always within rest and weekly/fortnightly maximums. Overtime is shown per person and in the plan stats. Rules → "Maximum overtime" is now per plan (default 8 h).
- New rule "Complete contract hours": backup shifts when required shifts are not enough to reach contract hours.
- Plans can cover a **whole calendar month**.
- No more emoji in the interface: stats, titles, chips, absence types, owl tips, wizard, dialogs and toasts use Turnotto Icons (20 new icons: flask, rainbow, hourglass, sleep, bed, bolt, lock, doc, block, search, sad, star, pin, thermo, sprout, cloud, flower, briefcase, box, box-check). Shift emoji chosen by users and the Excel export keep emoji.
- Fix crooked icons: glyphs had no left side bearing (shifted left by up to 30 %) and sat too low next to text; metrics fixed in `tools/build-icons.py`, new `tools/icon-check.mjs` compares each glyph with its SVG.

## 1.1.0 — 2026-11-15
- New **Turnotto Icons**: 35 kawaii icons as a 3 KB icon font (`design/icons` → `tools/build-icons.py`).
- New **night theme** with automatic/light/night switch (Rules → Appearance); colours moved to design tokens.
- **Accessibility (WCAG 2.2 AA)**: skip link, landmarks, one `h1` per view, accessible dialogs (focus trap/return, Esc), keyboard-operable plan, coverage and calendar cells, `aria-pressed` toggles, live region for messages, higher contrast in both themes, reduced motion.
- `tools/ui-audit.mjs` now runs axe-core on 3 devices × 2 themes and checks keyboard flows; `npm run audit`.
- Docs: THEME, ACCESSIBILITY, ICONS; new skill `add-icon`; updated `ui-designer`, `test-app`.

## 1.0.1 — 2026-11-15
- Fix: on phones where the "Install" button appears, the header widened the page and the welcome wizard was cut off and could not be completed.
- Header on small screens shows only icons; modals and wizard fit the real viewport height (in-app browsers included).

## 1.0.0 — 2026-11-15
- Automatic shift planning with rules and personal constraints (consecutive hours, rest between shifts, weekly/fortnightly rest, hour caps, overtime).
- Team, leave and history management; `.json` backup and restore.
- Native `.xlsx` export in kawaii or serious style (4 sheets).
- 39 languages (all European languages, Japanese, Korean, Chinese).
- Welcome wizard, "what's new" wizard on updates, privacy policy and disclaimer.
- Installable offline PWA with self-hosted fonts.
