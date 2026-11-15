#!/usr/bin/env python3
"""Genera il font di icone kawaii di Turnotto dalle sorgenti SVG.

Input : design/icons/*.svg   (griglia 24x24, tratti arrotondati: vedi docs/ICONS.md)
Output: app/fonts/turnotto-icons.woff2   font (una glifo per icona)
        app/icons.css                    @font-face + classi .i-<nome>
        design/icons/codepoints.json     codici stabili (non rinumerare mai)
        docs/ICONS.md                    catalogo con anteprime

Uso:  pip install picosvg skia-pathops fonttools brotli
      python3 tools/build-icons.py            # stampa una riga di riepilogo
"""
import json, sys
from pathlib import Path

from picosvg.svg import SVG
import pathops
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.cu2quPen import Cu2QuPen
from fontTools.svgLib.path import parse_path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'design' / 'icons'
CP_FILE = SRC / 'codepoints.json'
FONT = ROOT / 'app' / 'fonts' / 'turnotto-icons.woff2'
CSS = ROOT / 'app' / 'icons.css'
DOC = ROOT / 'docs' / 'ICONS.md'
UPM, ASC, DESC, FIRST = 1000, 850, -150, 0xE900
SCALE = UPM / 24  # 24 unità SVG = 1 em


def outline(svg_file: Path) -> pathops.Path:
    """SVG con tratti -> un unico contorno pieno (unione booleana)."""
    pico = SVG.parse(str(svg_file)).topicosvg()
    acc = pathops.Path()
    for shape in pico.shapes():
        p = pathops.Path()
        parse_path(shape.as_path().d, p.getPen())
        acc = pathops.op(acc, p, pathops.PathOp.UNION)
    return acc


def glyph_from(path: pathops.Path):
    pen = TTGlyphPen(None)
    # y verso l'alto nei font: y' = ASC - y*SCALE
    tpen = TransformPen(Cu2QuPen(pen, max_err=1.0, reverse_direction=True), (SCALE, 0, 0, -SCALE, 0, ASC))
    path.draw(tpen)
    return pen.glyph()


def main():
    names = sorted(p.stem for p in SRC.glob('*.svg'))
    if not names:
        sys.exit('nessuna icona in design/icons')
    cps = json.loads(CP_FILE.read_text()) if CP_FILE.exists() else {}
    nxt = max(cps.values(), default=FIRST - 1) + 1
    for n in names:
        if n not in cps:
            cps[n] = nxt; nxt += 1
    CP_FILE.write_text(json.dumps(dict(sorted(cps.items(), key=lambda kv: kv[1])), indent=1) + '\n')

    order = ['.notdef'] + names
    fb = FontBuilder(UPM, isTTF=True)
    fb.setupGlyphOrder(order)
    fb.setupCharacterMap({cps[n]: n for n in names})
    glyphs = {'.notdef': TTGlyphPen(None).glyph()}
    for n in names:
        glyphs[n] = glyph_from(outline(SRC / f'{n}.svg'))
    fb.setupGlyf(glyphs)
    fb.setupHorizontalMetrics({g: (UPM, 0) for g in order})
    fb.setupHorizontalHeader(ascent=ASC, descent=DESC)
    fb.setupNameTable({'familyName': 'Turnotto Icons', 'styleName': 'Regular',
                       'copyright': '(c) Marco (Marketto), MIT License', 'version': 'Version 1.0'})
    fb.setupOS2(sTypoAscender=ASC, sTypoDescender=DESC, usWinAscent=ASC, usWinDescent=-DESC)
    fb.setupPost()
    fb.font.flavor = 'woff2'
    FONT.parent.mkdir(parents=True, exist_ok=True)
    fb.save(str(FONT))

    css = ["/* Generato da tools/build-icons.py: non modificare a mano. */",
           "@font-face{font-family:'Turnotto Icons';src:url(fonts/turnotto-icons.woff2) format('woff2');font-display:block}",
           ".i{font-family:'Turnotto Icons';font-style:normal;font-weight:normal;font-size:1.25em;line-height:1;"
           "display:inline-block;vertical-align:-.22em;speak:never;-webkit-font-smoothing:antialiased;"
           "-moz-osx-font-smoothing:grayscale;flex:none}"]
    css += [f".i-{n}::before{{content:'\\{cps[n]:x}'}}" for n in names]
    CSS.write_text('\n'.join(css) + '\n')

    rows = '\n'.join(f'| ![{n}](../design/icons/{n}.svg) | `{n}` | `\\{cps[n]:x}` |' for n in names)
    DOC.write_text(f"""# Icon font — Turnotto Icons

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

## Catalogue ({len(names)} icons)
| Icon | Name | Codepoint |
|:-:|---|---|
{rows}
""")
    print(f'icone: {len(names)} · {FONT.relative_to(ROOT)} {FONT.stat().st_size // 1024} KB · css + docs aggiornati')


if __name__ == '__main__':
    main()
