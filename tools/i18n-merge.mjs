#!/usr/bin/env node
// Applica una patch di traduzioni a tutti i file app/lang/*.json in un colpo solo.
// Pensato per gli agenti: si scrive UN file patch compatto invece di modificare 39 file.
//
// Uso:
//   node tools/i18n-merge.mjs patch.json          aggiunge/aggiorna chiavi
//   node tools/i18n-merge.mjs --remove key1 key2   rimuove chiavi da tutte le lingue
//
// Formato patch.json: { "en": { "key": "text" }, "it": { "key": "testo" }, ... }
// L'ordine delle chiavi segue en.json (nuove chiavi in coda).
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'app', 'lang');
const args = process.argv.slice(2);
const langs = readdirSync(dir).filter(f => f.endsWith('.json')).map(f => f.slice(0, -5));
const read = c => JSON.parse(readFileSync(join(dir, c + '.json'), 'utf8'));
const write = (c, d) => writeFileSync(join(dir, c + '.json'), JSON.stringify(d, null, 0).replace(/,"/g, ',\n"') + '\n');

if (args[0] === '--remove') {
  const keys = args.slice(1);
  for (const c of langs) { const d = read(c); keys.forEach(k => delete d[k]); write(c, d); }
  console.log(`rimosse ${keys.length} chiavi da ${langs.length} lingue`);
  process.exit(0);
}

if (!args[0]) { console.error('uso: node tools/i18n-merge.mjs patch.json | --remove key…'); process.exit(2); }
const patch = JSON.parse(readFileSync(args[0], 'utf8'));
const en = { ...read('en'), ...(patch.en || {}) };
let n = 0;
for (const c of langs) {
  const cur = { ...read(c), ...(patch[c] || {}) };
  const out = {};
  for (const k of Object.keys(en)) if (k in cur) out[k] = cur[k];
  for (const k of Object.keys(cur)) if (!(k in out)) out[k] = cur[k];
  write(c, out); n += Object.keys(patch[c] || {}).length;
}
const unknown = Object.keys(patch).filter(c => !langs.includes(c));
console.log(`patch applicata: ${n} stringhe in ${langs.length} lingue${unknown.length ? ` · lingue sconosciute ignorate: ${unknown.join(',')}` : ''}`);
