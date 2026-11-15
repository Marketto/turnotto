<p align="center"><img src="app/icons/icon-192.png" width="96" alt="Turnotto"></p>

<h1 align="center">Turnotto</h1>
<p align="center"><b>Kawaii shift planner with Otto the owl</b> · installable PWA · no account, no server · 39 languages</p>
<p align="center"><a href="https://marketto.github.io/turnotto/">▶ Open the app</a></p>

---

## Features
- **Team**: weekly hours, role, days and time slots someone can't work, shifts they can't take.
- **Leave**: holidays, time off, sick leave — full day or by hours, with a monthly calendar.
- **Rules**: max consecutive hours, minimum rest between shifts, weekly and fortnightly consecutive rest, weekly and fortnightly hour caps, allowed overtime.
- **Automatic planning**: shift templates (also across midnight) with staffing needs per weekday; the planner respects every rule and spreads hours fairly. Every cell can be edited by hand, with live rule warnings.
- **History**: save plans, reopen them, back up everything to a `.json` file and restore it on another device.
- **Excel export**: real `.xlsx` with 4 formatted sheets, in *kawaii* or *serious* style.
- **Welcome wizard** on first launch, and a "what's new" wizard after each update.
- **Offline & installable** on Android, iOS, Windows, macOS, Linux and ChromeOS.
- **39 languages**: all European languages plus Japanese, Korean and Chinese.

## Install
Open <https://marketto.github.io/turnotto/> and:
- **Chrome / Edge / Android**: "Install" button in the app or browser menu → *Install app*.
- **iPhone / iPad**: Share → *Add to Home Screen*.

## Privacy
Everything stays in your browser: no account, no analytics, no cookies, no third-party requests. See [PRIVACY.md](PRIVACY.md).

## Disclaimer
Turnotto is a free, **amateur** utility provided "as is", without warranty of any kind. Generated plans are suggestions only: always check them against your contracts, laws and company rules. The authors accept no liability for any damage, data loss or consequence arising from its use. See [LICENSE](LICENSE).

## Development
No build step and no runtime dependencies: the app is the `app/` folder.

```bash
npm ci && npx playwright install chromium
npm run serve    # http://localhost:8080
npm run check    # translations + JS syntax
npm run build    # regenerates the service worker cache list
npm run e2e      # headless end-to-end test (en it ja ru)
```

Every push to `main` is tested and deployed to GitHub Pages by [`.github/workflows/pages.yml`](.github/workflows/pages.yml).

- Architecture: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- AI agent setup (Claude Code): [docs/AGENTS.md](docs/AGENTS.md) and [CLAUDE.md](CLAUDE.md)
- Changes: [CHANGELOG.md](CHANGELOG.md)

---

<details><summary>🇮🇹 In italiano</summary>

Turnotto è una web app installabile per pianificare i turni di una squadra: organico con ore e vincoli, ferie e permessi, regole su riposi e ore massime, generazione automatica dei turni, storico con backup su file ed export Excel formattato. Funziona offline, senza account e senza server: i dati restano nel browser.

È un'utility **amatoriale** fornita "così com'è", senza garanzie: i piani generati sono suggerimenti da verificare rispetto a contratti, leggi e regole aziendali. Gli autori non si assumono responsabilità per l'uso.
</details>

© 2026 Marco ([Marketto](https://github.com/Marketto)) · [MIT License](LICENSE)
