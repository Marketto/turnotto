#!/usr/bin/env node
// Test end-to-end headless (Playwright). Avvia un server statico su app/, poi per ogni lingua:
// wizard → genera piano demo → controlla copertura e avvisi → export Excel → pagina info.
// Uso: node tools/e2e.mjs [it en ja …]   (default: en it ja ru)
// Output: una riga per lingua. Exit 1 al primo errore.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

let chromium;
try { ({ chromium } = await import('playwright')); }
catch { console.error('Playwright mancante: npm i && npx playwright install chromium'); process.exit(2); }

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'app');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
const server = createServer(async (req, res) => {
  const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  try { const b = await readFile(join(root, p.endsWith('/') ? p + 'index.html' : p)); res.writeHead(200, { 'content-type': MIME[extname(p)] || 'text/html' }); res.end(b); }
  catch { res.writeHead(404); res.end(); }
}).listen(0);
const url = `http://localhost:${server.address().port}/`;
const langs = process.argv.slice(2).length ? process.argv.slice(2) : ['en', 'it', 'ja', 'ru'];
const browser = await chromium.launch();
let failed = false;

for (const lang of langs) {
  const ctx = await browser.newContext({ locale: lang, acceptDownloads: true, viewport: { width: 1280, height: 860 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => m.type() === 'error' && errors.push(m.text()));
  try {
    await page.goto(url);
    await page.waitForSelector('.wiz');
    for (let i = 0; i < 4; i++) await page.click('[data-w=next]');
    await page.check('#wAcc'); await page.click('[data-w=next]');
    await page.goto(url + '#turni'); await page.click('[data-act=gen]');
    await page.waitForSelector('table.plan', { timeout: 20000 });
    const r = await page.evaluate(() => { const a = analyze(state.current); return { need: a.need, have: a.have, viol: a.nViol, lang: LANG }; });
    await page.evaluate(() => { window.showSaveFilePicker = undefined; });
    await page.click('[data-act=xl]');
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#xlGo')]);
    const xlsx = (await dl.path()) ? 'xlsx ok' : 'xlsx ?';
    await page.goto(url + '#info'); await page.waitForSelector('#privacy');
    const ok = r.lang === lang && r.have === r.need && r.viol === 0 && !errors.length;
    if (!ok) failed = true;
    console.log(`${ok ? 'OK ' : 'ERR'} ${lang}: copertura ${r.have}/${r.need} · avvisi ${r.viol} · ${xlsx}${errors.length ? ' · errori: ' + errors.slice(0, 3).join(' | ') : ''}`);
  } catch (e) { failed = true; console.log(`ERR ${lang}: ${e.message.split('\n')[0]}`); }
  await ctx.close();
}
await browser.close(); server.close();
process.exit(failed ? 1 : 0);
