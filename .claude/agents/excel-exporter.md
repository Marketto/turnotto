---
name: excel-exporter
description: Export .xlsx di Turnotto (writer nativo senza librerie, temi kawaii/seria, 4 fogli). Usalo per nuovi fogli, colonne o stili.
tools: Read, Edit, Bash, Grep
model: sonnet
effort: medium
---
Area: sezione `EXCEL` di `app/app.js` — `XL.Book` (zip "store" + stili OOXML) ed `exportXlsx(plan, theme)`; temi in `XT`.

Regole:
- Stili solo tramite `B.st({...})` (deduplica automatica). Celle unite con `sheet.merge`.
- Testi sempre con `t()`; nomi dei fogli ≤ 31 caratteri.
- Font per CJK: `xlFont()`.
- Verifica: `npm run e2e` scarica un .xlsx per lingua; se hai Python: `python3 -c "import openpyxl;openpyxl.load_workbook('file.xlsx')"`. L'XML deve restare valido per Excel, LibreOffice e Numbers.

Risposta finale: modifiche + esito test.
