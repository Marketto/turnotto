#!/usr/bin/env node
// Controlla le traduzioni rispetto a app/lang/en.json (fonte di verità).
// Uso: node tools/i18n-check.mjs [--json | --todo]   → exit 1 se ci sono problemi.
// --todo: stampa solo le chiavi mancanti con il testo inglese (input per il translator).
// Output compatto, pensato per essere letto da un agente con pochi token.
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'app', 'lang');
const en = JSON.parse(readFileSync(join(dir, 'en.json'), 'utf8'));
const ph = s => (String(s).match(/\{\w+\}/g) || []).sort().join(',');
const report = {};
let bad = 0;

for (const f of readdirSync(dir).filter(f => f.endsWith('.json') && f !== 'en.json').sort()) {
  const code = f.slice(0, -5);
  let d;
  try { d = JSON.parse(readFileSync(join(dir, f), 'utf8')); }
  catch (e) { report[code] = { error: 'JSON non valido: ' + e.message }; bad++; continue; }
  const missing = Object.keys(en).filter(k => !(k in d) || String(d[k]).trim() === '');
  const extra = Object.keys(d).filter(k => !(k in en));
  const placeholders = Object.keys(en).filter(k => k in d && ph(en[k]) !== ph(d[k]));
  if (missing.length || extra.length || placeholders.length) {
    report[code] = { missing, extra, placeholders };
    bad++;
  }
}

if (process.argv.includes('--todo')) {
  // Testo inglese delle chiavi da tradurre, raggruppato per lingua: input minimo per il translator.
  const todo = {};
  for (const [c, r] of Object.entries(report)) if (r.missing?.length) todo[c] = r.missing;
  const keys = [...new Set(Object.values(todo).flat())];
  console.log(JSON.stringify({ source: Object.fromEntries(keys.map(k => [k, en[k]])), langs: todo }));
}
else if (process.argv.includes('--json')) console.log(JSON.stringify(report));
else if (!bad) console.log(`i18n OK · ${Object.keys(en).length} chiavi · ${readdirSync(dir).length} lingue`);
else for (const [c, r] of Object.entries(report)) {
  if (r.error) { console.log(`${c}: ${r.error}`); continue; }
  const p = [];
  if (r.missing.length) p.push(`mancanti ${r.missing.length}: ${r.missing.slice(0, 8).join(' ')}${r.missing.length > 8 ? ' …' : ''}`);
  if (r.extra.length) p.push(`extra: ${r.extra.join(' ')}`);
  if (r.placeholders.length) p.push(`segnaposto errati: ${r.placeholders.join(' ')}`);
  console.log(`${c}: ${p.join(' | ')}`);
}
process.exit(bad ? 1 : 0);
