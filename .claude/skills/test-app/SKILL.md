---
name: test-app
description: Verifica completa di Turnotto (traduzioni, sintassi, build, test end-to-end headless con export Excel).
---
# Test

```bash
npm ci --silent && npx playwright install chromium   # solo la prima volta
npm run check     # traduzioni + sintassi JS
npm run build     # rigenera sw.js
npm run e2e       # en it ja ru; per tutte: node tools/e2e.mjs $(ls app/lang | sed 's/.json//')
```

`npm run e2e` esegue anche `tools/ui-audit.mjs` (telefono piccolo, telefono, desktop, pulsante Installa visibile): deve stampare `UI OK`. Con `--shots /tmp/shots` salva gli screenshot.

Ogni riga `OK` del test e2e significa: wizard completato, piano demo generato con copertura piena e 0 avvisi, .xlsx scaricato, pagina privacy raggiungibile, nessun errore in console.

Se fallisce: riporta la riga `ERR`, poi cerca la causa con `grep -n` nella sezione indicata (non leggere file interi).
