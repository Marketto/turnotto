# Theme — "Kawaii" light and night

All colours live in CSS custom properties at the top of `app/index.html`:
`:root` (light), `:root[data-theme=dark]` and the `prefers-color-scheme: dark` block (night). **Never** write a hex colour in `app.js` or in new CSS rules — add or reuse a token so both themes stay readable.

The user picks *Automatic / Light / Night* in **Rules → Appearance** (`localStorage` key `turnotto.theme`). A tiny inline script in `<head>` applies the choice before the first paint (no flash), `applyTheme()` keeps `<meta name="theme-color">` in sync.

## Tokens
| Token | Use | Light | Night |
|---|---|---|---|
| `--bg1` `--bg-mid` `--bg2` | page gradient | #FFF4F8 → #F0EEFF | #1B1626 → #221B33 |
| `--surface` / `--surface-2` | cards, inputs / subtle fills | #FFFFFF / #F7F3FC | #2A2340 / #342B4F |
| `--surface-glass` `--card` `--header-bg` | translucent bars and cards | white 88–90 % | #2A2340 92 % |
| `--ink` / `--ink2` | text / secondary text | #40354F / #665A7D | #F4EEFF / #CBC0E2 |
| `--line` | borders | #E6DAF2 | #463B63 |
| `--lavd` | headings, links, accents | #5E49B8 | #CDBEFF |
| `--pri` `--pri-2` | primary buttons (white text) | #C9245E → #E0457A | same |
| `--lav-btn` `--mint-btn` | secondary / success buttons (white text) | #5E49B8 / #13704F | same |
| `--ok` `--ko` `--warn` (+ `-bg`) | status text and fills | dark green / raspberry / amber | light mint / pink / gold |
| `--leave-a` `--leave-b` `--leave-ink` | absence stripes and text | warm yellow | dark gold |
| `--pink` `--lav` `--mint` `--peach` `--sky` | decorative pastels (never under small text) | | |
| `--focus` | focus ring | #5E49B8 | #CDBEFF |
| `--hero` `--warm` | hero and notice gradients | | |

Every text/background pair used by the app passes WCAG AA; `npm run audit` re-checks it in both themes.

## Typography & shape
- Headings: **Baloo 2** 700/800; body: **Nunito** 400–800 (self-hosted, latin + cyrillic). CJK, Greek and other scripts fall back to system rounded fonts.
- Radius: cards 22 px, buttons 16 px, chips pill. Shadows: `--sh`, `--sh2`.
- Icons: **Turnotto Icons** font (`docs/ICONS.md`), 2 px rounded strokes with tiny faces. No emoji in the UI (only the emoji users pick for shifts); `LT.e` emoji are kept for Excel only.
- Motion: `pop` (enter), `bob`/`blink` (owl), `wiggle` (stat icons); all off with reduced motion.

## Excel themes
The `.xlsx` export has its own two palettes (`XT.kawaii`, `XT.seria` in `app.js`), independent from the screen theme.
