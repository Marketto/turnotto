# Icon font — Turnotto Icons

Kawaii icon set used for every interface control (navigation, buttons, dialogs).
Emoji stay only for decorative content (stats, shift emoji chosen by users, leave types).

## Use
```js
ic('calendar')               // -> <i class="i i-calendar" aria-hidden="true"></i>
```
Icons are always decorative (`aria-hidden`): the button next to them must have visible text or an `aria-label`.
Colour follows `currentColor`; size follows `font-size` (1.25em of the parent by default).

## Style rules for new icons
- 24×24 `viewBox`, everything inside a 2 px margin.
- Strokes: `stroke-width="2"`, `stroke-linecap="round"`, `stroke-linejoin="round"`, no fill.
- Kawaii details: dot eyes `r≈1` (`fill="#000" stroke="none"`) and a tiny smile on "friendly" objects.
- Single colour: no gradients, no opacity.
- Save as `design/icons/<name>.svg`, then `python3 tools/build-icons.py` (needs `picosvg skia-pathops fonttools brotli`).
  Codepoints are stored in `design/icons/codepoints.json` and never change.

## Catalogue (35 icons)
| Icon | Name | Codepoint |
|:-:|---|---|
| ![beach](../design/icons/beach.svg) | `beach` | `\e900` |
| ![bell](../design/icons/bell.svg) | `bell` | `\e901` |
| ![book](../design/icons/book.svg) | `book` | `\e902` |
| ![broom](../design/icons/broom.svg) | `broom` | `\e903` |
| ![calendar](../design/icons/calendar.svg) | `calendar` | `\e904` |
| ![check](../design/icons/check.svg) | `check` | `\e905` |
| ![chev-left](../design/icons/chev-left.svg) | `chev-left` | `\e906` |
| ![chev-right](../design/icons/chev-right.svg) | `chev-right` | `\e907` |
| ![clock](../design/icons/clock.svg) | `clock` | `\e908` |
| ![close](../design/icons/close.svg) | `close` | `\e909` |
| ![copy](../design/icons/copy.svg) | `copy` | `\e90a` |
| ![download](../design/icons/download.svg) | `download` | `\e90b` |
| ![edit](../design/icons/edit.svg) | `edit` | `\e90c` |
| ![folder](../design/icons/folder.svg) | `folder` | `\e90d` |
| ![gear](../design/icons/gear.svg) | `gear` | `\e90e` |
| ![globe](../design/icons/globe.svg) | `globe` | `\e90f` |
| ![heart](../design/icons/heart.svg) | `heart` | `\e910` |
| ![home](../design/icons/home.svg) | `home` | `\e911` |
| ![info](../design/icons/info.svg) | `info` | `\e912` |
| ![install](../design/icons/install.svg) | `install` | `\e913` |
| ![moon](../design/icons/moon.svg) | `moon` | `\e914` |
| ![owl](../design/icons/owl.svg) | `owl` | `\e915` |
| ![plus](../design/icons/plus.svg) | `plus` | `\e916` |
| ![save](../design/icons/save.svg) | `save` | `\e917` |
| ![sheet](../design/icons/sheet.svg) | `sheet` | `\e918` |
| ![sparkle](../design/icons/sparkle.svg) | `sparkle` | `\e919` |
| ![sun](../design/icons/sun.svg) | `sun` | `\e91a` |
| ![sunrise](../design/icons/sunrise.svg) | `sunrise` | `\e91b` |
| ![target](../design/icons/target.svg) | `target` | `\e91c` |
| ![team](../design/icons/team.svg) | `team` | `\e91d` |
| ![trash](../design/icons/trash.svg) | `trash` | `\e91e` |
| ![upload](../design/icons/upload.svg) | `upload` | `\e91f` |
| ![user](../design/icons/user.svg) | `user` | `\e920` |
| ![wand](../design/icons/wand.svg) | `wand` | `\e921` |
| ![warning](../design/icons/warning.svg) | `warning` | `\e922` |
