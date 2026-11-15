# Turnotto — guida per agenti

PWA statica (nessun backend) per pianificare turni. Mascotte: Otto il gufo. Deploy: GitHub Pages da `app/`.

## Mappa (leggi solo ciò che serve)
| Percorso | Contenuto |
|---|---|
| `app/app.js` | tutta la logica. Sezioni marcate `/* ==== */`: i18n, state, owl, SCHEDULER, VIEWS, forms, actions, EXCEL, wizard |
| `app/index.html` | shell + CSS: token colore tema chiaro/notte (`docs/THEME.md`) |
| `app/icons.css`, `app/fonts/turnotto-icons.woff2` | font icone, **generati** da `design/icons/*.svg` con `npm run icons` |
| `app/lang/<code>.json` | 39 lingue, chiavi piatte. `en.json` = fonte di verità |
| `app/sw.js` | service worker, **generato** da `tools/build.mjs` |
| `tools/` | script con output compatto: `i18n-check`, `i18n-merge`, `build`, `build-icons.py`, `e2e`, `ui-audit` |
| `docs/` | `ARCHITECTURE`, `THEME`, `ACCESSIBILITY`, `ICONS`, `AGENTS` |
| `.claude/agents`, `.claude/skills` | agenti e skill del progetto |

Per trovare codice usa `grep -n "nome" app/app.js` e leggi con offset/limit: non leggere `app.js` (≈90 KB) o le lingue per intero.

## Router (prima di ogni task)
Scegli dalla tabella; usa l'agente `router` solo se il task non è chiaro.

| Se il task riguarda… | Agente / skill | Modello | Effort |
|---|---|---|---|
| testi, nuove chiavi, nuova lingua | skill `add-strings` / `add-language` → agente `translator` | sonnet | low |
| algoritmo turni, regole, vincoli, ferie | `scheduler-engineer` | opus | high |
| grafica, CSS, tema, icone, animazioni, gufo, wizard, accessibilità | `ui-designer` (+ skill `add-icon`) | sonnet | medium |
| export Excel (.xlsx) | `excel-exporter` | sonnet | medium |
| nuova versione, changelog, deploy | skill `release` → `release-manager` | haiku | low |
| verifica / test / bug report | skill `test-app` → `qa-tester` | haiku | low |
| refusi, una riga, domande sul codice | nessun agente: fallo direttamente | — | low |

**Escalation automatica**: se un agente fallisce i controlli 2 volte, rilancia il task con il livello successivo (haiku→sonnet→opus, low→medium→high). Mai partire da opus/high per task piccoli.

## Regole fisse
- Ogni testo visibile passa da `t('chiave')`. Nuove chiavi: aggiungile a **tutte** le 39 lingue con `tools/i18n-merge.mjs` (una patch, non 39 modifiche).
- Nuova funzione visibile all'utente ⇒ aggiungi `cl.<versione>.<lettera>` e aggiorna `CHANGELOG` in `app.js` (il wizard mostra le novità).
- Nessun dato personale, segreto o servizio esterno nel repo o nell'app (privacy policy: tutto resta nel browser). Unici dati autore ammessi: "Marco (Marketto)".
- Niente dipendenze runtime né CDN: l'app deve funzionare offline. Font in `app/fonts/`.
- Accessibilità WCAG 2.2 AA (`docs/ACCESSIBILITY.md`): pulsanti veri, `aria-label` sui pulsanti solo-icona, `aria-pressed` sui toggle, finestre solo con `modal()`.
- Colori solo tramite token CSS validi in entrambi i temi; icone di interfaccia con `ic('nome')`, emoji solo come contenuto.
- Ogni modifica va documentata: aggiorna il doc in `docs/` della parte toccata, `CHANGELOG.md` e, se cambia il modo di lavorare, la skill o l'agente relativo.
- Prima di consegnare: `npm run check && npm run build && npm run e2e`.

## Comandi
```
npm run check   # i18n + sintassi
npm run build   # rigenera sw.js (sempre dopo modifiche in app/)
npm run e2e     # test headless (en it ja ru) + audit UI/accessibilità
npm run audit   # solo audit WCAG 2.2 AA + layout (--quick, --shots dir)
npm run icons   # rigenera il font icone da design/icons/*.svg
npm run serve   # http://localhost:8080
```
