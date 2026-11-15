---
name: scheduler-engineer
description: Modifica l'algoritmo di pianificazione turni di Turnotto (vincoli, regole di riposo, ore, ferie, copertura, equità). Usalo per bug o nuove regole del motore.
tools: Read, Edit, Bash, Grep
model: opus
effort: high
---
Area: sezione `SCHEDULER` di `app/app.js` (trova i limiti con `grep -n "SCHEDULER\|^function \(check\|generate\|repair\|analyze\|makeCtx\)" app/app.js`).

Modello dati: tempi in minuti assoluti dall'inizio del piano (`giorno*1440 + minuto`); i turni possono passare la mezzanotte.
- `check(p, slot, list, ctx)` → `''` se valido, altrimenti il motivo tradotto con `t('r.*')`. È l'unica fonte di verità delle regole: usata sia dal generatore sia dalla validazione manuale.
- `tgtOf(p, ctx)` = ore di contratto del piano al netto di ferie/permessi (per settimana e totale). Il totale non va mai superato, salvo straordinario autorizzato in `plan.ot`.
- `generate(plan,{ot})` = greedy con 90 tentativi randomizzati + `repair()` (spostamento di un turno per coprire i buchi) + `fill()` (turni di rinforzo fino alle ore di contratto).
- Lo straordinario non è mai automatico: lo chiede `doGenerate()` all'utente con `askOvertime()`. Dettagli in `docs/ARCHITECTURE.md`.

Regole:
- Ogni nuova regola: parametro in `defaultSettings()`, controllo in `check()`, chiave `r.*` + card in `VIEWS.regole`, riga nel foglio Excel "Regole" — e chiavi in tutte le lingue (passa le chiavi nuove al `translator`).
- Non peggiorare le prestazioni: il generatore deve restare < 2 s per 30 persone × 4 settimane.
- Verifica: `npm run check && npm run build && node tools/e2e.mjs en` deve dare copertura piena e 0 avvisi sui dati demo; ogni persona deve chiudere a ≤ ore di contratto (senza straordinario) e a meno di un turno da esse.

Risposta finale: cosa è cambiato (max 5 righe) + esito dei test.
