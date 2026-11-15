#!/usr/bin/env node
// Audit di layout: telefono piccolo, telefono, desktop. Simula il pulsante Installa visibile.
// Controlla overflow orizzontale, pulsanti fuori schermo e finestre fuori vista in wizard, viste e modali.
// Uso: node tools/ui-audit.mjs [--shots dir]   → 'UI OK' oppure un problema per riga (exit 1).
import { chromium, devices } from 'playwright';
import { fileURLToPath } from 'node:url'; import { dirname, join as pj } from 'node:path';
import { createServer } from 'node:http'; import { readFile } from 'node:fs/promises'; import { join, extname } from 'node:path';
const root=pj(dirname(fileURLToPath(import.meta.url)),'..','app');const si=process.argv.indexOf('--shots');const out=si>0?process.argv[si+1]+'/':null;
const M={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2','.webmanifest':'application/manifest+json'};
const srv=createServer(async(q,s)=>{const p=decodeURIComponent(new URL(q.url,'http://x').pathname);try{const b=await readFile(join(root,p.endsWith('/')?p+'index.html':p));s.writeHead(200,{'content-type':M[extname(p)]||'text/html'});s.end(b)}catch{s.writeHead(404);s.end()}}).listen(0);
const U=`http://localhost:${srv.address().port}/`;
const b=await chromium.launch();
const cfgs={mob:{...devices['Pixel 7'],locale:'it-IT'},small:{...devices['Galaxy S8'],locale:'it-IT'},desk:{viewport:{width:1366,height:800},locale:'it-IT'}};
const issues=[];
const audit=async(pg,tag)=>{const r=await pg.evaluate(()=>{const o=[];const W=innerWidth;
 if(document.documentElement.scrollWidth>W+1)o.push('overflow-x '+document.documentElement.scrollWidth+'>'+W);
 for(const el of document.querySelectorAll('button,a,input,select,.navbtn')){const r=el.getBoundingClientRect();if(!r.width||getComputedStyle(el).visibility==='hidden')continue;if(r.right>W+1&&!el.closest('.tablewrap'))o.push('offscreen '+(el.textContent||el.id||el.tagName).trim().slice(0,25)+' r='+Math.round(r.right))}
 const m=document.querySelector('.modal');if(m){const r=m.getBoundingClientRect();if(r.top<0||r.bottom>innerHeight+1)o.push('modal out of view '+Math.round(r.top)+'..'+Math.round(r.bottom)+' vh='+innerHeight);const a=m.querySelector('.actions');if(a){const ar=a.getBoundingClientRect();if(ar.bottom>innerHeight+1&&m.scrollHeight<=m.clientHeight)o.push('actions hidden')}}
 return o});r.forEach(x=>issues.push(tag+': '+x))};
for(const [k,c] of Object.entries(cfgs)){
 const ctx=await b.newContext({...c,acceptDownloads:true});const pg=await ctx.newPage();
 pg.on('pageerror',e=>issues.push(k+' JS: '+e.message));pg.on('console',m=>m.type()==='error'&&issues.push(k+' console: '+m.text()));
 await pg.goto(U);await pg.waitForTimeout(1200);await pg.evaluate(()=>document.querySelector('#installBtn').classList.remove('hide'));
 for(let i=0;i<5;i++){await audit(pg,k+' wiz'+i);(out&&await pg.screenshot({path:out+k+'-wiz'+i+'.png'}));if(i===1){await pg.click('[data-l=de]');await pg.waitForTimeout(300);await pg.click('[data-l=it]');await pg.waitForTimeout(300)}if(i===4)await pg.check('#wAcc');await pg.click('[data-w=next]');await pg.waitForTimeout(600)}
 for(const v of ['home','organico','ferie','turni','storico','regole','info']){await pg.goto(U+'#'+v);await pg.waitForTimeout(700);await audit(pg,k+' '+v);(out&&await pg.screenshot({path:out+k+'-'+v+'.png',fullPage:true}))}
 await pg.goto(U+'#turni');await pg.waitForTimeout(400);await pg.click('[data-act=gen]');await pg.waitForTimeout(2500);await audit(pg,k+' turni-gen');(out&&await pg.screenshot({path:out+k+'-turni-gen.png'}));
 for(const [sel,name] of [['td.cell','cell'],['td.cov','cov'],['[data-act=xl]','xl'],['[data-act=lang]','lang'],['[data-act=show-viol]','viol']]){await pg.click(sel);await pg.waitForTimeout(600);await audit(pg,k+' modal-'+name);(out&&await pg.screenshot({path:out+k+'-modal-'+name+'.png'}));await pg.keyboard.press('Escape');await pg.waitForTimeout(300)}
 await pg.goto(U+'#organico');await pg.waitForTimeout(400);await pg.click('[data-act=staff-add]');await pg.waitForTimeout(600);await audit(pg,k+' modal-staff');(out&&await pg.screenshot({path:out+k+'-modal-staff.png'}));await pg.keyboard.press('Escape');
 await pg.goto(U+'#ferie');await pg.waitForTimeout(400);await pg.click('.btn.pri[data-act=leave-add]');await pg.waitForTimeout(600);await audit(pg,k+' modal-leave');(out&&await pg.screenshot({path:out+k+'-modal-leave.png'}));
 await ctx.close()}
await b.close();srv.close();const u=[...new Set(issues)];console.log(u.join('\n')||'UI OK');process.exit(u.length?1:0);
