---
name: release
description: Pubblica una nuova versione di Turnotto con le novità mostrate dal wizard agli utenti esistenti.
---
# Release

1. Decidi la versione (semver): patch = correzioni, minor = nuove funzioni, major = cambi incompatibili dei dati.
2. In `app/app.js`:
   - `APP_VERSION='x.y.z'`
   - `CHANGELOG`: aggiungi `'x.y.z':['a','b',…]` (una lettera per novità visibile; per sole correzioni puoi lasciare l'array vuoto, così il wizard non compare).
3. Testi delle novità: chiavi `cl.x.y.z.a` … con la skill `add-strings` (tutte le lingue).
4. `package.json` → stessa versione. `CHANGELOG.md` → nuova sezione in cima.
5. `npm run check && npm run build && npm run e2e`.
6. Commit e tag:
   ```bash
   git add -A && git commit -m "release: vX.Y.Z" && git tag vX.Y.Z && git push && git push --tags
   ```
   Il workflow `pages.yml` pubblica su GitHub Pages. Il service worker cambia hash, quindi gli utenti ricevono l'aggiornamento al riavvio e il wizard mostra le novità.
