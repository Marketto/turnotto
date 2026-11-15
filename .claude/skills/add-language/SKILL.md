---
name: add-language
description: Aggiunge una nuova lingua a Turnotto (file di traduzione, selettore lingua, locale per date/numeri).
---
# Nuova lingua

1. In `app/app.js`, oggetto `LANGS`: aggiungi `codice:'Nome nativo'`. Se serve una variante per `Intl` (date/numeri), aggiungila in `LOCALE` (es. `pt:'pt-PT'`).
2. Se la lingua ha alias nel browser (es. `nn`→`nb`), gestiscili in `detectLang()`.
3. Crea il file copiando l'inglese: `cp app/lang/en.json app/lang/<codice>.json`, poi l'agente `translator` lo traduce tutto con una patch (stesse regole: segnaposto ed emoji invariati).
4. Aggiorna il numero di lingue nei testi `cl.*.b` e nel README se cambia.
5. `npm run check && npm run build && node tools/e2e.mjs <codice>`.

Lingue da destra a sinistra (arabo, ebraico): servono anche `dir="rtl"` su `<html>` e verifica del layout con `ui-designer`.
