#!/usr/bin/env node
// Confronta ogni glifo del font con l'SVG sorgente (render 96 px) e controlla centratura.
// Uso: node tools/icon-check.mjs [--shots dir]   -> una riga per icona fuori tolleranza.
import { chromium } from 'playwright';
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cps = JSON.parse(fs.readFileSync(root + '/design/icons/codepoints.json', 'utf8'));
const font = fs.readFileSync(root + '/app/fonts/turnotto-icons.woff2').toString('base64');
const svgs = {}; for (const n in cps) svgs[n] = 'data:image/svg+xml;base64,' + fs.readFileSync(`${root}/design/icons/${n}.svg`).toString('base64');
const shots = process.argv.includes('--shots') ? process.argv[process.argv.indexOf('--shots') + 1] : null;
const b = await chromium.launch(); const pg = await b.newPage();
await pg.setContent(`<style>@font-face{font-family:TI;src:url(data:font/woff2;base64,${font})}</style><span style="font-family:TI">x</span>`);
await pg.evaluate(() => document.fonts.load('96px TI'));
const res = await pg.evaluate(async ({ cps, svgs, shots }) => {
  const S = 96, out = {};
  const bbox = d => { let x0 = S, y0 = S, x1 = -1, y1 = -1, n = 0; for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) if (d[(y * S + x) * 4 + 3] > 128) { n++; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y } return { x0, y0, x1, y1, n } };
  for (const n in cps) {
    const img = new Image(); img.src = svgs[n]; await img.decode();
    const a = document.createElement('canvas'); a.width = a.height = S; const A = a.getContext('2d'); A.drawImage(img, 0, 0, S, S);
    const c = document.createElement('canvas'); c.width = c.height = S; const C = c.getContext('2d'); C.font = `${S}px TI`; C.textBaseline = 'alphabetic'; C.fillText(String.fromCodePoint(cps[n]), 0, S * .85);
    const da = A.getImageData(0, 0, S, S).data, dc = C.getImageData(0, 0, S, S).data;
    let diff = 0, on = 0; for (let i = 3; i < da.length; i += 4) { const p = da[i] > 128, q = dc[i] > 128; if (p || q) on++; if (p !== q) diff++ }
    out[n] = { diff: +(diff / Math.max(1, on)).toFixed(3), a: bbox(da), c: bbox(dc), png: shots ? [a.toDataURL(), c.toDataURL()] : null };
  }
  return out;
}, { cps, svgs, shots: !!shots });
let bad = 0;
for (const [n, r] of Object.entries(res)) {
  const cx = (r.c.x0 + r.c.x1) / 2, cy = (r.c.y0 + r.c.y1) / 2, ax = (r.a.x0 + r.a.x1) / 2, ay = (r.a.y0 + r.a.y1) / 2;
  const m = []; if (r.diff > .14) m.push('diff ' + r.diff); if (Math.abs(cx - ax) > 1.5 || Math.abs(cy - ay) > 1.5) m.push(`shift ${(cx - ax).toFixed(1)},${(cy - ay).toFixed(1)}`);
  if (r.c.x0 < 6 || r.c.y0 < 6 || r.c.x1 > 89 || r.c.y1 > 89) m.push('margin');
  if (Math.abs(cx - 47.5) > 6 || Math.abs(cy - 47.5) > 6) m.push(`off-center ${cx.toFixed(0)},${cy.toFixed(0)}`);
  if (m.length) { bad++; console.log(n, m.join(' · ')) }
  if (shots) { fs.mkdirSync(shots, { recursive: true }); for (const k of [0, 1]) fs.writeFileSync(`${shots}/${n}.${k ? 'font' : 'svg'}.png`, Buffer.from(r.png[k].split(',')[1], 'base64')) }
}
console.log(bad ? `${bad} icone da correggere` : `ICONS OK (${Object.keys(res).length})`);
await b.close();
