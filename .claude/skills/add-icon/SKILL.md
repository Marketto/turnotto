---
name: add-icon
description: Aggiunge o modifica un'icona del font kawaii "Turnotto Icons" (sorgente SVG → woff2 + CSS + catalogo).
---
# Nuova icona

1. Crea `design/icons/<nome>.svg` copiando un'icona simile. Regole: `viewBox="0 0 24 24"`, margine 2 px, `<g fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">`, occhietti `r≈1` con `fill="#000" stroke="none"`, un solo colore.
2. `npm run icons` (prima volta: `pip install picosvg skia-pathops fonttools brotli`). Rigenera `app/fonts/turnotto-icons.woff2`, `app/icons.css`, `docs/ICONS.md`; i codici in `design/icons/codepoints.json` restano stabili.
3. Nel codice: `ic('<nome>')`. Se il pulsante ha solo l'icona aggiungi `aria-label="${h(t('…'))}"`.
4. `npm run build && npm run audit`.

Non rinominare né cancellare icone usate: cerca prima con `grep -n "ic('<nome>')" app/app.js`.
