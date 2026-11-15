---
name: test-app
description: Verifica completa di Turnotto (traduzioni, sintassi, build, test end-to-end, accessibilità WCAG 2.2 AA e layout su telefono/desktop in tema chiaro e notte).
---
# Test

```bash
npm ci --silent && npx playwright install chromium   # solo la prima volta
npm run check     # traduzioni + sintassi JS
npm run build     # rigenera sw.js
npm run e2e       # e2e (en it ja ru) + audit UI/accessibilità
```

- `tools/e2e.mjs`: ogni riga `OK` = wizard completato, piano demo con copertura piena e 0 avvisi, .xlsx scaricato, pagina privacy raggiungibile, nessun errore in console. Tutte le lingue: `node tools/e2e.mjs $(ls app/lang | sed 's/.json//')`.
- `tools/ui-audit.mjs` (anche `npm run audit`): telefono piccolo, telefono, desktop × tema chiaro e notte, pulsante Installa visibile; axe-core (WCAG 2.2 AA) su wizard, 7 viste e 7 finestre; overflow e controlli fuori schermo; tastiera (skip link, Invio sulle celle, Esc che restituisce il focus). Deve stampare `UI OK`. Opzioni: `--quick`, `--shots dir`.

Se fallisce: riporta le righe di errore (regola axe, stato, selettore), poi cerca la causa con `grep -n` nella sezione indicata (non leggere file interi). Per la correzione: `ui-designer`.
