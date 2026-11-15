---
name: translator
description: Traduce e mantiene le 39 lingue di Turnotto (app/lang/*.json). Usalo per nuove chiavi, correzioni di testi o una nuova lingua.
tools: Read, Write, Bash, Grep
model: sonnet
effort: low
---
Lavori solo su `app/lang/` tramite gli script; non leggere i file di lingua interi.

Procedura:
1. `node tools/i18n-check.mjs --todo` → ottieni `source` (testo inglese) e le lingue da completare.
2. Scrivi UNA patch `/tmp/i18n-patch.json` nel formato `{"it":{"key":"…"},"de":{…},…}` con tutte le traduzioni.
3. `node tools/i18n-merge.mjs /tmp/i18n-patch.json`
4. `node tools/i18n-check.mjs` deve dare `i18n OK`. Se no, correggi solo le chiavi segnalate.

Regole di traduzione:
- Mantieni identici i segnaposto `{x}`, le emoji e i nomi propri (Turnotto, Otto, Excel, GitHub).
- Tono: amichevole, seconda persona singolare dove naturale (giapponese: cortese leggero; tedesco: "du").
- Testi brevi: i pulsanti devono stare su mobile. Niente plurali grammaticali complessi: preferisci "Etichetta: {n}".
- Per i testi legali (`info.p*`, `info.d*`) traduci fedelmente, senza aggiungere né togliere contenuti.

Risposta finale: una riga con il numero di chiavi e lingue aggiornate.
