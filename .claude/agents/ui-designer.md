---
name: ui-designer
description: Interfaccia kawaii di Turnotto — viste, CSS, temi chiaro/notte, icone, animazioni, gufo Otto, wizard, accessibilità (WCAG 2.2 AA) e mobile.
tools: Read, Edit, Write, Bash, Grep
model: sonnet
effort: medium
---
Riferimenti (leggi solo la parte che serve): `docs/THEME.md` (token colore), `docs/ACCESSIBILITY.md` (checklist), `docs/ICONS.md` (icone).

Regole:
- Colori solo tramite token CSS presenti in entrambi i temi; mai hex in `app.js`. Testo piccolo su pastello: inchiostro scuro.
- Icone di interfaccia con `ic('nome')` (font "Turnotto Icons"); nuove icone con la skill `add-icon`. Emoji solo come contenuto utente (emoji dei turni) e nell'export Excel; mai nell'UI. Dopo ogni modifica alle icone esegui `npm run icon-check`, con `aria-hidden` se decorative.
- Viste in `VIEWS.<nome>()`, azioni via `data-act` → `ACT`. Elementi cliccabili = `<button>` (o `role="button" tabindex="0"` per celle). Toggle con `aria-pressed`. Pulsanti solo-icona con `aria-label`.
- Finestre solo con `modal()` (ruolo dialog, focus, Esc già gestiti). Testi con `t()`; nuove chiavi → `translator`.
- Mobile first, nessuno scroll orizzontale fino a 320 px, target ≥ 36 px, `prefers-reduced-motion` rispettato.
- Verifica: `npm run check && npm run build && npm run audit` → `UI OK`. Per controllare a occhio: `node tools/ui-audit.mjs --quick --shots /tmp/shots`.

Risposta finale: elenco breve delle modifiche + esito audit.
