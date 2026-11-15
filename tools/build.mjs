#!/usr/bin/env node
// Prepara app/ per il deploy: aggiorna l'elenco dei file e la versione della cache nel service worker.
// Uso: node tools/build.mjs [--check]   (--check: fallisce se sw.js non è aggiornato, utile in CI)
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const app = join(dirname(fileURLToPath(import.meta.url)), '..', 'app');
const walk = d => readdirSync(d).flatMap(f => {
  const p = join(d, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});
const files = walk(app).filter(p => !p.endsWith(`${sep}sw.js`)).sort();
const hash = createHash('sha256');
for (const f of files) hash.update(relative(app, f)).update(readFileSync(f));
const ver = (readFileSync(join(app, 'app.js'), 'utf8').match(/APP_VERSION='([\d.]+)'/) || [])[1] || '0.0.0';
const VERSION = `turnotto-${ver}-${hash.digest('hex').slice(0, 8)}`;
const ASSETS = ['./', ...files.map(f => './' + relative(app, f).split(sep).join('/'))];

const swPath = join(app, 'sw.js');
const sw = readFileSync(swPath, 'utf8');
const next = sw
  .replace(/const VERSION = '[^']*';/, `const VERSION = '${VERSION}';`)
  .replace(/const ASSETS = \[[^\]]*\];/s, `const ASSETS = ${JSON.stringify(ASSETS)};`);

if (process.argv.includes('--check')) {
  if (next !== sw) { console.error('sw.js non aggiornato: esegui node tools/build.mjs'); process.exit(1); }
  console.log(`sw.js OK · ${VERSION}`);
} else {
  writeFileSync(swPath, next);
  console.log(`sw.js · ${VERSION} · ${ASSETS.length} file`);
}
