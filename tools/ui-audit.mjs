#!/usr/bin/env node
// Audit di usabilità e accessibilità (WCAG 2.2 AA) con Playwright + axe-core.
// Dispositivi: telefono piccolo, telefono, desktop · temi: chiaro e notte · pulsante "Installa" forzato visibile.
// Per ogni stato (passi del wizard, 7 viste, 7 finestre) controlla:
//   - layout: overflow orizzontale, controlli fuori schermo, finestre fuori vista
//   - axe-core: regole wcag2a/aa, wcag21a/aa, wcag22aa (contrasto, nomi accessibili, ruoli, label…)
//   - tastiera: skip link per primo, apertura cella con Invio, Esc chiude e restituisce il focus
// Uso: node tools/ui-audit.mjs [--shots dir] [--quick]   → "UI OK" oppure un problema per riga (exit 1).
import { chromium, devices } from 'playwright';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'app');
const AXE = await readFile(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };
const SHOTS = arg('--shots'), QUICK = process.argv.includes('--quick');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
const srv = createServer(async (q, s) => {
  const p = decodeURIComponent(new URL(q.url, 'http://x').pathname);
  try { const b = await readFile(join(ROOT, p.endsWith('/') ? p + 'index.html' : p)); s.writeHead(200, { 'content-type': MIME[extname(p)] || 'text/html' }); s.end(b); }
  catch { s.writeHead(404); s.end(); }
}).listen(0);
const URL0 = `http://localhost:${srv.address().port}/`;

const DEVICES = { small: devices['Galaxy S8'], phone: devices['Pixel 7'], desktop: { viewport: { width: 1366, height: 800 } } };
const THEMES = QUICK ? ['light'] : ['light', 'dark'];
const issues = new Map();
const add = (k, v) => { if (!issues.has(k)) issues.set(k, v); };

const layout = () => {
  const o = [], W = innerWidth;
  if (document.documentElement.scrollWidth > W + 1) o.push(`overflow-x ${document.documentElement.scrollWidth}>${W}`);
  for (const el of document.querySelectorAll('button,a,input,select,.navbtn')) {
    const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
    if (!r.width || cs.visibility === 'hidden' || el.closest('.tablewrap,.skip')) continue;
    if (r.right > W + 1) o.push(`fuori schermo: ${(el.getAttribute('aria-label') || el.textContent || el.id).trim().slice(0, 25)}`);
  }
  const m = document.querySelector('.modal');
  if (m) { const r = m.getBoundingClientRect(); if (r.top < -1 || r.bottom > innerHeight + 1) o.push(`finestra fuori vista ${Math.round(r.top)}..${Math.round(r.bottom)}/${innerHeight}`); }
  return o;
};

async function check(page, tag) {
  for (const x of await page.evaluate(layout)) add(`${tag}: ${x}`, 1);
  await page.evaluate(AXE);
  const res = await page.evaluate(async () => (await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] })).violations
    .map(v => ({ id: v.id, n: v.nodes.length, el: v.nodes[0]?.target?.join(' ') || '', msg: (v.nodes[0]?.failureSummary || '').split('\n')[1]?.trim() || '' })));
  for (const v of res) add(`axe ${v.id}`, `${tag} · ${v.n}× · ${v.el.slice(0, 60)} · ${v.msg.slice(0, 90)}`);
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/${tag.replace(/\W+/g, '-')}.png` });
}

const browser = await chromium.launch();
for (const [dev, cfg] of Object.entries(DEVICES)) for (const theme of THEMES) {
  if (QUICK && dev === 'small') continue;
  const ctx = await browser.newContext({ ...cfg, locale: 'it-IT', colorScheme: theme, acceptDownloads: true });
  const page = await ctx.newPage(); const T = `${dev}/${theme}`;
  page.on('pageerror', e => add(`${T} JS: ${e.message}`, 1));
  page.on('console', m => m.type() === 'error' && add(`${T} console: ${m.text()}`, 1));
  const wait = ms => page.waitForTimeout(ms);
  await page.goto(URL0); await wait(1200);
  await page.evaluate(() => document.querySelector('#installBtn').classList.remove('hide'));
  // wizard
  for (let i = 0; i < 5; i++) {
    await check(page, `${T} wizard${i}`);
    if (i === 4) await page.check('#wAcc');
    await page.click('[data-w=next]'); await wait(600);
  }
  // tastiera: primo Tab = skip link
  await page.goto(URL0 + '#home'); await page.reload(); await wait(900);
  await page.keyboard.press('Tab');
  if (await page.evaluate(() => document.activeElement?.id) !== 'skipLink') add(`${T} tastiera: il primo Tab non porta al link "Vai al contenuto"`, 1);
  for (const v of ['home', 'organico', 'ferie', 'turni', 'storico', 'regole', 'info']) { await page.goto(URL0 + '#' + v); await wait(700); await check(page, `${T} ${v}`); }
  await page.goto(URL0 + '#turni'); await wait(400); await page.click('[data-act=gen]'); await wait(2500); await check(page, `${T} turni-piano`);
  // tastiera: Invio su una cella apre la finestra, Esc chiude e riporta il focus
  await page.focus('td.cell'); await page.keyboard.press('Enter'); await wait(500);
  if (!(await page.$('.modal[role=dialog]'))) add(`${T} tastiera: Invio su una cella non apre la finestra`, 1);
  else { await check(page, `${T} finestra-cella`); await page.keyboard.press('Escape'); await wait(400);
    if (!(await page.evaluate(() => document.activeElement?.classList.contains('cell')))) add(`${T} tastiera: Esc non riporta il focus sulla cella`, 1); }
  for (const [sel, name] of [['td.cov', 'copertura'], ['[data-act=xl]', 'excel'], ['[data-act=lang]', 'lingua'], ['[data-act=show-viol]', 'avvisi']]) {
    await page.click(sel); await wait(600); await check(page, `${T} finestra-${name}`); await page.keyboard.press('Escape'); await wait(300);
  }
  await page.goto(URL0 + '#organico'); await wait(400); await page.click('[data-act=staff-add]'); await wait(600); await check(page, `${T} finestra-persona`); await page.keyboard.press('Escape');
  await page.goto(URL0 + '#ferie'); await wait(400); await page.click('.btn.pri[data-act=leave-add]'); await wait(600); await check(page, `${T} finestra-assenza`);
  await ctx.close();
}
await browser.close(); srv.close();
if (!issues.size) { console.log('UI OK'); process.exit(0); }
for (const [k, v] of issues) console.log(v === 1 ? k : `${k} — ${v}`);
process.exit(1);
