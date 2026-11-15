# Accessibility & usability

Target: **WCAG 2.2 level AA**, plus the usual mobile usability rules. Checked automatically on every push by `tools/ui-audit.mjs` (axe-core + Playwright).

## What the app guarantees
| Area | How |
|---|---|
| Keyboard | Everything reachable with Tab; plan cells, coverage cells and calendar days are `role="button"` with Enter/Space; visible focus ring (`:focus-visible`, 3 px). First Tab = "Skip to content" link. |
| Dialogs | `role="dialog"` + `aria-modal`, labelled by their title; focus moves inside, Tab is trapped, Esc closes (except the first-run wizard until the privacy policy is accepted), focus returns to the control that opened it. |
| Screen readers | Landmarks (`header`, `nav` with label, `main`); one `h1` per view and focus moved to it on navigation; page `<title>` per view; icon-only buttons have `aria-label`; toggles use `aria-pressed`; current page `aria-current`; status messages in an `aria-live` region; decorative owl, emoji and icons are `aria-hidden`. |
| Plan table | `<caption>`, `scope` on headers, each cell announces person + date + shifts + rule warnings. |
| Language | `<html lang>` follows the chosen language; each language in the picker has its own `lang` attribute. |
| Contrast | All text ≥ 4.5:1 (large ≥ 3:1) in both light and night themes — colours come only from the tokens in `docs/THEME.md`. Avatars and pastel chips use dark text. |
| Colour is never the only cue | Coverage shows `2/3`, warnings show ⚠️ and text, selected options show ✅ / `aria-pressed`. |
| Motion | `prefers-reduced-motion`: animations, confetti and floating decorations are disabled. |
| Zoom & mobile | No zoom lock; no horizontal scrolling down to 320 px; tap targets ≥ 36 px; dialogs fit the real viewport (`dvh`, safe areas). |
| High contrast | `forced-colors` mode keeps borders on buttons and cards. |

## Checklist for every change
1. New text → `t('key')` in all languages (`add-strings` skill). New icon-only button → `aria-label`.
2. Clickable thing → a real `<button>` (or `role="button" tabindex="0"` for table/calendar cells).
3. Toggle → `aria-pressed`, updated in the handler.
4. New colour → add a token for **both** themes, never a hex value in `app.js`.
5. New dialog → use `modal(title, body)`; it already handles roles, focus and Esc.
6. Run `npm run audit` → must print `UI OK`.

## Testing
```bash
npm run audit                       # 3 devices × 2 themes, wizard + 7 views + 7 dialogs, keyboard checks
node tools/ui-audit.mjs --quick     # phone + desktop, light only (faster)
node tools/ui-audit.mjs --shots /tmp/shots   # also saves screenshots
```
Manual spot checks worth doing before a big release: TalkBack (Android) and VoiceOver (iOS) on the plan table and the wizard; 200 % browser zoom on desktop.
