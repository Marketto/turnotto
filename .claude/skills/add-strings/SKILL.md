---
name: add-strings
description: Aggiunge o modifica testi dell'interfaccia di Turnotto in tutte le 39 lingue con una sola patch. Usala ogni volta che serve una nuova chiave t('…') o si cambia un testo.
---
# Aggiungere testi (39 lingue)

1. Scegli chiavi brevi col prefisso della sezione: `nav.` `btn.` `home.` `staff.` `leave.` `plan.` `r.` `hist.` `rules.` `rule.` `xl.` `xs.` `wiz.` `info.` `cl.`
2. Nel codice usa `t('chiave')` o `t('chiave',{n:3})` con segnaposto `{n}`.
3. Crea la patch inglese e applicala:
   ```bash
   echo '{"en":{"plan.newKey":"New text {n}"}}' > /tmp/p.json && node tools/i18n-merge.mjs /tmp/p.json
   ```
4. Fai tradurre il resto all'agente `translator` (sonnet, low): legge `node tools/i18n-check.mjs --todo` e applica un'unica patch.
5. Controllo: `node tools/i18n-check.mjs` → `i18n OK`.

Per eliminare chiavi: `node tools/i18n-merge.mjs --remove chiave1 chiave2`.
