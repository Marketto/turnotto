'use strict';
/* =========================================================
   Turnotto — PWA senza backend, multilingua.
   Dati in localStorage + file JSON. Testi in lang/<code>.json
   ========================================================= */
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const uid=()=>Math.random().toString(36).slice(2,10);
const h=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');

/* ---------------- i18n ---------------- */
const LANGS={
  bg:'Български',ca:'Català',cs:'Čeština',da:'Dansk',de:'Deutsch',el:'Ελληνικά',en:'English',es:'Español',et:'Eesti',fi:'Suomi',fr:'Français',ga:'Gaeilge',
  hr:'Hrvatski',hu:'Magyar',is:'Íslenska',it:'Italiano',lb:'Lëtzebuergesch',lt:'Lietuvių',lv:'Latviešu',mk:'Македонски',mt:'Malti',nb:'Norsk',nl:'Nederlands',
  pl:'Polski',pt:'Português',ro:'Română',ru:'Русский',sk:'Slovenčina',sl:'Slovenščina',sq:'Shqip',sr:'Српски',sv:'Svenska',tr:'Türkçe',uk:'Українська',
  be:'Беларуская',bs:'Bosanski',ja:'日本語',ko:'한국어',zh:'中文'};
const LOCALE={zh:'zh-CN',nb:'nb-NO',sr:'sr-Cyrl-RS',pt:'pt-PT',en:'en-GB',ga:'ga-IE',mt:'mt-MT',lb:'lb-LU',bs:'bs-BA'};
const LKEY='turnotto.lang';
let LANG='en',DICT={},EN={};
const loc=()=>LOCALE[LANG]||LANG;
function t(k,p){let s=DICT[k]??EN[k]??k;if(p)s=s.replace(/\{(\w+)\}/g,(m,x)=>p[x]??m);return s}
function detectLang(){let s=null;try{s=localStorage.getItem(LKEY)}catch(e){}if(s&&LANGS[s])return s;
  for(const l of navigator.languages||[navigator.language||'en']){let c=l.toLowerCase().split('-')[0];if(c==='no'||c==='nn')c='nb';if(c==='sh'||c==='hbs')c='sr';if(c==='cnr')c='sr';if(LANGS[c])return c}return 'en'}
async function fetchJson(u){const r=await fetch(u);if(!r.ok)throw new Error(u);return r.json()}
async function setLang(code,persist){
  try{EN=Object.keys(EN).length?EN:await fetchJson('lang/en.json')}catch(e){EN={}}
  try{DICT=code==='en'?EN:await fetchJson(`lang/${code}.json`);LANG=code}catch(e){DICT=EN;LANG='en'}
  if(persist)try{localStorage.setItem(LKEY,LANG)}catch(e){}
  document.documentElement.lang=LANG;buildDates();
  $('#langCode').textContent=LANG.toUpperCase();
  $$('[data-t]').forEach(el=>el.textContent=t(el.dataset.t));
  for(const[id,k]of[['tipSave','tip.saveFile'],['tipOpen','tip.openFile'],['tipInfo','tip.info'],['installBtn','btn.install']]){const e=$('#'+id);e.title=t(k);e.setAttribute('aria-label',t(k))}$('#langBtn').title=t('lang.title');$('#langBtn').setAttribute('aria-label',`${t('lang.title')} ${LANG.toUpperCase()}`);$('#skipLink').textContent=t('a11y.skip');for(const n of['#botnav','#sidenav'])$(n).setAttribute('aria-label',t('a11y.nav'));
}
/* date helpers (Intl: nomi di giorni e mesi in ogni lingua) */
let DAYS=[],DAYS_L=[];
function buildDates(){const mon=new Date(2024,0,1);const fs=new Intl.DateTimeFormat(loc(),{weekday:'short'}),fl=new Intl.DateTimeFormat(loc(),{weekday:'long'});
  DAYS=[];DAYS_L=[];for(let i=0;i<7;i++){const d=new Date(2024,0,1+i);DAYS.push(fs.format(d).replace(/\.$/,''));DAYS_L.push(cap(fl.format(d)))}}
const cap=s=>s.charAt(0).toLocaleUpperCase(loc())+s.slice(1);
const keyOf=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const parseDate=k=>{const[y,m,d]=k.split('-').map(Number);return new Date(y,m-1,d)};
const addDays=(d,n)=>{const x=new Date(d.getFullYear(),d.getMonth(),d.getDate());x.setDate(x.getDate()+n);return x};
const diffDays=(a,b)=>Math.round((Date.UTC(b.getFullYear(),b.getMonth(),b.getDate())-Date.UTC(a.getFullYear(),a.getMonth(),a.getDate()))/864e5);
const wdOf=d=>(d.getDay()+6)%7;
const fmtD=d=>new Intl.DateTimeFormat(loc(),{day:'2-digit',month:'2-digit'}).format(d);
const fmtDY=d=>new Intl.DateTimeFormat(loc(),{day:'2-digit',month:'2-digit',year:'numeric'}).format(d);
const fmtDT=ms=>new Intl.DateTimeFormat(loc(),{dateStyle:'short',timeStyle:'short'}).format(new Date(ms));
const monthTitle=d=>cap(new Intl.DateTimeFormat(loc(),{month:'long',year:'numeric'}).format(d));
const toMin=tm=>{if(!tm)return 0;const[a,b]=tm.split(':').map(Number);return a*60+(b||0)};
const fmtH=m=>new Intl.NumberFormat(loc(),{maximumFractionDigits:1}).format(Math.round(m/6)/10);
const initials=n=>(n||'?').trim().split(/\s+/).map(x=>[...x][0]||'').slice(0,2).join('').toUpperCase();
const today=()=>{const d=new Date();return new Date(d.getFullYear(),d.getMonth(),d.getDate())};
function nextMonday(){const d=today(),w=wdOf(d);return addDays(d,w===0?0:7-w)}
const PALETTE=['#FF8FB1','#B8A6FF','#7FDDBF','#FFB86B','#7CC4FF','#F7A1E0','#9BD86B','#FF9C8A','#8FA8FF','#FFC94D','#66D1D1','#C49BFF'];
const LT={ferie:{e:'🏖️',c:'#FFC94D'},permesso:{e:'⏰',c:'#7CC4FF'},malattia:{e:'🤒',c:'#FF8FB1'},altro:{e:'📌',c:'#7FDDBF'}};
const ltName=k=>t('lt.'+(LT[k]?k:'altro'));const ltEmo=k=>(LT[k]||LT.altro).e;/* emoji: solo per Excel */const LT_IC={ferie:'beach',permesso:'clock',malattia:'thermo',altro:'pin'};const ltIc=k=>ic(LT_IC[k]||'pin');
const ic=n=>`<i class="i i-${n}" aria-hidden="true"></i>`;
const reduceMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const plain=s=>String(s).replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();
const shiftName=sh=>sh?(sh.name||t(sh.nameKey||'')):'';

/* ---------------- tema ---------------- */
const TKEY='turnotto.theme';
const getTheme=()=>{try{return localStorage.getItem(TKEY)||'auto'}catch(e){return 'auto'}};
function setTheme(v){try{localStorage.setItem(TKEY,v)}catch(e){}applyTheme()}
function applyTheme(){const v=getTheme(),root=document.documentElement;if(v==='auto')delete root.dataset.theme;else root.dataset.theme=v;
  const dark=v==='dark'||(v==='auto'&&matchMedia('(prefers-color-scheme: dark)').matches);document.querySelector('meta[name=theme-color]').content=dark?'#1B1626':'#FFB3CC'}
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change',applyTheme);

/* ---------------- state ---------------- */
const KEY='turnotto.v1',OLDKEYS=['hootora.v1','gufoturni.v1'];
function defaultSettings(){return{
  maxConsecutive:9,minRest:11,minWeeklyRest:24,minBiweeklyRest:48,maxWeekly:48,maxBiweekly:88,overtime:8,fill:true,sv:2,xlTheme:'kawaii',
  shifts:[
    {id:'m',name:'',nameKey:'shift.m',emoji:'🌅',start:'06:00',end:'14:00',color:'#FFD6A5',need:[2,2,2,2,2,1,1]},
    {id:'p',name:'',nameKey:'shift.p',emoji:'🌤️',start:'14:00',end:'22:00',color:'#A0D8FF',need:[2,2,2,2,2,1,1]},
    {id:'n',name:'',nameKey:'shift.n',emoji:'🌙',start:'22:00',end:'06:00',color:'#CDB8FF',need:[1,1,1,1,1,1,1]}
  ]}}
function demoData(){
  const C=t('demo.coord'),O=t('demo.op'),P=t('demo.pt');
  const names=[['Giulia Rossi',C,40],['Marco Bianchi',O,40],['Sara Conti',O,38],['Luca Ferri',O,36],['Elena Greco',O,30],['Paolo Riva',O,30],['Chiara Leone',P,24],['Davide Sala',P,20],['Anna Moretti',O,32]];
  const staff=names.map(([name,role,hours],i)=>({id:uid(),name,role,hours,color:PALETTE[i%PALETTE.length],offDays:[],slots:[],noShifts:[],note:''}));
  staff[1].noShifts=['n'];staff[6].offDays=[5,6];staff[7].slots=[{day:-1,from:'00:00',to:'09:00'}];staff[4].offDays=[2];
  const nm=nextMonday();
  const leaves=[{id:uid(),staffId:staff[2].id,type:'ferie',from:keyOf(addDays(nm,2)),to:keyOf(addDays(nm,4)),full:true,hFrom:'',hTo:'',note:t('demo.trip')},
                {id:uid(),staffId:staff[3].id,type:'permesso',from:keyOf(addDays(nm,8)),to:keyOf(addDays(nm,8)),full:false,hFrom:'08:00',hTo:'12:00',note:t('demo.visit')}];
  return{staff,leaves};
}
function freshState(demo=true){const d=demo?demoData():{staff:[],leaves:[]};return{v:1,staff:d.staff,leaves:d.leaves,settings:defaultSettings(),plans:[],current:null,demo,ui:{}}}
let state;
function migrateShifts(arr){for(const sh of arr||[]){if(sh.nameKey===undefined){const k={Mattina:'shift.m',Pomeriggio:'shift.p',Notte:'shift.n'}[sh.name];if(k&&['m','p','n'].includes(sh.id)){sh.nameKey=k;sh.name=''}}}}
function load(){try{let raw=localStorage.getItem(KEY);if(!raw)for(const k of OLDKEYS){raw=localStorage.getItem(k);if(raw)break}
  if(raw){state=JSON.parse(raw);const os=state.settings||{};state.settings={...defaultSettings(),...os};if(!(os.sv>=2)){state.settings.overtime=8;state.settings.fill=true;state.settings.sv=2}state.ui=state.ui||{};state.plans=state.plans||[];
    migrateShifts(state.settings.shifts);state.plans.forEach(p=>migrateShifts(p.shifts));if(state.current)migrateShifts(state.current.shifts);return}}catch(e){}
  state=freshState(true)}
let saveT;function save(){clearTimeout(saveT);saveT=setTimeout(()=>{try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){toast(t('storage.full'))}},150)}
const staffById=id=>state.staff.find(p=>p.id===id);

/* ---------------- owl ---------------- */
function owl(size=120,cls=''){return `<svg class="owl ${cls}" width="${size}" height="${size*1.15}" viewBox="-175 -215 350 405" aria-hidden="true"><g class="ob">
<ellipse cx="0" cy="182" rx="110" ry="10" fill="#6F5BC2" opacity=".12"/>
<ellipse class="wing wl" cx="-136" cy="40" rx="32" ry="72" fill="#7C68CC"/>
<ellipse class="wing wr" cx="136" cy="40" rx="32" ry="72" fill="#7C68CC"/>
<path d="M-120 -112 L-96 -192 L-46 -138 Z" fill="#6F5BC2"/><path d="M120 -112 L96 -192 L46 -138 Z" fill="#6F5BC2"/>
<ellipse rx="148" ry="160" fill="#8E7BD9"/>
<ellipse cy="-30" rx="148" ry="120" fill="#9A88E0" opacity=".5"/>
<ellipse cy="72" rx="92" ry="80" fill="#F3E9FF"/>
<path d="M-40 52 q10 12 20 0 M-10 82 q10 12 20 0 M20 52 q10 12 20 0 M-26 112 q8 9 16 0 M10 112 q8 9 16 0" stroke="#CDB8F5" stroke-width="7" fill="none" stroke-linecap="round"/>
<circle cx="-62" cy="-50" r="64" fill="#fff"/><circle cx="62" cy="-50" r="64" fill="#fff"/>
<g class="pupils"><g class="pupil"><circle cx="-58" cy="-46" r="40" fill="#2E2445"/><circle cx="-44" cy="-62" r="14" fill="#fff"/><circle cx="-68" cy="-30" r="6" fill="#fff"/></g>
<g class="pupil"><circle cx="58" cy="-46" r="40" fill="#2E2445"/><circle cx="72" cy="-62" r="14" fill="#fff"/><circle cx="48" cy="-30" r="6" fill="#fff"/></g></g>
<ellipse class="lid" cx="-62" cy="-50" rx="66" ry="66" fill="#8E7BD9"/><ellipse class="lid" cx="62" cy="-50" rx="66" ry="66" fill="#8E7BD9"/>
<path d="M-17 -4 L17 -4 L0 24 Z" fill="#FFB86B" stroke="#F29A45" stroke-width="5" stroke-linejoin="round"/>
<ellipse class="cheek" cx="-112" cy="12" rx="20" ry="13" fill="#FF8FB1" opacity=".65"/><ellipse class="cheek" cx="112" cy="12" rx="20" ry="13" fill="#FF8FB1" opacity=".65"/>
<g fill="#FFB86B"><ellipse cx="-42" cy="160" rx="24" ry="11"/><ellipse cx="42" cy="160" rx="24" ry="11"/></g>
</g></svg>`}
document.addEventListener('pointermove',e=>{
  for(const svg of $$('.owl:not(.think)')){const r=svg.getBoundingClientRect();if(!r.width)continue;
    const cx=r.left+r.width/2,cy=r.top+r.height*0.33,dx=e.clientX-cx,dy=e.clientY-cy,d=Math.hypot(dx,dy)||1,k=Math.min(1,d/300)*16;
    svg.querySelector('.pupils').setAttribute('transform',`translate(${(dx/d*k).toFixed(1)} ${(dy/d*k).toFixed(1)})`)}
},{passive:true});
function owlJump(){for(const o of $$('.owl')){o.classList.remove('jump');requestAnimationFrame(()=>o.classList.add('jump'));setTimeout(()=>o.classList.remove('jump'),1900)}}
const TIP_IC=['owl','save','edit','search','sheet','sleep','sparkle'];
const randTip=()=>{const i=Math.floor(Math.random()*7);return `${t('tips.'+i)} ${ic(TIP_IC[i])}`};

/* ---------------- deco / confetti ---------------- */
(()=>{const em=['sparkle','heart','star','flower','cloud','heart','moon','sparkle'];let s='';for(let i=0;i<14;i++){s+=`<i style="left:${Math.random()*100}%;top:${Math.random()*100}%;font-size:${14+Math.random()*20}px;animation-delay:-${Math.random()*14}s;animation-duration:${10+Math.random()*10}s" class="i i-${em[i%em.length]}"></i>`}$('#bgdeco').innerHTML=s})();
function confetti(){if(reduceMotion())return;const c=$('#confetti'),x=c.getContext('2d');c.width=innerWidth*devicePixelRatio;c.height=innerHeight*devicePixelRatio;x.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
  const cols=['#FF8FB1','#B8A6FF','#7FDDBF','#FFC94D','#7CC4FF'],P=[];for(let i=0;i<140;i++)P.push({x:innerWidth/2+(Math.random()-.5)*120,y:innerHeight*.45,vx:(Math.random()-.5)*14,vy:-Math.random()*14-4,r:Math.random()*6+4,c:cols[i%5],a:Math.random()*6,va:(Math.random()-.5)*.3,t:Math.random()<.3?'h':Math.random()<.5?'s':'c'});
  let f=0;(function tick(){x.clearRect(0,0,innerWidth,innerHeight);for(const p of P){p.vy+=.35;p.vx*=.99;p.x+=p.vx;p.y+=p.vy;p.a+=p.va;x.save();x.translate(p.x,p.y);x.rotate(p.a);x.fillStyle=p.c;
    if(p.t==='h'){x.font=`${p.r*3}px 'Turnotto Icons'`;x.fillText('\ue910',0,0)}else if(p.t==='s'){x.beginPath();for(let k=0;k<5;k++){x.lineTo(Math.cos((18+k*72)/180*Math.PI)*p.r,-Math.sin((18+k*72)/180*Math.PI)*p.r);x.lineTo(Math.cos((54+k*72)/180*Math.PI)*p.r/2,-Math.sin((54+k*72)/180*Math.PI)*p.r/2)}x.fill()}else{x.fillRect(-p.r/2,-p.r/4,p.r,p.r/2)}x.restore()}
    if(++f<150)requestAnimationFrame(tick);else x.clearRect(0,0,innerWidth,innerHeight)})()}

/* ---------------- toast / modal ---------------- */
let toastT;function toast(msg){$('.toast')?.remove();const el=document.createElement('div');el.className='toast';el.setAttribute('aria-hidden','true');el.innerHTML=`${owl(30)}<span>${msg}</span>`;const lv=$('#live');lv.textContent='';setTimeout(()=>lv.textContent=plain(msg),50);document.body.appendChild(el);clearTimeout(toastT);toastT=setTimeout(()=>el.remove(),2800)}
let dlgN=0;const FOCUSABLE='button:not([disabled]),[href],input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"]),summary';
function modal(title,body,{onMount,wide,label}={}){const bg=document.createElement('div');bg.className='modal-bg';const id='dlg'+(++dlgN);
  bg.innerHTML=`<div class="modal" role="dialog" aria-modal="true" ${title?`aria-labelledby="${id}"`:`aria-label="${h(label||'')}"`} style="${wide?'max-width:820px':''}">${title?`<h2 class="mtitle" id="${id}">${title}</h2>`:''}${body}</div>`;
  bg._ret=document.activeElement;bg.addEventListener('click',e=>{if(e.target===bg)closeModal(bg)});$('#modals').appendChild(bg);$('#view').setAttribute('aria-hidden','true');
  const m=bg.querySelector('.modal');onMount&&onMount(m,()=>closeModal(bg));
  setTimeout(()=>{const f=[...m.querySelectorAll(FOCUSABLE)].find(e=>e.offsetParent);(f||m).focus({preventScroll:true})},60);return bg}
document.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const bg=$('#modals .modal-bg:last-child');if(!bg)return;const f=[...bg.querySelectorAll(FOCUSABLE)].filter(x=>x.offsetParent);if(!f.length)return;
  const a=f[0],z=f[f.length-1];if(!bg.contains(document.activeElement)){e.preventDefault();a.focus()}else if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}});
function closeModal(bg,force){bg=bg||$('#modals .modal-bg:last-child');if(!bg||(bg.dataset.lock&&!force))return;bg.classList.add('closing');const r=bg._ret;setTimeout(()=>{bg.remove();if(!$('#modals .modal-bg'))$('#view').removeAttribute('aria-hidden');if(r&&document.contains(r))r.focus({preventScroll:true})},190)}
function ask(msg,{ok,cancel,danger=false}={}){return new Promise(res=>{modal('',`<p style="font-weight:700">${msg}</p><div class="actions"><button class="btn ghost" data-r="0">${cancel||t('btn.cancel')}</button><button class="btn ${danger?'pri':'lav'}" data-r="1">${ok||t('btn.yes')}</button></div>`,{label:t('btn.yes'),onMount(m,close){m.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{close();res(b.dataset.r==='1')})}})})}

/* ---------------- nav ---------------- */
const NAV=[['home','home','nav.home'],['organico','team','nav.staff'],['ferie','beach','nav.leave'],['turni','calendar','nav.shifts'],['storico','book','nav.history'],['regole','gear','nav.rules']];
function renderNav(){const r=route();const html=NAV.map(([k,i,l])=>`<button class="navbtn ${r===k?'on':''}" data-go="${k}"${r===k?' aria-current="page"':''}><span class="ic">${ic(i)}</span><span>${t(l)}</span></button>`).join('');
  $('#botnav').innerHTML=html;$('#sidenav').innerHTML=html+`<div class="sideowl" aria-hidden="true">${owl(110)}</div>`}
const route=()=>{const r=(location.hash||'#home').slice(1);return NAV.some(n=>n[0]===r)||r==='info'?r:'home'};
function go(r){if(location.hash!=='#'+r)location.hash=r;else render()}
addEventListener('hashchange',()=>{if(state)render()});

/* =========================================================
   SCHEDULER
   ========================================================= */
function shiftSpan(sh){let s=toMin(sh.start),e=toMin(sh.end);if(e<=s)e+=1440;return[s,e]}
const planDays=p=>+p.days||p.weeks*7;
function makeCtx(plan){
  const start=parseDate(plan.start),nDays=planDays(plan),leaves={},lraw={};
  for(const l of state.leaves){
    const a=diffDays(start,parseDate(l.from)),b=diffDays(start,parseDate(l.to||l.from));
    if(b<-1||a>nDays)continue;
    const arr=leaves[l.staffId]||(leaves[l.staffId]=[]);(lraw[l.staffId]||(lraw[l.staffId]=[])).push({a,b,l});
    if(l.full!==false)arr.push({s:a*1440,e:(b+1)*1440});
    else for(let d=a;d<=b;d++){let x=toMin(l.hFrom),y=toMin(l.hTo);if(y<=x)y+=1440;arr.push({s:d*1440+x,e:d*1440+y})}
  }
  return{start,nDays,weeks:Math.ceil(nDays/7),wd0:wdOf(start),leaves,lraw,tg:{},ot:Math.max(0,+plan.ot||0)*60,shifts:plan.shifts,shiftMap:Object.fromEntries(plan.shifts.map(s=>[s.id,s]))};
}
const wdAt=(ctx,d)=>(((ctx.wd0+d)%7)+7)%7;
function slotOf(a,ctx){const sh=ctx.shiftMap[a.shiftId];if(!sh)return null;const[s,e]=shiftSpan(sh);return{d:a.d,wd:wdAt(ctx,a.d),shiftId:a.shiftId,s:a.d*1440+s,e:a.d*1440+e,dur:e-s}}
function buildSlots(ctx){const out=[];for(let d=0;d<ctx.nDays;d++){const wd=wdAt(ctx,d);for(const sh of ctx.shifts){const n=+sh.need[wd]||0;const[s,e]=shiftSpan(sh);for(let k=0;k<n;k++)out.push({d,wd,shiftId:sh.id,s:d*1440+s,e:d*1440+e,dur:e-s,k})}}return out.sort((a,b)=>a.s-b.s||a.e-b.e)}
function maxGap(list,ws,we){const iv=list.filter(x=>x.e>ws&&x.s<we).map(x=>[Math.max(ws,x.s),Math.min(we,x.e)]).sort((a,b)=>a[0]-b[0]);let cur=ws,g=0;for(const[s,e]of iv){g=Math.max(g,s-cur);cur=Math.max(cur,e)}return Math.max(g,we-cur)}
/* ore di contratto del piano, al netto di ferie e permessi.
   Settimana: ore settimanali × giorni del piano in quella settimana / 7.
   Ogni giorno di assenza (non di riposo fisso) vale ore settimanali ÷ giorni lavorativi; un permesso vale le sue ore. */
function tgtOf(p,ctx){
  if(ctx.tg[p.id])return ctx.tg[p.id];
  const H=(+p.hours||0)*60,nd=Math.max(1,Math.min(7,+p.days||5)),dv=H/nd,off=p.offDays||[];
  const wk=Array.from({length:ctx.weeks},(_,w)=>H*Math.min(7,ctx.nDays-7*w)/7),ded=wk.map(()=>0);let lv=0;
  for(let d=0;d<ctx.nDays;d++){if(off.includes(wdAt(ctx,d)))continue;let full=false,mins=0;
    for(const{a,b,l}of ctx.lraw[p.id]||[]){if(d<a||d>b)continue;if(l.full!==false)full=true;else{let x=toMin(l.hFrom),y=toMin(l.hTo);if(y<=x)y+=1440;mins+=y-x}}
    const w=Math.floor(d/7);if(full){ded[w]+=dv;lv++}else if(mins)ded[w]+=Math.min(dv,mins)}
  for(let w=0;w<wk.length;w++)wk[w]=Math.max(0,wk[w]-ded[w]);
  return ctx.tg[p.id]={tot:wk.reduce((a,b)=>a+b,0),wk,lv};
}
function targetMin(p,ctx){return tgtOf(p,ctx).tot}
/* '' se ok, altrimenti il motivo. noTot: salta il controllo sul totale del piano (lo fa analyze in ordine cronologico) */
function check(p,sl,list,ctx,noTot){
  const S=state.settings;
  if((p.noShifts||[]).includes(sl.shiftId))return t('r.excluded',{shift:shiftName(ctx.shiftMap[sl.shiftId])});
  if((p.offDays||[]).includes(sl.wd))return t('r.dayOff',{day:DAYS_L[sl.wd]});
  for(const u of p.slots||[])for(let dd=sl.d-1;dd<=sl.d+1;dd++){if(u.day!==-1&&+u.day!==wdAt(ctx,dd))continue;let a=toMin(u.from),b=toMin(u.to);if(b<=a)b+=1440;a+=dd*1440;b+=dd*1440;if(sl.s<b&&a<sl.e)return t('r.slot',{from:u.from,to:u.to})}
  for(const iv of ctx.leaves[p.id]||[])if(sl.s<iv.e&&iv.s<sl.e)return t('r.leave');
  for(const x of list)if(sl.s<x.e&&x.s<sl.e)return t('r.overlap');
  if(!noTot){const tg=tgtOf(p,ctx).tot;let tot=sl.dur;for(const x of list)tot+=x.dur;if(tot>tg+ctx.ot)return ctx.ot?t('r.ot',{h:fmtH(ctx.ot)}):t('r.contract',{h:fmtH(tg)})}
  let bs=sl.s,be=sl.e,ch=true;while(ch){ch=false;for(const x of list){if(x.e>=bs&&x.s<=be&&(x.s<bs||x.e>be)){bs=Math.min(bs,x.s);be=Math.max(be,x.e);ch=true}}}
  if(be-bs>S.maxConsecutive*60)return t('r.consec',{h:S.maxConsecutive});
  for(const x of list){if(x.e<bs&&bs-x.e<S.minRest*60)return t('r.rest',{h:S.minRest});if(x.s>be&&x.s-be<S.minRest*60)return t('r.rest',{h:S.minRest})}
  const w=Math.floor(sl.d/7);let wsum=sl.dur;for(const x of list)if(Math.floor(x.d/7)===w)wsum+=x.dur;
  if(wsum>S.maxWeekly*60)return t('r.week',{h:S.maxWeekly});
  const q=Math.floor(sl.d/14);let qsum=sl.dur;for(const x of list)if(Math.floor(x.d/14)===q)qsum+=x.dur;
  if(qsum>S.maxBiweekly*60)return t('r.biweek',{h:S.maxBiweekly});
  const all=list.concat([sl]);
  if(S.minWeeklyRest>0&&ctx.nDays>=(w+1)*7&&maxGap(all,w*7*1440,(w+1)*7*1440)<S.minWeeklyRest*60)return t('r.weekRest',{h:S.minWeeklyRest});
  if(S.minBiweeklyRest>0&&ctx.nDays>=(q+1)*14&&maxGap(all,q*14*1440,(q+1)*14*1440)<S.minBiweeklyRest*60)return t('r.biRest',{h:S.minBiweeklyRest});
  return '';
}
const sumDur=l=>l.reduce((a,x)=>a+x.dur,0);
/* opt.ot: ore di straordinario autorizzate a persona (0 = nessuna) */
function generate(plan,opt={}){
  /* se qualcuno resta sotto contratto di almeno un turno, riprova con altri tentativi casuali (max 4 giri) */
  let best=null;for(let r=0;r<4;r++){const res=genOnce(plan,{...opt,tries:r?40:opt.tries});if(!best||res.unc*1e4+res.shortMin<best.unc*1e4+best.shortMin)best=res;if(!best.short)break}
  return best;
}
function genOnce(plan,{tries=90,ot=+plan.ot||0}={}){
  const ctx=makeCtx({...plan,ot}),slots=buildSlots(ctx),staff=state.staff;let best=null;
  for(let tr=0;tr<tries;tr++){
    const L={};staff.forEach(p=>L[p.id]=[]);const unc=[];const noise=tr===0?0.02:0.12+0.5*(tr/tries);
    for(const sl of slots){
      let bp=null,bsc=Infinity;
      for(const p of staff){
        if(L[p.id].some(x=>x.d===sl.d&&x.shiftId===sl.shiftId))continue;
        if(check(p,sl,L[p.id],ctx))continue;
        const tg=tgtOf(p,ctx),done=sumDur(L[p.id]),w=Math.floor(sl.d/7);
        const wd=L[p.id].reduce((a,x)=>a+(Math.floor(x.d/7)===w?x.dur:0),0);
        let sc=(done+sl.dur)/Math.max(60,tg.tot)+0.6*(wd+sl.dur)/Math.max(60,tg.wk[w])+Math.random()*noise;
        if(done+sl.dur>tg.tot)sc+=10+(done+sl.dur-tg.tot)/60; /* straordinario solo se nessun altro può */
        const prev=L[p.id].find(x=>x.d===sl.d-1);if(prev&&prev.shiftId===sl.shiftId)sc-=0.06;
        if(sc<bsc){bsc=sc;bp=p}
      }
      if(bp)L[bp.id].push(sl);else unc.push(sl);
    }
    let dev=0,over=0;for(const p of staff){const tg=tgtOf(p,ctx).tot,done=sumDur(L[p.id]);dev+=Math.abs(tg-done)/Math.max(60,tg);over+=Math.max(0,done-tg)}
    const score=unc.length*1000+over/6+dev*10;
    if(!best||score<best.score)best={score,unc,L};
  }
  const L=best.L,unc=best.unc.length-repair(best,ctx,staff);
  if(state.settings.fill!==false)fill(L,ctx,staff);
  const asg=[];for(const p of staff)for(const x of L[p.id])asg.push({d:x.d,shiftId:x.shiftId,staffId:p.id});
  const minDur=Math.min(...ctx.shifts.map(sh=>{const[x,y]=shiftSpan(sh);return y-x}));const gaps=staff.map(p=>tgtOf(p,ctx).tot-sumDur(L[p.id])).filter(g=>g>=minDur),short=gaps.length,shortMin=gaps.reduce((a,b)=>a+b,0);
  const otMin=staff.reduce((a,p)=>a+Math.max(0,sumDur(L[p.id])-tgtOf(p,ctx).tot),0);
  return{asg,unc,short,shortMin,otMin};
}
/* riparazione: per ogni posto scoperto prova a spostare un turno a un'altra persona. Ritorna quanti ne ha coperti */
function repair(best,ctx,staff){
  const L=best.L;let fixed=0;
  const can=(p,sl,list)=>!list.some(x=>x.d===sl.d&&x.shiftId===sl.shiftId)&&!check(p,sl,list,ctx);
  for(const sl of best.unc){let done=false;
    for(const q of staff){if(done)break;const ql=L[q.id];if(ql.some(x=>x.d===sl.d&&x.shiftId===sl.shiftId))continue;
      for(let i=0;i<ql.length&&!done;i++){const mv=ql[i];const rest=ql.filter((_,j)=>j!==i);if(!can(q,sl,rest))continue;
        for(const r of staff){if(r===q)continue;if(can(r,mv,L[r.id])){L[q.id]=rest.concat([sl]);L[r.id].push(mv);done=true;fixed++;break}}}}}
  return fixed;
}
/* completamento ore: chi è sotto contratto riceve turni di rinforzo (solo turni attivi quel giorno),
   senza mai superare le ore di contratto e rispettando tutte le regole */
function fill(L,ctx,staff){
  const saved=ctx.ot;ctx.ot=0;const cnt={},cand=[];
  for(let d=0;d<ctx.nDays;d++){const wd=wdAt(ctx,d);for(const sh of ctx.shifts){const n=+sh.need[wd]||0;if(!n)continue;const sl=slotOf({d,shiftId:sh.id},ctx);sl.need=n;cand.push(sl);cnt[d+'|'+sh.id]=0}}
  for(const p of staff)for(const x of L[p.id])if(cnt[x.d+'|'+x.shiftId]!=null)cnt[x.d+'|'+x.shiftId]++;
  let added=true;
  while(added){added=false;
    const order=staff.map(p=>({p,gap:tgtOf(p,ctx).tot-sumDur(L[p.id])})).filter(o=>o.gap>0).sort((a,b)=>b.gap/Math.max(60,tgtOf(b.p,ctx).tot)-a.gap/Math.max(60,tgtOf(a.p,ctx).tot));
    for(const{p,gap}of order){const tg=tgtOf(p,ctx),list=L[p.id];let bc=null,bsc=Infinity;
      for(const c of cand){if(c.dur>gap)continue;if(list.some(x=>x.d===c.d&&x.shiftId===c.shiftId))continue;if(check(p,c,list,ctx))continue;
        const w=Math.floor(c.d/7),wd=list.reduce((a,x)=>a+(Math.floor(x.d/7)===w?x.dur:0),0);
        let sc=(cnt[c.d+'|'+c.shiftId]-c.need)+2*(wd+c.dur)/Math.max(60,tg.wk[w]);
        if(list.some(x=>Math.abs(x.d-c.d)===1&&x.shiftId===c.shiftId))sc-=0.3;
        if(sc<bsc){bsc=sc;bc=c}}
      if(bc){list.push({...bc});cnt[bc.d+'|'+bc.shiftId]++;added=true}}
  }
  ctx.ot=saved;
}
function analyze(plan){
  const ctx=makeCtx(plan),by={},viol={},cov={},hours={};
  for(const a of plan.assign)(by[a.staffId]||(by[a.staffId]=[])).push(a);
  for(const r of planRows(plan)){
    const p=staffById(r.id)||{...r,offDays:[],slots:[],noShifts:[],hours:r.hours||0};
    const items=(by[r.id]||[]).map(a=>({a,sl:slotOf(a,ctx)})).filter(x=>x.sl).sort((x,y)=>x.sl.s-y.sl.s);
    const tg=tgtOf(p,ctx),done=items.reduce((s,x)=>s+x.sl.dur,0);
    hours[r.id]={done,tgt:tg.tot,ot:Math.max(0,done-tg.tot),lv:tg.lv,n:items.length,weeks:Array.from({length:ctx.weeks},(_,w)=>items.filter(x=>Math.floor(x.sl.d/7)===w).reduce((s,x)=>s+x.sl.dur,0))};
    const add=(it,why)=>(viol[r.id+'|'+it.a.d]||(viol[r.id+'|'+it.a.d]=[])).push(`${ctx.shiftMap[it.a.shiftId].emoji} ${why}`);
    let cum=0;
    for(const it of items){const why=check(p,it.sl,items.filter(o=>o!==it).map(o=>o.sl),ctx,true);if(why)add(it,why);
      cum+=it.sl.dur;if(cum>tg.tot+ctx.ot)add(it,ctx.ot?t('r.ot',{h:fmtH(ctx.ot)}):t('r.contract',{h:fmtH(tg.tot)}))}
  }
  let need=0,have=0;
  for(let d=0;d<ctx.nDays;d++){const wd=wdAt(ctx,d);for(const sh of plan.shifts){const n=+sh.need[wd]||0;const c=plan.assign.filter(a=>a.d===d&&a.shiftId===sh.id).length;cov[d+'|'+sh.id]={need:n,have:c};need+=n;have+=Math.min(n,c)}}
  const otMin=Object.values(hours).reduce((a,b)=>a+b.ot,0);
  return{ctx,viol,cov,hours,need,have,otMin,uncovered:need-have,nViol:Object.values(viol).reduce((a,b)=>a+b.length,0)};
}
function planRows(plan){const ids=new Set(),rows=[];for(const s of plan.staffSnap||[]){const cur=staffById(s.id);rows.push(cur?{id:cur.id,name:cur.name,color:cur.color,role:cur.role,hours:cur.hours}:s);ids.add(s.id)}for(const p of state.staff)if(!ids.has(p.id))rows.push({id:p.id,name:p.name,color:p.color,role:p.role,hours:p.hours});return rows}
function leaveOn(staffId,date){const k=keyOf(date);return state.leaves.find(l=>l.staffId===staffId&&l.from<=k&&(l.to||l.from)>=k)}
function newPlan(start,weeks,name,days){return{id:uid(),name:name||t('plan.defaultName',{date:fmtD(parseDate(start))}),start,weeks,...(days?{days}:{}),shifts:JSON.parse(JSON.stringify(state.settings.shifts)),staffSnap:state.staff.map(p=>({id:p.id,name:p.name,color:p.color,role:p.role,hours:p.hours})),assign:[],created:Date.now(),updated:Date.now()}}

/* =========================================================
   VIEWS
   ========================================================= */
let lastRoute=null;
function focusKey(el){if(!el||!el.dataset)return null;const d=el.dataset;if(el.id)return '#'+el.id;if(!d.act&&!d.go)return null;return Object.entries(d).map(([k,v])=>`[data-${k.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())}="${v}"]`).join('')}
function render(){
  renderNav();const r=route(),v=$('#view');const keepSel=r===lastRoute&&v.contains(document.activeElement)?focusKey(document.activeElement):null;
  v.innerHTML=VIEWS[r]();v.classList.remove('view-enter');void v.offsetWidth;v.classList.add('view-enter');
  const nav=NAV.find(n=>n[0]===r);document.title=`${r==='info'?t('info.title'):t(nav[2])} · Turnotto`;
  if(lastRoute!==null&&r!==lastRoute){scrollTo({top:0});const h1=v.querySelector('h1');if(h1){h1.setAttribute('tabindex','-1');h1.focus({preventScroll:true})}}else if(keepSel){try{v.querySelector(keepSel)?.focus({preventScroll:true})}catch(e){}}
  lastRoute=r;
}
const stat=(e,b,l,i,extra='',attrs='')=>`<div class="card stat pop" style="--i:${i}" ${attrs}><span class="emo" aria-hidden="true">${ic(e)}</span><span class="big"${extra}>${b}</span><span class="lbl">${l}</span></div>`;
const VIEWS={
home(){
  const tot=state.staff.reduce((a,p)=>a+(+p.hours||0),0);const k=keyOf(today());
  const active=state.leaves.filter(l=>l.from<=k&&(l.to||l.from)>=k).length,upcoming=state.leaves.filter(l=>l.from>k).length;
  const cur=state.current;let covPct='—',an=null;if(cur&&cur.assign.length){an=analyze(cur);covPct=Math.round(an.have/Math.max(1,an.need)*100)+'%'}
  return `
  <div class="card hero pop">
    <button type="button" class="owlwrap" data-act="owl-poke" aria-label="${h(t('a11y.owl'))}">${owl(window.innerWidth<600?110:150)}</button>
    <div class="grow" style="min-width:220px">
      <h1>${t('home.hello')} ${ic('sparkle')}</h1>
      <div class="bubble" id="owltip" aria-live="polite" style="margin-top:10px;display:inline-block">${randTip()}</div>
      <div class="row wrap" style="margin-top:14px"><button class="btn pri big" data-go="turni">${ic('calendar')} ${t('home.plan')}</button><button class="btn ghost" data-go="organico">${ic('team')} ${t('nav.staff')}</button></div>
    </div>
  </div>
  ${state.demo?`<div class="card pop warmcard" style="--i:1;margin-top:14px"><div class="row wrap"><span style="font-size:26px">${ic('flask')}</span><div class="grow" style="min-width:180px"><b>${t('home.demoTitle')}</b><div class="muted">${t('home.demoText')}</div></div><button class="btn sm ghost" data-act="demo-keep">${t('home.demoKeep')}</button><button class="btn sm pri" data-act="demo-clear">${t('home.demoClear')}</button></div></div>`:''}
  <div class="grid stats" style="margin-top:14px">
    ${[['team',state.staff.length,'stat.people'],['clock',tot+'h','stat.contract'],['beach',active,'stat.absentToday'],['calendar',upcoming,'stat.upcoming'],['target',covPct,'stat.coverage'],['book',state.plans.length,'stat.saved']].map(([e,b,l],i)=>stat(e,b,t(l),i+2)).join('')}
  </div>
  ${cur?`<div class="card pop" style="--i:8;margin-top:14px"><div class="row wrap"><span style="font-size:28px">${ic('calendar')}</span><div class="grow"><b>${h(cur.name)}</b><div class="muted">${fmtDY(parseDate(cur.start))} → ${fmtDY(addDays(parseDate(cur.start),cur.weeks*7-1))} · ${t('lbl.shifts')}: ${cur.assign.length}${an?` · ${t('lbl.uncovered')}: ${an.uncovered} · ${t('lbl.warnings')}: ${an.nViol}`:''}</div>${an?`<div class="bar"><i style="width:${an.have/Math.max(1,an.need)*100}%"></i></div>`:''}</div><button class="btn lav" data-go="turni">${t('btn.open')} ${ic('chev-right')}</button></div></div>`:''}
  <div class="card installcard pop ${isStandalone()?'hide':''}" style="--i:9;margin-top:14px"><div class="row wrap"><span style="font-size:28px">${ic('install')}</span><div class="grow"><b>${t('home.installTitle')}</b><div class="muted">${isIOS()?t('home.installIOS'):t('home.installOther')}</div></div></div></div>`;
},
organico(){
  return `<div class="vhead"><h1>${ic('team')} ${t('staff.title')}</h1><div class="grow"></div><button class="btn pri" data-act="staff-add">${ic('plus')} ${t('staff.add')}</button></div>
  ${state.staff.length?'':`<div class="card empty pop">${owl(110)}<h3>${t('staff.emptyT')}</h3><p class="muted">${t('staff.emptyD')}</p><button class="btn pri" data-act="staff-add">${ic('plus')} ${t('staff.add')}</button></div>`}
  <div class="grid cards">${state.staff.map((p,i)=>`<div class="card pop" style="--i:${i}">
    <div class="row"><div class="avatar" style="background:${p.color}">${h(initials(p.name))}</div>
    <div class="grow"><b style="font-size:16px">${h(p.name)}</b><div class="muted" style="font-weight:700">${h(p.role||'—')}</div></div>
    <div class="hours"><b>${p.hours}</b><small>${t('staff.hpw')}</small></div></div>
    <div class="chips">${constraintChips(p)}</div>
    ${p.note?`<div class="muted" style="font-size:13px;margin-bottom:8px">${ic('edit')} ${h(p.note)}</div>`:''}
    <div class="row end"><button class="btn sm ghost" data-act="staff-edit" data-id="${p.id}">${ic('edit')} ${t('btn.edit')}</button><button class="btn sm ghost danger" data-act="staff-del" data-id="${p.id}" aria-label="${h(t('btn.delete'))}">${ic('trash')}</button></div>
  </div>`).join('')}</div>`;
},
ferie(){
  const m=state.ui.calM?new Date(state.ui.calM):new Date(today().getFullYear(),today().getMonth(),1);
  const first=new Date(m.getFullYear(),m.getMonth(),1),startC=addDays(first,-wdOf(first)),tk=keyOf(today());
  let cells='';for(let i=0;i<42;i++){const d=addDays(startC,i),k=keyOf(d);const ls=state.leaves.filter(l=>l.from<=k&&(l.to||l.from)>=k);
    cells+=`<div class="dc ${d.getMonth()!==m.getMonth()?'out':''} ${k===tk?'today':''}" data-act="leave-add" data-date="${k}" role="button" tabindex="0"${k===tk?' aria-current="date"':''} aria-label="${h(d.getDate()+' – '+fmtDY(d)+(ls.length?' · '+ls.map(l=>(staffById(l.staffId)?.name||'')+' ('+ltName(l.type)+')').join(', '):'')+' · '+t('leave.add'))}"><span aria-hidden="true">${d.getDate()}</span><div class="dots" aria-hidden="true">${ls.slice(0,6).map(l=>{const p=staffById(l.staffId);return p?`<span data-i="${h(initials(p.name))}" style="background:${p.color}"></span>`:''}).join('')}${ls.length>6?`<small>+${ls.length-6}</small>`:''}</div></div>`}
  const sorted=[...state.leaves].sort((a,b)=>a.from<b.from?1:-1);const fut=sorted.filter(l=>(l.to||l.from)>=tk).reverse(),past=sorted.filter(l=>(l.to||l.from)<tk);
  const item=(l,i)=>{const p=staffById(l.staffId);return `<div class="leaveitem pop" style="--i:${i}"><span class="emo">${ltIc(l.type)}</span><div class="avatar xs" style="background:${p?.color||'#ccc'}">${h(initials(p?.name))}</div><div class="grow"><b>${h(p?.name||t('leave.removedPerson'))}</b> <span class="chip" style="background:${(LT[l.type]||LT.altro).c}33;color:var(--leave-ink)">${h(ltName(l.type))}</span><div class="muted" style="font-size:13px;font-weight:700">${fmtDY(parseDate(l.from))}${l.to&&l.to!==l.from?' → '+fmtDY(parseDate(l.to)):''}${l.full===false?` · ${l.hFrom}–${l.hTo}`:' · '+t('leave.fullDay')}${l.note?' · '+h(l.note):''}</div></div><button class="iconbtn" data-act="leave-edit" data-id="${l.id}" aria-label="${h(t('btn.edit'))}">${ic('edit')}</button><button class="iconbtn" data-act="leave-del" data-id="${l.id}" aria-label="${h(t('btn.delete'))}">${ic('trash')}</button></div>`};
  return `<div class="vhead"><h1>${ic('beach')} ${t('leave.title')}</h1><div class="grow"></div><button class="btn pri" data-act="leave-add">${ic('plus')} ${t('leave.add')}</button></div>
  <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(320px,1fr))">
  <div class="card pop"><div class="row" style="margin-bottom:10px"><button class="iconbtn" data-act="cal-prev" aria-label="${h(t('a11y.prev'))}">${ic('chev-left')}</button><h2 class="grow" style="text-align:center;color:var(--lavd);font-size:20px" aria-live="polite">${monthTitle(m)}</h2><button class="iconbtn" data-act="cal-next" aria-label="${h(t('a11y.next'))}">${ic('chev-right')}</button></div>
  <div class="calgrid">${DAYS.map(d=>`<div class="dh" aria-hidden="true">${h(d)}</div>`).join('')}${cells}</div>
  <div class="legend">${Object.keys(LT).map(k=>`<span class="chip gray">${ltIc(k)} ${h(ltName(k))}</span>`).join('')}</div></div>
  <div class="card pop" style="--i:1"><div class="section-t" style="margin-top:0">${ic('calendar')} ${t('leave.current')}</div>${fut.length?fut.map(item).join(''):`<p class="muted">${t('leave.none')} ${ic('rainbow')}</p>`}
  ${past.length?`<details style="margin-top:10px"><summary style="cursor:pointer;font-weight:800;color:var(--ink2)">${t('leave.past')} (${past.length})</summary><div style="margin-top:8px">${past.map(item).join('')}</div></details>`:''}</div></div>`;
},
turni(){
  const cur=state.current,nm=keyOf(nextMonday());
  const setup=`<div class="card pop" style="margin-bottom:14px"><div class="fgrid" style="align-items:end">
    <label class="f">${ic('calendar')} ${t('plan.start')}<input type="date" class="inp" id="pStart" value="${cur?.start||nm}"></label>
    <label class="f">${ic('calendar')} ${t('plan.weeks')}<select class="inp" id="pWeeks">${[1,2,3,4,5,6].map(w=>`<option value="${w}" ${!cur?.days&&(cur?.weeks||2)===w?'selected':''}>${h(t('plan.weeksN',{n:w}))}</option>`).join('')}<option value="m" ${cur?.days?'selected':''}>${h(t('plan.month'))}</option></select></label>
    <label class="f">${ic('edit')} ${t('plan.name')}<input class="inp" id="pName" placeholder="${h(t('plan.namePh'))}" value="${h(cur?.name||'')}"></label>
    <button class="btn pri big" data-act="gen">${ic('sparkle')} ${t('plan.generate')}</button></div>
    <div class="muted" style="font-size:12.5px;margin-top:8px">${t('plan.hint')} <a href="#regole">${ic('gear')} ${t('nav.rules')}</a></div></div>`;
  if(!state.staff.length)return `<div class="vhead"><h1>${ic('calendar')} ${t('nav.shifts')}</h1></div><div class="card empty">${owl(110)}<h3>${t('plan.needStaff')}</h3><button class="btn pri" data-go="organico">${ic('team')} ${t('plan.addPeople')}</button></div>`;
  if(!cur)return `<div class="vhead"><h1>${ic('calendar')} ${t('nav.shifts')}</h1></div>${setup}<div class="card empty pop" style="--i:1">${owl(120)}<h3>${t('plan.noneT')}</h3><p class="muted">${t('plan.noneD')}</p></div>`;
  const an=analyze(cur),ctx=an.ctx,rows=planRows(cur),start=parseDate(cur.start);
  const days=Array.from({length:ctx.nDays},(_,d)=>{const dt=addDays(start,d);return{d,dt,wd:wdOf(dt)}});
  const byCell={};cur.assign.forEach(a=>(byCell[a.staffId+'|'+a.d]||(byCell[a.staffId+'|'+a.d]=[])).push(a));
  let ci=0;
  const body=rows.map(r=>{const p=staffById(r.id);const hs=an.hours[r.id];const diff=hs.done-hs.tgt;const cls=Math.abs(diff)<=120?'ok':diff<0?'lo':'hi';
    return `<tr><th class="sticky" scope="row"><div class="pcell"><span class="avatar xs" aria-hidden="true" style="background:${r.color}">${h(initials(r.name))}</span><span class="nm" title="${h(r.name)}">${h(r.name)}</span></div></th>${days.map(({d,dt,wd})=>{
      const as=(byCell[r.id+'|'+d]||[]).map(a=>ctx.shiftMap[a.shiftId]).filter(Boolean).sort((a,b)=>toMin(a.start)-toMin(b.start));
      const lv=leaveOn(r.id,dt),off=p&&(p.offDays||[]).includes(wd),v=an.viol[r.id+'|'+d];
      return `<td class="cell ${wd>4?'we':''} ${d%7===0&&d?'wk':''} ${lv&&lv.full!==false?'leave':''} ${off&&!as.length?'off':''} ${v?'warn':''}" data-act="cell" data-s="${r.id}" data-d="${d}" role="button" tabindex="0" title="${v?h(v.join('\n')):''}"><span class="sr-only">${h(t('a11y.cell',{name:r.name,date:DAYS_L[wd]+' '+fmtD(dt)})+':')} ${as.length||lv?'':h(t('a11y.noShift'))}${v?h(' '+plain(v.join('. '))+'.'):''}</span>${v?`<span class="warnb" aria-hidden="true">${ic('warning')}</span>`:''}${lv?`<div class="lv">${ltIc(lv.type)} ${lv.full===false?lv.hFrom:h(ltName(lv.type))}</div>`:''}${as.map(sh=>`<span class="sc" style="background:${sh.color};--i:${ci++}">${sh.emoji} ${sh.start.slice(0,2)}–${sh.end.slice(0,2)}</span>`).join('')}</td>`}).join('')}
      <td class="tot ${cls}" aria-label="${h(t('plan.hours')+': '+fmtH(hs.done)+' / '+t('plan.contract')+' '+fmtH(hs.tgt)+(hs.ot?' · '+t('plan.otStat')+' +'+fmtH(hs.ot):''))}">${fmtH(hs.done)}<small>/${fmtH(hs.tgt)}h</small>${hs.ot?`<b class="otb" aria-hidden="true">${ic('bolt')}+${fmtH(hs.ot)}h</b>`:''}</td></tr>`}).join('');
  const foot=cur.shifts.map(sh=>`<tr><th class="sticky" scope="row"><span class="sc" style="background:${sh.color};display:inline-block">${sh.emoji} ${h(shiftName(sh))}</span></th>${days.map(({d})=>{const c=an.cov[d+'|'+sh.id];return `<td class="cov ${!c.need&&!c.have?'na':c.have<c.need?'ko':'ok'} ${d%7===0&&d?'wk':''}" data-act="cov" data-d="${d}" data-sh="${sh.id}" role="button" tabindex="0"><span class="sr-only">${h(shiftName(sh)+', '+DAYS_L[wdAt(ctx,d)]+' '+fmtD(addDays(start,d))+':')}</span><span>${c.need||c.have?`${c.have}/${c.need}`:'·'}</span></td>`}).join('')}<td aria-hidden="true"></td></tr>`).join('');
  const pct=Math.round(an.have/Math.max(1,an.need)*100);
  return `<div class="vhead"><h1>${ic('calendar')} ${t('nav.shifts')}</h1><div class="grow"></div><button class="btn ghost sm" data-act="plan-close">${ic('close')} ${t('plan.close')}</button></div>
  ${setup}
  <div class="grid stats" style="margin-bottom:14px">
    <div class="card stat pop"><span class="emo" aria-hidden="true">${ic('target')}</span><span class="big">${pct}%</span><span class="lbl">${t('plan.coverage')} (${an.have}/${an.need})</span><div class="bar"><i style="width:${pct}%"></i></div></div>
    ${stat(an.uncovered?'warning':'rainbow',an.uncovered,t('plan.uncovered'),1,` style="color:${an.uncovered?'var(--ko)':'var(--ok)'}"`)}
    ${stat(an.nViol?'warning':'check',an.nViol,t('plan.warnings')+(an.nViol?' '+t('plan.tap'):''),2,` style="color:${an.nViol?'var(--warn)':'var(--ok)'}"`,'data-act="show-viol" role="button" tabindex="0"')}
    ${stat('clock',fmtH(Object.values(an.hours).reduce((a,b)=>a+b.done,0))+'h',t('plan.hours'),3)}
    ${an.otMin?stat('bolt','+'+fmtH(an.otMin)+'h',t('plan.otStat'),4,` style="color:var(--warn)"`):''}
  </div>
  <div class="toolbar">
    <b style="font-family:'Baloo 2';font-size:18px;color:var(--lavd)">${h(cur.name)}</b><span class="muted" style="font-weight:700">${fmtDY(start)} → ${fmtDY(addDays(start,ctx.nDays-1))}</span><div class="grow"></div>
    <button class="btn mint" data-act="plan-save">${ic('save')} ${t('plan.saveHist')}</button>
    <button class="btn lav" data-act="xl" data-id="current">${ic('sheet')} ${t('plan.export')}</button>
    <button class="btn ghost" data-act="plan-clear">${ic('broom')} ${t('plan.clear')}</button>
  </div>
  <div class="legend">${cur.shifts.map(sh=>`<span class="sc" style="background:${sh.color};display:inline-block">${sh.emoji} ${h(shiftName(sh))} ${sh.start}–${sh.end}</span>`).join('')}<span class="chip gray">${ic('beach')} ${t('plan.absence')}</span><span class="chip gray">${ic('warning')} ${t('plan.ruleBroken')}</span></div>
  <div class="tablewrap pop" style="--i:4"><table class="plan"><caption class="sr-only">${h(cur.name)}</caption><thead><tr><th class="sticky" scope="col">${t('plan.person')}</th>${days.map(({d,dt,wd})=>`<th scope="col" class="${wd>4?'we':''} ${d%7===0&&d?'wk':''}"><abbr title="${h(DAYS_L[wd])}" style="text-decoration:none">${h(DAYS[wd])}</abbr><small>${fmtD(dt)}</small></th>`).join('')}<th scope="col">${t('plan.hoursCol')}</th></tr></thead><tbody>${body}</tbody><tfoot>${foot}</tfoot></table></div>
  <p class="muted" style="font-size:12.5px">${t('plan.footer')}</p>`;
},
storico(){
  const ps=[...state.plans].sort((a,b)=>b.updated-a.updated);
  return `<div class="vhead"><h1>${ic('book')} ${t('hist.title')}</h1><div class="grow"></div><button class="btn ghost" data-act="quick-open">${ic('folder')} ${t('hist.openFile')}</button><button class="btn lav" data-act="quick-save">${ic('save')} ${t('hist.backup')}</button></div>
  <div class="card pop infocard" style="margin-bottom:14px"><div class="row wrap"><span style="font-size:28px">${ic('folder')}</span><div class="grow"><b>${t('hist.infoT')}</b><div class="muted">${t('hist.infoD')}</div></div></div></div>
  ${ps.length?'':`<div class="card empty pop">${owl(110)}<h3>${t('hist.emptyT')}</h3><p class="muted">${t('hist.emptyD')}</p><button class="btn pri" data-go="turni">${ic('calendar')} ${t('hist.goShifts')}</button></div>`}
  <div class="grid cards">${ps.map((p,i)=>{const an=analyze(p);const pct=Math.round(an.have/Math.max(1,an.need)*100);const st=parseDate(p.start);return `<div class="card plancard pop" style="--i:${i}">
    <div class="row"><span style="font-size:30px">${ic('calendar')}</span><div class="grow"><b style="font-size:16px">${h(p.name)}</b><div class="meta">${fmtDY(st)} → ${fmtDY(addDays(st,planDays(p)-1))}</div><div class="meta">${t('hist.updated',{d:fmtDT(p.updated)})}</div></div>${state.current?.id===p.id?`<span class="chip mint">${t('hist.openChip')}</span>`:''}</div>
    <div class="bar"><i style="width:${pct}%"></i></div><div class="meta" style="margin:6px 0 10px">${t('plan.coverage')} ${pct}% · ${t('lbl.shifts')}: ${p.assign.length} · ${t('lbl.warnings')}: ${an.nViol}</div>
    <div class="row wrap end"><button class="btn sm lav" data-act="plan-open" data-id="${p.id}">${ic('folder')} ${t('btn.open')}</button><button class="btn sm ghost" data-act="xl" data-id="${p.id}">${ic('sheet')} Excel</button><button class="btn sm ghost" data-act="plan-dup" data-id="${p.id}">${ic('copy')} ${t('btn.duplicate')}</button><button class="btn sm ghost" data-act="plan-file" data-id="${p.id}">${ic('download')} .json</button><button class="btn sm ghost danger" data-act="plan-del" data-id="${p.id}" aria-label="${h(t('btn.delete'))}">${ic('trash')}</button></div></div>`}).join('')}</div>`;
},
regole(){
  const S=state.settings;
  const rules=[['maxConsecutive','hourglass','consec',1,24],['minRest','sleep','rest',0,48],['minWeeklyRest','bed','weekRest',0,96],['minBiweeklyRest','beach','biRest',0,168],['maxWeekly','clock','maxW',1,80],['maxBiweekly','calendar','maxB',1,160],['overtime','bolt','ot',0,30]];
  return `<div class="vhead"><h1>${ic('gear')} ${t('rules.title')}</h1><div class="grow"></div><button class="btn ghost" data-act="lang">${ic('globe')} ${t('lang.title')}: ${LANGS[LANG]}</button></div>
  <div class="card pop" style="margin-bottom:14px"><div class="row wrap"><h2 class="grow" style="font-size:18px;color:var(--lavd);min-width:150px">${ic('sun')} ${t('theme.title')}</h2>
    <div class="seg" role="group" aria-label="${h(t('theme.title'))}">${[['auto','sparkle'],['light','sun'],['dark','moon']].map(([v,i])=>`<button type="button" data-act="theme" data-v="${v}" class="${getTheme()===v?'on':''}" aria-pressed="${getTheme()===v}">${ic(i)} ${t('theme.'+v)}</button>`).join('')}</div></div></div>
  <div class="sett">${rules.map(([k,e,r,mn,mx],i)=>`<div class="card rule pop" style="--i:${i}"><div class="rt"><span class="e">${ic(e)}</span>${t('rule.'+r+'T')}</div><div class="muted" style="font-size:12.5px">${t('rule.'+r+'D')}</div>
    <div class="numbox"><button data-act="num" data-k="${k}" data-v="-1" aria-label="${h(t('a11y.dec')+' – '+t('rule.'+r+'T'))}">−</button><input class="inp" type="number" aria-label="${h(t('rule.'+r+'T'))}" inputmode="numeric" min="${mn}" max="${mx}" value="${S[k]}" data-set="${k}"><button data-act="num" data-k="${k}" data-v="1" aria-label="${h(t('a11y.inc')+' – '+t('rule.'+r+'T'))}">+</button><b aria-hidden="true">h</b></div></div>`).join('')}
    <div class="card rule pop" style="--i:${rules.length}"><div class="rt"><span class="e">${ic('box-check')}</span>${t('rule.fillT')}</div><div class="muted" style="font-size:12.5px">${t('rule.fillD')}</div>
    <div class="seg" style="margin-top:8px" role="group" aria-label="${h(t('rule.fillT'))}">${[[true,'on'],[false,'off']].map(([v,l])=>`<button type="button" data-act="fill" data-v="${v}" class="${(S.fill!==false)===v?'on':''}" aria-pressed="${(S.fill!==false)===v}">${t('lbl.'+l)}</button>`).join('')}</div></div></div>
  <div class="vhead" style="margin-top:22px"><h2 style="font-size:22px">${ic('clock')} ${t('rules.shiftsT')}</h2><div class="grow"></div><button class="btn pri sm" data-act="shift-add">${ic('plus')} ${t('rules.addShift')}</button></div>
  <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(330px,1fr))">${S.shifts.map((sh,i)=>`<div class="card pop" style="--i:${i};border-left:8px solid ${sh.color}">
    <div class="shiftedit">
      <label class="f">${t('rules.emoji')}<input class="inp" value="${h(sh.emoji)}" data-sh="${sh.id}" data-f="emoji" maxlength="4"></label>
      <label class="f" style="grid-column:span 2">${t('rules.name')}<input class="inp" value="${h(shiftName(sh))}" data-sh="${sh.id}" data-f="name"></label>
      <label class="f">${t('rules.start')}<input class="inp" type="time" value="${sh.start}" data-sh="${sh.id}" data-f="start"></label>
      <label class="f">${t('rules.end')}<input class="inp" type="time" value="${sh.end}" data-sh="${sh.id}" data-f="end"></label>
      <label class="f">${t('rules.color')}<input class="inp" type="color" value="${sh.color}" data-sh="${sh.id}" data-f="color" style="height:44px;padding:4px"></label>
    </div>
    <div class="muted" style="font-size:12.5px;margin-top:8px;font-weight:800">${ic('team')} ${t('rules.need')} · ${t('rules.duration',{h:fmtH(shiftSpan(sh)[1]-shiftSpan(sh)[0])})}${toMin(sh.end)<=toMin(sh.start)?' '+t('rules.midnight'):''}</div>
    <div class="needs">${DAYS.map((d,w)=>`<label>${h(d)}<input class="inp" type="number" min="0" max="50" value="${sh.need[w]}" data-sh="${sh.id}" data-need="${w}"></label>`).join('')}</div>
    <div class="row end" style="margin-top:10px"><button class="btn sm ghost danger" data-act="shift-del" data-id="${sh.id}">${ic('trash')} ${t('rules.delShift')}</button></div></div>`).join('')}</div>
  <div class="vhead" style="margin-top:22px"><h2 style="font-size:22px">${ic('save')} ${t('rules.dataT')}</h2></div>
  <div class="card pop"><div class="row wrap"><span class="muted grow" style="font-weight:700">${t('rules.dataD')}</span>
  <button class="btn ghost" data-act="demo-load">${ic('sparkle')} ${t('rules.loadDemo')}</button><button class="btn ghost danger" data-act="wipe">${ic('warning')} ${t('rules.wipe')}</button></div>
  <div class="muted" style="font-size:12px;margin-top:10px">Turnotto v${APP_VERSION} · ${t('rules.footer')} · <a href="#info">${ic('info')} ${t('info.title')}</a></div></div>`;
}};

VIEWS.info=()=>`<div class="vhead"><h1>${ic('info')} ${t('info.title')}</h1></div>
  <div class="card info pop"><div class="row wrap">${owl(90)}<div class="grow"><h2 style="color:var(--lavd)">Turn<span style="color:var(--pink)">otto</span></h2><div class="muted" style="font-weight:800">${t('info.version',{v:APP_VERSION})}</div></div><button class="btn lav" data-act="wizard">${ic('wand')} ${t('info.replay')}</button></div>
  <h3 id="privacy">${ic('lock')} ${t('info.privacyT')}</h3><ul>${[1,2,3,4,5,6].map(i=>`<li>${t('info.p'+i)}</li>`).join('')}</ul>
  <h3 id="disclaimer">${ic('warning')} ${t('info.disclT')}</h3><ul>${[1,2,3,4].map(i=>`<li>${t('info.d'+i)}</li>`).join('')}</ul>
  <h3>${ic('doc')} ${t('info.licenseT')}</h3><p>${t('info.license')} <a href="${REPO_URL}" target="_blank" rel="noopener">${t('info.source')} ${ic('chev-right')}</a></p>
  <p class="muted" style="font-size:12px">© ${new Date().getFullYear()} ${AUTHOR} · MIT</p></div>`;
function constraintChips(p){const c=[];
  if(p.offDays?.length)c.push(`<span class="chip pink">${ic('block')} ${p.offDays.map(d=>h(DAYS[d])).join(', ')}</span>`);
  for(const s of p.slots||[])c.push(`<span class="chip pink">${ic('clock')} ${s.day===-1?t('staff.everyDay'):h(DAYS[s.day])} ${s.from}–${s.to}</span>`);
  for(const id of p.noShifts||[]){const sh=state.settings.shifts.find(s=>s.id===id);if(sh)c.push(`<span class="chip">${ic('block')} ${h(t('staff.no',{x:sh.emoji+' '+shiftName(sh)}))}</span>`)}
  const k=keyOf(today());const l=state.leaves.filter(x=>x.staffId===p.id&&(x.to||x.from)>=k);if(l.length)c.push(`<span class="chip mint">${ic('beach')} ${t('staff.upcomingLeave',{n:l.length})}</span>`);
  return c.join('')||`<span class="chip gray">${ic('sparkle')} ${t('staff.noConstraints')}</span>`}

/* ---------------- forms ---------------- */
function staffForm(p){
  const isNew=!p;p=p?JSON.parse(JSON.stringify(p)):{id:uid(),name:'',role:'',hours:36,color:PALETTE[state.staff.length%PALETTE.length],offDays:[],slots:[],noShifts:[],note:''};
  const slotsHtml=()=>p.slots.map((s,i)=>`<div class="slotrow"><select class="inp" data-si="${i}" data-sf="day" aria-label="${h(t('staff.slots'))}"><option value="-1" ${s.day===-1?'selected':''}>${t('staff.everyDay')}</option>${DAYS_L.map((d,w)=>`<option value="${w}" ${+s.day===w?'selected':''}>${h(d)}</option>`).join('')}</select><input type="time" class="inp" value="${s.from}" data-si="${i}" data-sf="from" aria-label="${h(t('leave.hFrom'))}"><input type="time" class="inp" value="${s.to}" data-si="${i}" data-sf="to" aria-label="${h(t('leave.hTo'))}"><button class="iconbtn" data-rm="${i}" aria-label="${h(t('a11y.removeSlot'))}">${ic('close')}</button></div>`).join('')||`<div class="muted" style="font-size:13px">${t('staff.noSlots')}</div>`;
  modal(isNew?`${ic('user')} ${t('staff.newT')}`:`${ic('edit')} ${t('staff.editT')}`,`
  <div class="fgrid"><label class="f" style="grid-column:1/-1">${t('staff.name')}<input class="inp" id="fName" value="${h(p.name)}" placeholder="${h(t('staff.namePh'))}"></label>
  <label class="f">${t('staff.role')}<input class="inp" id="fRole" value="${h(p.role)}" placeholder="${h(t('staff.rolePh'))}"></label>
  <label class="f">${t('staff.hours')}<input class="inp" id="fHours" type="number" min="0" max="80" step="0.5" value="${p.hours}"></label>
  <label class="f">${t('staff.days')}<input class="inp" id="fDaysN" type="number" min="1" max="7" step="1" value="${p.days||5}" aria-describedby="fDaysH"><small class="muted" id="fDaysH">${t('staff.daysD')}</small></label></div>
  <div class="section-t">${ic('sparkle')} ${t('staff.color')}</div><div class="swatches" id="fColor" role="group" aria-label="${h(t('staff.color'))}">${PALETTE.map((c,i)=>`<button type="button" style="background:${c}" data-c="${c}" class="${c===p.color?'on':''}" aria-pressed="${c===p.color}" aria-label="${h(t('a11y.color',{n:i+1}))}"></button>`).join('')}</div>
  <div class="section-t">${ic('close')} ${t('staff.offDays')}</div><div class="daypick" id="fDays" role="group" aria-label="${h(t('staff.offDays'))}">${DAYS.map((d,w)=>`<button type="button" data-w="${w}" class="${p.offDays.includes(w)?'on':''}" aria-pressed="${p.offDays.includes(w)}" title="${h(DAYS_L[w])}">${h(d)}</button>`).join('')}</div>
  <div class="section-t">${ic('clock')} ${t('staff.slots')}</div><div id="fSlots"></div><button class="btn sm ghost" id="fAddSlot">${ic('plus')} ${t('staff.addSlot')}</button>
  <div class="section-t">${ic('warning')} ${t('staff.noShifts')}</div><div class="daypick" id="fNo" role="group" aria-label="${h(t('staff.noShifts'))}">${state.settings.shifts.map(sh=>`<button type="button" data-id="${sh.id}" class="${p.noShifts.includes(sh.id)?'on':''}" aria-pressed="${p.noShifts.includes(sh.id)}">${sh.emoji} ${h(shiftName(sh))}</button>`).join('')}</div>
  <label class="f" style="margin-top:12px">${ic('edit')} ${t('staff.note')}<textarea class="inp" id="fNote" rows="2">${h(p.note)}</textarea></label>
  <div class="actions"><button class="btn ghost" data-close>${t('btn.cancel')}</button><button class="btn pri" id="fSave">${ic('heart')} ${t('btn.save')}</button></div>`,{onMount(m,close){
    const sl=m.querySelector('#fSlots');const rs=()=>{sl.innerHTML=slotsHtml()};rs();
    sl.addEventListener('input',e=>{const x=e.target;if(x.dataset.si!=null){const s=p.slots[+x.dataset.si];s[x.dataset.sf]=x.dataset.sf==='day'?+x.value:x.value}});
    sl.addEventListener('click',e=>{const b=e.target.closest('[data-rm]');if(b){p.slots.splice(+b.dataset.rm,1);rs()}});
    m.querySelector('#fAddSlot').onclick=()=>{p.slots.push({day:-1,from:'20:00',to:'08:00'});rs()};
    m.querySelector('#fColor').onclick=e=>{const b=e.target.closest('[data-c]');if(!b)return;p.color=b.dataset.c;m.querySelectorAll('#fColor button').forEach(x=>{x.classList.toggle('on',x===b);x.setAttribute('aria-pressed',x===b)})};
    m.querySelector('#fDays').onclick=e=>{const b=e.target.closest('[data-w]');if(!b)return;const w=+b.dataset.w;p.offDays=p.offDays.includes(w)?p.offDays.filter(x=>x!==w):[...p.offDays,w];b.classList.toggle('on');b.setAttribute('aria-pressed',b.classList.contains('on'))};
    m.querySelector('#fNo').onclick=e=>{const b=e.target.closest('[data-id]');if(!b)return;const id=b.dataset.id;p.noShifts=p.noShifts.includes(id)?p.noShifts.filter(x=>x!==id):[...p.noShifts,id];b.classList.toggle('on');b.setAttribute('aria-pressed',b.classList.contains('on'))};
    m.querySelector('[data-close]').onclick=close;
    m.querySelector('#fSave').onclick=()=>{p.name=m.querySelector('#fName').value.trim();if(!p.name){m.querySelector('#fName').focus();toast(t('staff.needName'));return}
      p.role=m.querySelector('#fRole').value.trim();p.hours=Math.max(0,+m.querySelector('#fHours').value||0);p.days=Math.max(1,Math.min(7,Math.round(+m.querySelector('#fDaysN').value||5)));p.note=m.querySelector('#fNote').value.trim();
      const i=state.staff.findIndex(x=>x.id===p.id);if(i>=0)state.staff[i]=p;else state.staff.push(p);save();close();render();toast(isNew?`${h(t('staff.welcome',{name:p.name.split(' ')[0]}))}`:`${t('staff.saved')}`);if(isNew)owlJump()};
  }});
}
function leaveForm(l,date){
  if(!state.staff.length){toast(t('leave.needStaff'));return}
  const isNew=!l;l=l?{...l}:{id:uid(),staffId:state.staff[0].id,type:'ferie',from:date||keyOf(today()),to:date||keyOf(today()),full:true,hFrom:'09:00',hTo:'13:00',note:''};
  modal(isNew?`${ic('beach')} ${t('leave.add')}`:`${ic('edit')} ${t('leave.editT')}`,`
  <div class="fgrid"><label class="f">${t('leave.person')}<select class="inp" id="lP">${state.staff.map(p=>`<option value="${p.id}" ${p.id===l.staffId?'selected':''}>${h(p.name)}</option>`).join('')}</select></label>
  <label class="f">${t('leave.type')}<select class="inp" id="lT">${Object.keys(LT).map(k=>`<option value="${k}" ${k===l.type?'selected':''}>${h(ltName(k))}</option>`).join('')}</select></label>
  <label class="f">${t('leave.from')}<input type="date" class="inp" id="lF" value="${l.from}"></label><label class="f">${t('leave.to')}<input type="date" class="inp" id="lTo" value="${l.to||l.from}"></label></div>
  <div style="margin:14px 0"><label class="switch"><input type="checkbox" id="lFull" ${l.full!==false?'checked':''}><i></i>${t('leave.fullDay')}</label></div>
  <div class="fgrid ${l.full!==false?'hide':''}" id="lHours"><label class="f">${t('leave.hFrom')}<input type="time" class="inp" id="lHF" value="${l.hFrom||'09:00'}"></label><label class="f">${t('leave.hTo')}<input type="time" class="inp" id="lHT" value="${l.hTo||'13:00'}"></label></div>
  <label class="f" style="margin-top:12px">${ic('edit')} ${t('staff.note')}<input class="inp" id="lN" value="${h(l.note)}"></label>
  <div class="actions"><button class="btn ghost" data-close>${t('btn.cancel')}</button><button class="btn pri" id="lS">${ic('heart')} ${t('btn.save')}</button></div>`,{onMount(m,close){
    m.querySelector('#lFull').onchange=e=>m.querySelector('#lHours').classList.toggle('hide',e.target.checked);
    m.querySelector('#lF').onchange=e=>{const x=m.querySelector('#lTo');if(x.value<e.target.value)x.value=e.target.value};
    m.querySelector('[data-close]').onclick=close;
    m.querySelector('#lS').onclick=()=>{l.staffId=m.querySelector('#lP').value;l.type=m.querySelector('#lT').value;l.from=m.querySelector('#lF').value;l.to=m.querySelector('#lTo').value||l.from;
      if(!l.from){toast(t('leave.needDate'));return}if(l.to<l.from)[l.from,l.to]=[l.to,l.from];
      l.full=m.querySelector('#lFull').checked;l.hFrom=m.querySelector('#lHF').value;l.hTo=m.querySelector('#lHT').value;l.note=m.querySelector('#lN').value.trim();
      const i=state.leaves.findIndex(x=>x.id===l.id);if(i>=0)state.leaves[i]=l;else state.leaves.push(l);save();close();render();toast(`${t('leave.saved')}`)};
  }});
}
function cellEditor(staffId,d){
  const cur=state.current,ctx=makeCtx(cur),r=planRows(cur).find(x=>x.id===staffId),p=staffById(staffId),dt=addDays(ctx.start,d);
  const draw=m=>{const mine=cur.assign.filter(a=>a.staffId===staffId);const lv=leaveOn(staffId,dt);
    m.querySelector('#ce').innerHTML=(lv?`<div class="leaveitem"><span class="emo">${ltIc(lv.type)}</span><b>${h(ltName(lv.type))}</b>${lv.full===false?` ${lv.hFrom}–${lv.hTo}`:''}</div>`:'')+cur.shifts.map(sh=>{
      const on=mine.some(a=>a.d===d&&a.shiftId===sh.id);let why='';
      if(p){const others=mine.filter(a=>!(a.d===d&&a.shiftId===sh.id)).map(a=>slotOf(a,ctx)).filter(Boolean);why=check(p,slotOf({d,shiftId:sh.id},ctx),others,ctx)}
      const c=cur.assign.filter(a=>a.d===d&&a.shiftId===sh.id).length,need=+sh.need[wdAt(ctx,d)]||0;
      return `<button type="button" class="shiftbtn ${on?'on':''}" data-sh="${sh.id}" aria-pressed="${on}" style="background:${sh.color}55"><span class="em" aria-hidden="true">${sh.emoji}</span><div class="grow"><b>${h(shiftName(sh))}</b> <small>${sh.start}–${sh.end}</small><div style="font-size:12px;font-weight:700">${t('plan.coverage')} ${c}/${need}</div>${why?`<div class="why">${ic('warning')} ${h(why)}</div>`:''}</div>${ic(on?'box-check':'box')}</button>`}).join('')};
  modal(`<span class="avatar xs" style="background:${r?.color}">${h(initials(r?.name))}</span> ${h(r?.name)} · ${h(DAYS_L[wdOf(dt)])} ${fmtD(dt)}`,`<div class="shiftbtns" id="ce"></div><div class="actions"><button class="btn lav" data-close>${t('btn.done')}</button></div>`,{onMount(m,close){draw(m);
    m.querySelector('#ce').onclick=e=>{const b=e.target.closest('[data-sh]');if(!b)return;const sid=b.dataset.sh;const i=cur.assign.findIndex(a=>a.staffId===staffId&&a.d===d&&a.shiftId===sid);
      if(i>=0)cur.assign.splice(i,1);else cur.assign.push({d,shiftId:sid,staffId});cur.updated=Date.now();save();draw(m)};
    m.querySelector('[data-close]').onclick=()=>{close();render()}}});
}
function coverageEditor(d,shId){
  const cur=state.current,ctx=makeCtx(cur),sh=ctx.shiftMap[shId],dt=addDays(ctx.start,d);
  const draw=m=>{const sl=slotOf({d,shiftId:shId},ctx);const c=cur.assign.filter(a=>a.d===d&&a.shiftId===shId);
    m.querySelector('#cv').innerHTML=`<div class="muted" style="font-weight:800;margin-bottom:8px">${t('plan.assigned',{a:c.length,b:+sh.need[wdAt(ctx,d)]||0})}</div>`+state.staff.map(p=>{
      const on=c.some(a=>a.staffId===p.id);const mine=cur.assign.filter(a=>a.staffId===p.id&&!(a.d===d&&a.shiftId===shId)).map(a=>slotOf(a,ctx)).filter(Boolean);
      const why=check(p,sl,mine,ctx);const hrs=fmtH(mine.reduce((s,x)=>s+x.dur,0));
      return{on,why,html:`<button type="button" class="shiftbtn ${on?'on':''}" data-p="${p.id}" aria-pressed="${on}" style="${why&&!on?'border-style:dashed;border-color:var(--line)':''}"><span aria-hidden="true" class="avatar xs" style="background:${p.color}">${h(initials(p.name))}</span><div class="grow"><b>${h(p.name)}</b> <small>${t('plan.inPlan',{h:hrs})}</small>${why?`<div class="why">${ic('warning')} ${h(why)}</div>`:`<div style="font-size:12px;color:var(--ok);font-weight:800">${ic('check')} ${t('plan.available')}</div>`}</div>${ic(on?'box-check':'box')}</button>`}}).sort((a,b)=>(b.on-a.on)||(!!a.why-!!b.why)).map(x=>x.html).join('')};
  modal(`${sh.emoji} ${h(shiftName(sh))} · ${h(DAYS_L[wdOf(dt)])} ${fmtD(dt)}`,`<div class="shiftbtns" id="cv"></div><div class="actions"><button class="btn lav" data-close>${t('btn.done')}</button></div>`,{onMount(m,close){draw(m);
    m.querySelector('#cv').onclick=e=>{const b=e.target.closest('[data-p]');if(!b)return;const pid=b.dataset.p;const i=cur.assign.findIndex(a=>a.staffId===pid&&a.d===d&&a.shiftId===shId);
      if(i>=0)cur.assign.splice(i,1);else cur.assign.push({d,shiftId:shId,staffId:pid});cur.updated=Date.now();save();draw(m)};
    m.querySelector('[data-close]').onclick=()=>{close();render()}}});
}
function langPicker(){
  const codes=Object.keys(LANGS).sort((a,b)=>LANGS[a].localeCompare(LANGS[b],'en'));
  modal(`${ic('globe')} ${t('lang.title')}`,`<div class="langgrid">${codes.map(c=>`<button type="button" data-l="${c}" lang="${c}" class="${c===LANG?'on':''}" aria-pressed="${c===LANG}"><span>${LANGS[c]}</span><small aria-hidden="true">${c.toUpperCase()}</small></button>`).join('')}</div><div class="actions"><button class="btn lav" data-close>${t('btn.close')}</button></div>`,{onMount(m,close){
    m.querySelector('[data-close]').onclick=close;
    m.querySelector('.langgrid').onclick=async e=>{const b=e.target.closest('[data-l]');if(!b)return;await setLang(b.dataset.l,true);close();render();owlJump()}}});
}

/* ---------------- actions ---------------- */
async function doGenerate(){
  let start=$('#pStart').value;const dur=$('#pWeeks').value,name=$('#pName').value.trim(),S=state.settings;
  if(!start){toast(t('plan.needStart'));return}
  if(!S.shifts.length){toast(t('plan.needShift'));return}
  if(state.current&&state.current.assign.length&&!state.plans.some(p=>p.id===state.current.id)){if(!await ask(t('plan.replaceQ'),{ok:t('btn.generate')}))return}
  let days=0,weeks=+dur;
  if(dur==='m'){const d=parseDate(start);start=keyOf(new Date(d.getFullYear(),d.getMonth(),1));days=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();weeks=Math.ceil(days/7)}
  const busy=()=>{const ov=document.createElement('div');ov.className='overlay';ov.setAttribute('role','status');ov.setAttribute('aria-live','polite');ov.innerHTML=`${owl(150,'think')}<h3>${t('plan.thinking')}</h3><div class="dotsload"><span></span><span></span><span></span></div>`;document.body.appendChild(ov);return ov};
  const wait=()=>new Promise(r=>setTimeout(r,60));
  let ov=busy();await new Promise(r=>setTimeout(r,650));
  const keep=state.current&&state.current.start===start&&planDays(state.current)===(days||weeks*7)?state.current:null;
  const plan=newPlan(start,weeks,name||(keep?keep.name:''),days);
  let res=generate(plan,{ot:0});plan.assign=res.asg;plan.ot=0;
  /* straordinario: solo su richiesta, se serve davvero a coprire posti scoperti */
  let alt=null;if(res.unc>0&&S.overtime>0){alt=generate(plan,{ot:S.overtime,tries:45});if(alt.unc>=res.unc)alt=null}
  state.current=plan;save();ov.remove();render();
  if(alt){const h=await askOvertime(res.unc,alt.unc,alt.otMin);
    if(h){ov=busy();await wait();if(h!==S.overtime){const r2=generate(plan,{ot:h});if(r2.unc<res.unc)alt=r2;else alt=null}
      if(alt){plan.ot=h;plan.assign=alt.asg;res=alt;save()}ov.remove();render()}}
  const extra=[res.otMin?t('plan.otDone',{h:fmtH(res.otMin)}):'',res.short?t('plan.short',{n:res.short}):''].filter(Boolean).join(' · ');
  if(res.unc===0){confetti();owlJump();toast(t('plan.allCovered')+(extra?' · '+extra:''))}else toast(t('plan.someUnc',{n:res.unc})+(extra?' · '+extra:''));
}
/* chiede se autorizzare lo straordinario. Ritorna le ore a persona (0 = no) */
function askOvertime(unc,unc2,otMin){const S=state.settings;return new Promise(res=>{let done=false;const fin=v=>{if(!done){done=true;res(v)}};
  modal(t('plan.otAskT'),`<p>${t('plan.otAskD',{n:unc,m:unc2,h:fmtH(otMin)})}</p><p class="muted" style="font-size:12.5px">${t('plan.otLimits',{w:S.maxWeekly,b:S.maxBiweekly,r:S.minRest})}</p>
    <label class="f">${t('plan.otMax')}<input class="inp" id="otH" type="number" min="1" max="${S.overtime}" step="1" value="${S.overtime}" inputmode="numeric"></label>
    <div class="actions"><button class="btn ghost" data-r="0">${t('plan.otNo')}</button><button class="btn pri" data-r="1">${ic('clock')} ${t('plan.otYes')}</button></div>`,
    {label:t('plan.otAskT'),onMount(m,close){m.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{const v=Math.max(1,Math.min(S.overtime,Math.round(+m.querySelector('#otH').value||0)));close();fin(b.dataset.r==='1'?v:0)});
      new MutationObserver((_,o)=>{if(!m.isConnected){o.disconnect();fin(0)}}).observe(document.body,{childList:true,subtree:true})}})})}
function savePlan(){const c=state.current;if(!c)return;c.name=$('#pName')?.value.trim()||c.name;c.updated=Date.now();const i=state.plans.findIndex(p=>p.id===c.id);const copy=JSON.parse(JSON.stringify(c));if(i>=0)state.plans[i]=copy;else state.plans.push(copy);save();render();toast(`${t('plan.savedHist')}`);owlJump()}
function download(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},2000)}
async function saveFile(blob,name,desc){
  if(window.showSaveFilePicker){try{const ext=name.slice(name.lastIndexOf('.'));const hd=await showSaveFilePicker({suggestedName:name,types:[{description:desc,accept:{[blob.type||'application/octet-stream']:[ext]}}]});const w=await hd.createWritable();await w.write(blob);await w.close();return true}catch(e){if(e.name==='AbortError')return false}}
  download(blob,name);return true}
const stamp=()=>{const d=new Date();return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`};
const OUR_APPS=['Turnotto','Hootora','GufoTurni'];
async function backup(){const data={app:'Turnotto',kind:'backup',v:1,saved:new Date().toISOString(),staff:state.staff,leaves:state.leaves,settings:state.settings,plans:state.plans,current:state.current};
  if(await saveFile(new Blob([JSON.stringify(data,null,1)],{type:'application/json'}),`Turnotto-backup-${stamp()}.json`,'Turnotto backup'))toast(`${t('hist.backupSaved')}`)}
async function openFile(file){
  let data;try{data=JSON.parse(await file.text())}catch(e){toast(`${t('hist.badFile')} ${ic('sad')}`);return}
  if(!OUR_APPS.includes(data.app)){toast(t('hist.notOurs'));return}
  if(data.kind==='plan'&&data.plan){const p=data.plan;migrateShifts(p.shifts);p.id=state.plans.some(x=>x.id===p.id)?uid():p.id;state.plans.push(p);save();go('storico');render();toast(`${t('hist.planAdded')}`);return}
  const repl=await ask(t('hist.restoreQ',{d:fmtDT(new Date(data.saved).getTime()),p:data.staff?.length||0,n:data.plans?.length||0}),{ok:t('hist.replace'),cancel:t('hist.merge')});
  if(repl){state={...freshState(false),staff:data.staff||[],leaves:data.leaves||[],settings:{...defaultSettings(),...data.settings},plans:data.plans||[],current:data.current||null};migrateShifts(state.settings.shifts);state.plans.forEach(p=>migrateShifts(p.shifts));if(state.current)migrateShifts(state.current.shifts)}
  else{for(const p of data.plans||[])if(!state.plans.some(x=>x.id===p.id)){migrateShifts(p.shifts);state.plans.push(p)}}
  save();render();toast(`${t('hist.loaded')}`);owlJump()}
const slug=s=>(s||'plan').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'').toLowerCase()||'plan';
const ACT={
  'owl-poke'(){owlJump();const x=$('#owltip');if(x)x.innerHTML=randTip()},
  lang(){langPicker()},
  skip(){const h1=$('#view h1');const el=h1||$('#view');el.setAttribute('tabindex','-1');el.focus()},
  theme(b){setTheme(b.dataset.v);render()},
  'demo-keep'(){state.demo=false;save();render()},
  async 'demo-clear'(){if(await ask(t('rules.clearQ'),{ok:t('home.demoClear'),danger:true})){state=freshState(false);save();render();toast(`${t('rules.cleared')}`)}},
  async 'demo-load'(){if(await ask(t('rules.demoQ'),{ok:t('btn.load'),danger:true})){state=freshState(true);save();render()}},
  async wipe(){if(await ask(t('rules.wipeQ'),{ok:t('rules.wipe'),danger:true})){state=freshState(false);save();render();toast(t('rules.wiped'))}},
  'staff-add'(){staffForm()},
  'staff-edit'(b){staffForm(staffById(b.dataset.id))},
  async 'staff-del'(b){const p=staffById(b.dataset.id);if(await ask(h(t('staff.delQ',{name:p.name})),{ok:t('btn.remove'),danger:true})){state.staff=state.staff.filter(x=>x.id!==p.id);state.leaves=state.leaves.filter(l=>l.staffId!==p.id);if(state.current)state.current.assign=state.current.assign.filter(a=>a.staffId!==p.id);save();render()}},
  'leave-add'(b){leaveForm(null,b.dataset.date)},
  'leave-edit'(b){leaveForm(state.leaves.find(l=>l.id===b.dataset.id))},
  async 'leave-del'(b){if(await ask(t('leave.delQ'),{ok:t('btn.delete'),danger:true})){state.leaves=state.leaves.filter(l=>l.id!==b.dataset.id);save();render()}},
  'cal-prev'(){const m=state.ui.calM?new Date(state.ui.calM):new Date(today().getFullYear(),today().getMonth(),1);state.ui.calM=new Date(m.getFullYear(),m.getMonth()-1,1).getTime();save();render()},
  'cal-next'(){const m=state.ui.calM?new Date(state.ui.calM):new Date(today().getFullYear(),today().getMonth(),1);state.ui.calM=new Date(m.getFullYear(),m.getMonth()+1,1).getTime();save();render()},
  gen(){doGenerate()},
  cell(b){cellEditor(b.dataset.s,+b.dataset.d)},
  cov(b){coverageEditor(+b.dataset.d,b.dataset.sh)},
  'show-viol'(){const an=analyze(state.current);const rows=planRows(state.current);const list=Object.entries(an.viol).map(([k,v])=>{const[sid,d]=k.split('|');const r=rows.find(x=>x.id===sid);return `<div><b>${h(r?.name)}</b> · ${fmtD(addDays(an.ctx.start,+d))}: ${v.map(h).join('; ')}</div>`}).join('');
    modal(`${ic('warning')} ${t('plan.warnings')}`,(list?`<div class="warnlist">${list}</div><p class="muted" style="font-size:13px">${t('plan.violD')}</p>`:`<p>${t('plan.noViol')} ${ic('check')}</p>`)+`<div class="actions"><button class="btn lav" data-close>${t('btn.close')}</button></div>`,{onMount(m,close){m.querySelector('[data-close]').onclick=close}})},
  'plan-save'(){savePlan()},
  async 'plan-clear'(){if(await ask(t('plan.clearQ'),{ok:t('plan.clear'),danger:true})){state.current.assign=[];save();render()}},
  async 'plan-close'(){const c=state.current;if(c.assign.length&&!state.plans.some(p=>p.id===c.id)&&!await ask(t('plan.closeQ'),{ok:t('btn.close'),danger:true}))return;state.current=null;save();render()},
  async 'plan-open'(b){const p=state.plans.find(x=>x.id===b.dataset.id);const c=state.current;if(c&&c.id!==p.id&&c.assign.length&&!state.plans.some(x=>x.id===c.id)&&!await ask(t('plan.openQ'),{ok:t('btn.open')}))return;state.current=JSON.parse(JSON.stringify(p));save();go('turni')},
  'plan-dup'(b){const p=JSON.parse(JSON.stringify(state.plans.find(x=>x.id===b.dataset.id)));p.id=uid();p.name+=' '+t('plan.copy');p.created=p.updated=Date.now();state.plans.push(p);save();render();toast(`${t('plan.dupDone')}`)},
  async 'plan-del'(b){const p=state.plans.find(x=>x.id===b.dataset.id);if(await ask(h(t('plan.delQ',{name:p.name})),{ok:t('btn.delete'),danger:true})){state.plans=state.plans.filter(x=>x.id!==p.id);save();render()}},
  async 'plan-file'(b){const p=state.plans.find(x=>x.id===b.dataset.id);if(await saveFile(new Blob([JSON.stringify({app:'Turnotto',kind:'plan',v:1,saved:new Date().toISOString(),plan:p},null,1)],{type:'application/json'}),`Turnotto-${slug(p.name)}.json`,'Turnotto plan'))toast(`${t('plan.fileSaved')}`)},
  xl(b){const p=b.dataset.id==='current'?state.current:state.plans.find(x=>x.id===b.dataset.id);xlDialog(p)},
  'quick-save'(){backup()},
  info(){go('info')},
  wizard(){wizard(true)},
  'quick-open'(){$('#fileIn').value='';$('#fileIn').click()},
  fill(b){state.settings.fill=b.dataset.v==='true';save();render()},
  num(b){const k=b.dataset.k;const inp=document.querySelector(`[data-set="${k}"]`);const v=Math.max(+inp.min,Math.min(+inp.max,(+inp.value||0)+ +b.dataset.v));inp.value=v;state.settings[k]=v;save();b.animate([{transform:'scale(.8)'},{transform:'scale(1)'}],{duration:200})},
  'shift-add'(){const S=state.settings;S.shifts.push({id:uid(),name:t('rules.newShift'),emoji:'⭐',start:'09:00',end:'17:00',color:PALETTE[S.shifts.length%PALETTE.length],need:[1,1,1,1,1,0,0]});save();render()},
  async 'shift-del'(b){if(await ask(t('rules.delShiftQ'),{ok:t('btn.delete'),danger:true})){state.settings.shifts=state.settings.shifts.filter(s=>s.id!==b.dataset.id);save();render()}}
};
document.addEventListener('click',e=>{const g=e.target.closest('[data-go]');if(g){go(g.dataset.go);return}const b=e.target.closest('[data-act]');if(b&&ACT[b.dataset.act]){e.preventDefault();ACT[b.dataset.act](b)}});
document.addEventListener('change',e=>{const x=e.target;const S=state.settings;
  if(x.dataset.set){S[x.dataset.set]=Math.max(+x.min,Math.min(+x.max,+x.value||0));x.value=S[x.dataset.set];save()}
  if(x.dataset.sh&&x.dataset.f){const sh=S.shifts.find(s=>s.id===x.dataset.sh);sh[x.dataset.f]=x.value;save();if(['start','end','color'].includes(x.dataset.f))render()}
  if(x.dataset.sh&&x.dataset.need!=null){const sh=S.shifts.find(s=>s.id===x.dataset.sh);sh.need[+x.dataset.need]=Math.max(0,+x.value||0);save()}
});
$('#fileIn').addEventListener('change',e=>{const f=e.target.files[0];if(f)openFile(f)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();return}const el=e.target;if((e.key==='Enter'||e.key===' ')&&el.getAttribute&&el.getAttribute('role')==='button'&&!/^(BUTTON|A|INPUT|SELECT|TEXTAREA)$/.test(el.tagName)){e.preventDefault();el.click()}});

/* =========================================================
   EXCEL (.xlsx) — writer nativo con stili, nessuna libreria
   ========================================================= */
const XL=(()=>{
  const T=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;T[n]=c>>>0}
  const crc=u=>{let c=0xFFFFFFFF;for(let i=0;i<u.length;i++)c=T[(c^u[i])&255]^(c>>>8);return(c^0xFFFFFFFF)>>>0};
  function zip(files){const enc=new TextEncoder(),parts=[],cen=[];let off=0;
    for(const f of files){const nm=enc.encode(f.name),data=enc.encode(f.data),c=crc(data);
      const lh=new DataView(new ArrayBuffer(30));lh.setUint32(0,0x04034b50,true);lh.setUint16(4,20,true);lh.setUint16(6,0x0800,true);lh.setUint16(12,0x21,true);lh.setUint32(14,c,true);lh.setUint32(18,data.length,true);lh.setUint32(22,data.length,true);lh.setUint16(26,nm.length,true);
      parts.push(new Uint8Array(lh.buffer),nm,data);
      const ch=new DataView(new ArrayBuffer(46));ch.setUint32(0,0x02014b50,true);ch.setUint16(4,20,true);ch.setUint16(6,20,true);ch.setUint16(8,0x0800,true);ch.setUint16(14,0x21,true);ch.setUint32(16,c,true);ch.setUint32(20,data.length,true);ch.setUint32(24,data.length,true);ch.setUint16(28,nm.length,true);ch.setUint32(42,off,true);
      cen.push(new Uint8Array(ch.buffer),nm);off+=30+nm.length+data.length}
    const cs=cen.reduce((a,b)=>a+b.length,0);const end=new DataView(new ArrayBuffer(22));end.setUint32(0,0x06054b50,true);end.setUint16(8,files.length,true);end.setUint16(10,files.length,true);end.setUint32(12,cs,true);end.setUint32(16,off,true);
    return new Blob([...parts,...cen,new Uint8Array(end.buffer)],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})}
  const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'');
  const col=i=>{let s='';i++;while(i>0){const m=(i-1)%26;s=String.fromCharCode(65+m)+s;i=Math.floor((i-1)/26)}return s};
  const ref=(r,c)=>col(c)+(r+1);
  class Book{
    constructor(){this.sheets=[];this.fonts=[];this.fills=['<fill><patternFill patternType="none"/></fill>','<fill><patternFill patternType="gray125"/></fill>'];this.borders=['<border><left/><right/><top/><bottom/><diagonal/></border>'];this.xfs=[];this.cache={};this.st({})}
    _i(a,x){let i=a.indexOf(x);if(i<0){a.push(x);i=a.length-1}return i}
    st(o){const k=JSON.stringify(o);if(k in this.cache)return this.cache[k];
      const font=this._i(this.fonts,`<font>${o.b?'<b/>':''}${o.i?'<i/>':''}<sz val="${o.sz||11}"/><color rgb="FF${o.color||'333333'}"/><name val="${o.font||'Calibri'}"/><family val="2"/></font>`);
      const fill=o.fill?this._i(this.fills,`<fill><patternFill patternType="solid"><fgColor rgb="FF${o.fill}"/><bgColor indexed="64"/></patternFill></fill>`):0;
      const bc=o.bc||'D9D9D9',sd=x=>o.border?`<${x} style="${o.border}"><color rgb="FF${bc}"/></${x}>`:`<${x}/>`;
      const border=o.border?this._i(this.borders,`<border>${sd('left')}${sd('right')}${sd('top')}${sd('bottom')}<diagonal/></border>`):0;
      const i=this.xfs.length;this.xfs.push(`<xf numFmtId="${o.num||0}" fontId="${font}" fillId="${fill}" borderId="${border}" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"${o.num?' applyNumberFormat="1"':''}><alignment horizontal="${o.h||'general'}" vertical="center"${o.wrap?' wrapText="1"':''}${o.ind?` indent="${o.ind}"`:''}/></xf>`);
      return this.cache[k]=i}
    sheet(name){const s={name:name.replace(/[\\\/?*\[\]:]/g,'').slice(0,31),cells:{},cols:{},heights:{},merges:[],freeze:null,landscape:false,tab:null,
      set(r,c,v,st){(this.cells[r]||(this.cells[r]={}))[c]={v,st};return this},
      merge(r,c1,c2,v,st){for(let c=c1;c<=c2;c++)this.set(r,c,c===c1?v:null,st);if(c2>c1)this.merges.push(ref(r,c1)+':'+ref(r,c2))}};this.sheets.push(s);return s}
    sheetXml(s){const rows=[...new Set([...Object.keys(s.cells),...Object.keys(s.heights)].map(Number))].sort((a,b)=>a-b);
      let x=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheetPr>${s.tab?`<tabColor rgb="FF${s.tab}"/>`:''}<pageSetUpPr fitToPage="1"/></sheetPr><sheetViews><sheetView workbookViewId="0" showGridLines="0"${s===this.sheets[0]?' tabSelected="1"':''}>`;
      if(s.freeze){const{r,c}=s.freeze;x+=`<pane${c?` xSplit="${c}"`:''}${r?` ySplit="${r}"`:''} topLeftCell="${ref(r,c)}" activePane="${r&&c?'bottomRight':r?'bottomLeft':'topRight'}" state="frozen"/>`}
      x+=`</sheetView></sheetViews><sheetFormatPr defaultRowHeight="18"/>`;
      const ck=Object.keys(s.cols).map(Number).sort((a,b)=>a-b);if(ck.length)x+=`<cols>${ck.map(c=>`<col min="${c+1}" max="${c+1}" width="${s.cols[c]}" customWidth="1"/>`).join('')}</cols>`;
      x+='<sheetData>';for(const r of rows){const hh=s.heights[r];x+=`<row r="${r+1}"${hh?` ht="${hh}" customHeight="1"`:''}>`;const cs=s.cells[r]||{};
        for(const c of Object.keys(cs).map(Number).sort((a,b)=>a-b)){const{v,st}=cs[c];const sa=st?` s="${st}"`:'';
          if(v==null||v==='')x+=`<c r="${ref(r,c)}"${sa}/>`;else if(typeof v==='number'&&isFinite(v))x+=`<c r="${ref(r,c)}"${sa}><v>${v}</v></c>`;else x+=`<c r="${ref(r,c)}"${sa} t="inlineStr"><is><t xml:space="preserve">${esc(v)}</t></is></c>`}
        x+='</row>'}x+='</sheetData>';
      if(s.merges.length)x+=`<mergeCells count="${s.merges.length}">${s.merges.map(m=>`<mergeCell ref="${m}"/>`).join('')}</mergeCells>`;
      return x+`<pageMargins left="0.4" right="0.4" top="0.5" bottom="0.5" header="0.3" footer="0.3"/><pageSetup paperSize="9" orientation="${s.landscape?'landscape':'portrait'}" fitToWidth="1" fitToHeight="0"/></worksheet>`}
    blob(){const n=this.sheets.length;const X='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';const files=[
      {name:'[Content_Types].xml',data:`${X}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${this.sheets.map((s,i)=>`<Override PartName="/xl/worksheets/sheet${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`},
      {name:'_rels/.rels',data:`${X}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`},
      {name:'docProps/core.xml',data:`${X}<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${esc(this.title||'')}</dc:title><dc:creator>Turnotto</dc:creator><dc:language>${LANG}</dc:language><dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString().slice(0,19)}Z</dcterms:created></cp:coreProperties>`},
      {name:'docProps/app.xml',data:`${X}<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>Turnotto</Application></Properties>`},
      {name:'xl/workbook.xml',data:`${X}<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView activeTab="0"/></bookViews><sheets>${this.sheets.map((s,i)=>`<sheet name="${esc(s.name)}" sheetId="${i+1}" r:id="rId${i+1}"/>`).join('')}</sheets></workbook>`},
      {name:'xl/_rels/workbook.xml.rels',data:`${X}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${this.sheets.map((s,i)=>`<Relationship Id="rId${i+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i+1}.xml"/>`).join('')}<Relationship Id="rId${n+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`},
      {name:'xl/styles.xml',data:`${X}<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="${this.fonts.length}">${this.fonts.join('')}</fonts><fills count="${this.fills.length}">${this.fills.join('')}</fills><borders count="${this.borders.length}">${this.borders.join('')}</borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="${this.xfs.length}">${this.xfs.join('')}</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`},
      ...this.sheets.map((s,i)=>({name:`xl/worksheets/sheet${i+1}.xml`,data:this.sheetXml(s)}))];
      return zip(files)}
  }
  return{Book};
})();

const XT={
  kawaii:{title:'FF8FB1',titleC:'FFFFFF',sub:'FFE3EC',subC:'6F5BC2',head:'B8A6FF',headC:'FFFFFF',we:'FF8FB1',weC:'FFFFFF',alt:['FFFFFF','FFF7FB'],bc:'EBDDF6',ok:'C9F2E3',okC:'1F7A5A',ko:'FFC9D4',koC:'B4234A',leave:'FFF1C9',leaveC:'9A6B00',off:'F4F1F8',accent:'6F5BC2',tab:['FF8FB1','B8A6FF','7FDDBF','FFC94D'],emoji:true,shiftFill:sh=>sh.color.replace('#','').toUpperCase().slice(0,6)},
  seria:{title:'FFFFFF',titleC:'1F3A5F',sub:'FFFFFF',subC:'5A6B7F',head:'1F3A5F',headC:'FFFFFF',we:'3B5B85',weC:'FFFFFF',alt:['FFFFFF','F3F6FA'],bc:'C9D3DF',ok:'E2EFDA',okC:'375623',ko:'F8CBAD',koC:'833C0B',leave:'EDEDED',leaveC:'595959',off:'F7F7F7',accent:'1F3A5F',tab:['1F3A5F','3B5B85','6D8BB0','A5B8CF'],emoji:false,shiftFill:(sh,i)=>['DDEBF7','E2EFDA','FCE4D6','FFF2CC','EDE7F6','E7E6E6'][i%6]}
};
/* Excel: font con buon supporto per la lingua */
const xlFont=()=>({ja:'Meiryo',zh:'Microsoft YaHei',ko:'Malgun Gothic'})[LANG]||'Calibri';
function exportXlsx(plan,themeKey){
  const th=XT[themeKey],B=new XL.Book(),an=analyze(plan),ctx=an.ctx,rows=planRows(plan),start=ctx.start,N=ctx.nDays;B.title=plan.name;
  const F=xlFont(),E=s=>th.emoji?s+' ':'',r1=m=>Math.round(m/6)/10;
  const S=o=>B.st({font:F,...o});
  const sTitle=S({b:1,sz:18,color:th.titleC,fill:th.title,h:'left',ind:1}),sSub=S({sz:11,color:th.subC,fill:th.sub,h:'left',ind:1,i:1});
  const brd={border:'thin',bc:th.bc};
  const sHead=S({b:1,color:th.headC,fill:th.head,h:'center',wrap:1,...brd}),sHeadL=S({b:1,color:th.headC,fill:th.head,h:'left',ind:1,...brd}),sWe=S({b:1,color:th.weC,fill:th.we,h:'center',wrap:1,...brd});
  const Z=f=>[0,1].map(i=>S({fill:th.alt[i],...brd,...f}));
  const sName=Z({b:1,color:th.accent,h:'left',ind:1}),sCell=Z({h:'center',wrap:1,sz:10}),sNum=Z({h:'center',num:2}),sNumB=Z({b:1,h:'center',num:2,color:th.accent}),sTxt=Z({h:'left',ind:1,wrap:1});
  const sLeave=S({b:1,fill:th.leave,color:th.leaveC,h:'center',wrap:1,sz:10,...brd}),sOff=S({fill:th.off,color:'A0A0A0',h:'center',sz:9,i:1,...brd});
  const sOk=S({b:1,fill:th.ok,color:th.okC,h:'center',...brd}),sKo=S({b:1,fill:th.ko,color:th.koC,h:'center',...brd}),sWarn=S({b:1,fill:th.leave,color:th.leaveC,h:'center',...brd}),sNa=S({color:'BBBBBB',h:'center',...brd});
  const shSt={};plan.shifts.forEach((sh,i)=>{shSt[sh.id]=S({b:1,fill:th.shiftFill(sh,i),h:'center',wrap:1,sz:10,color:'3A3150',...brd})});
  const isWe=d=>wdAt(ctx,d)>4;const per=`${fmtDY(start)} – ${fmtDY(addDays(start,N-1))}`;const dvSt=dv=>dv>2?sKo:dv<-2?sWarn:sOk;
  /* --- Foglio 1: Turni --- */
  const s1=B.sheet(E('🦉')+t('xs.shifts'));s1.landscape=true;s1.tab=th.tab[0];const lastC=N+4;
  s1.merge(0,0,lastC,`${E('🦉')}${plan.name}`,sTitle);s1.heights[0]=36;
  s1.merge(1,0,lastC,`${E('📅')}${t('xl.period',{p:per})}   ·   ${t('xl.people',{n:rows.length})}   ·   ${t('xl.coverage',{p:Math.round(an.have/Math.max(1,an.need)*100)})}   ·   ${t('xl.generated',{d:fmtDY(today())})}`,sSub);s1.heights[1]=22;s1.heights[2]=8;
  const HR=3;s1.set(HR,0,t('plan.person'),sHeadL).set(HR,1,t('xl.weeklyH'),sHead);
  for(let d=0;d<N;d++){const dt=addDays(start,d);s1.set(HR,2+d,`${DAYS[wdOf(dt)]}\n${fmtD(dt)}`,isWe(d)?sWe:sHead)}
  s1.set(HR,N+2,t('xl.plannedH'),sHead).set(HR,N+3,t('xl.target'),sHead).set(HR,N+4,t('xl.diff'),sHead);s1.heights[HR]=34;
  const by={};plan.assign.forEach(a=>(by[a.staffId+'|'+a.d]||(by[a.staffId+'|'+a.d]=[])).push(a));
  rows.forEach((r,i)=>{const R=HR+1+i,z=i%2,p=staffById(r.id);s1.heights[R]=32;s1.set(R,0,r.name,sName[z]).set(R,1,+r.hours||0,sNum[z]);
    for(let d=0;d<N;d++){const dt=addDays(start,d);const as=(by[r.id+'|'+d]||[]).map(a=>ctx.shiftMap[a.shiftId]).filter(Boolean).sort((a,b)=>toMin(a.start)-toMin(b.start));const lv=leaveOn(r.id,dt);
      if(as.length)s1.set(R,2+d,as.map(sh=>`${E(sh.emoji)}${shiftName(sh)}\n${sh.start}–${sh.end}`).join('\n'),shSt[as[0].id]);
      else if(lv)s1.set(R,2+d,`${E(ltEmo(lv.type))}${ltName(lv.type).toLocaleUpperCase(loc())}${lv.full===false?`\n${lv.hFrom}–${lv.hTo}`:''}`,sLeave);
      else if(p&&(p.offDays||[]).includes(wdOf(dt)))s1.set(R,2+d,t('xl.na'),sOff);
      else s1.set(R,2+d,'',sCell[z])}
    const hs=an.hours[r.id];const dv=r1(hs.done-hs.tgt);s1.set(R,N+2,r1(hs.done),sNumB[z]).set(R,N+3,r1(hs.tgt),sNum[z]).set(R,N+4,dv,dvSt(dv))});
  let R=HR+2+rows.length;s1.heights[R-1]=10;
  s1.merge(R,0,1,`${E('👥')}${t('xl.covT')}`,sHeadL);for(let d=0;d<N;d++){const dt=addDays(start,d);s1.set(R,2+d,`${DAYS[wdOf(dt)]} ${fmtD(dt)}`,isWe(d)?sWe:sHead)}s1.heights[R]=24;R++;
  plan.shifts.forEach(sh=>{s1.merge(R,0,1,`${E(sh.emoji)}${shiftName(sh)} ${sh.start}–${sh.end}`,shSt[sh.id]);for(let d=0;d<N;d++){const c=an.cov[d+'|'+sh.id];s1.set(R,2+d,c.need||c.have?`${c.have}/${c.need}`:'—',!c.need&&!c.have?sNa:c.have<c.need?sKo:sOk)}s1.heights[R]=22;R++});
  R++;s1.merge(R,0,lastC,`${E('📝')}${t('xl.legend')}: ${plan.shifts.map(sh=>`${E(sh.emoji)}${shiftName(sh)} ${sh.start}–${sh.end}`).join('  ·  ')}  ·  ${t('xl.legendNa')}  ·  ${t('xl.legendDiff')}`,S({i:1,sz:9,color:'7F7F7F',h:'left',wrap:1}));s1.heights[R]=30;
  s1.cols[0]=24;s1.cols[1]=10;for(let d=0;d<N;d++)s1.cols[2+d]=N>21?11:13;s1.cols[N+2]=12;s1.cols[N+3]=10;s1.cols[N+4]=8;s1.freeze={r:HR+1,c:2};
  /* --- Foglio 2: Riepilogo ore --- */
  const s2=B.sheet(E('⏱️')+t('xs.hours'));s2.tab=th.tab[1];s2.landscape=true;
  const hd2=[t('plan.person'),t('xl.role'),t('xl.contractW'),t('xl.absDays'),t('xl.targetP'),t('xl.plannedH'),t('xl.diff'),t('xl.nShifts'),...Array.from({length:ctx.weeks},(_,w)=>`${t('xl.week',{n:w+1})}\n${fmtD(addDays(start,w*7))}`),t('xl.constraints')];
  s2.merge(0,0,hd2.length-1,`${E('⏱️')}${t('xl.hSum',{name:plan.name})}`,sTitle);s2.heights[0]=34;s2.merge(1,0,hd2.length-1,t('xl.period',{p:per}),sSub);s2.heights[2]=8;
  hd2.forEach((x,c)=>s2.set(3,c,x,c===0?sHeadL:sHead));s2.heights[3]=34;
  rows.forEach((r,i)=>{const RR=4+i,z=i%2,hs=an.hours[r.id],p=staffById(r.id);const dv=r1(hs.done-hs.tgt);s2.heights[RR]=22;
    const vinc=p?[p.offDays?.length?t('staff.no',{x:p.offDays.map(d=>DAYS[d]).join(', ')}):'',...(p.slots||[]).map(s=>`${s.day===-1?t('staff.everyDay'):DAYS[s.day]} ${s.from}–${s.to}`),...(p.noShifts||[]).map(id=>t('staff.no',{x:shiftName(plan.shifts.find(s=>s.id===id))}))].filter(Boolean).join(' · '):'';
    [r.name,r.role||'',+r.hours||0,hs.lv||0,r1(hs.tgt),r1(hs.done),dv,hs.n,...hs.weeks.map(r1),vinc||'—'].forEach((v,c)=>s2.set(RR,c,v,c===0?sName[z]:c===1||c===hd2.length-1?sTxt[z]:c===6?dvSt(dv):c===5?sNumB[z]:sNum[z]))});
  const TR=4+rows.length,tot=k=>rows.reduce((a,r)=>a+an.hours[r.id][k],0);
  s2.set(TR,0,t('xl.total'),sHeadL);for(let c=1;c<hd2.length;c++)s2.set(TR,c,'',sHead);s2.set(TR,2,rows.reduce((a,r)=>a+(+r.hours||0),0),sHead).set(TR,4,r1(tot('tgt')),sHead).set(TR,5,r1(tot('done')),sHead).set(TR,7,tot('n'),sHead);s2.heights[TR]=24;
  [24,16,12,10,12,12,11,9,...Array(ctx.weeks).fill(11),46].forEach((w,c)=>s2.cols[c]=w);s2.freeze={r:4,c:1};
  /* --- Foglio 3: Ferie --- */
  const s3=B.sheet(E('🏖️')+t('xs.leave'));s3.tab=th.tab[2];
  const endK=keyOf(addDays(start,N-1)),stK=keyOf(start);const ls=state.leaves.filter(l=>l.from<=endK&&(l.to||l.from)>=stK).sort((a,b)=>a.from<b.from?-1:1);
  s3.merge(0,0,5,`${E('🏖️')}${t('xl.leaveIn')}`,sTitle);s3.heights[0]=34;s3.merge(1,0,5,per,sSub);s3.heights[2]=8;
  [t('plan.person'),t('leave.type'),t('leave.from'),t('leave.to'),t('xl.time'),t('staff.note')].forEach((x,c)=>s3.set(3,c,x,c===0?sHeadL:sHead));s3.heights[3]=24;
  if(!ls.length)s3.merge(4,0,5,t('xl.noLeave'),sTxt[0]);
  ls.forEach((l,i)=>{const z=i%2,p=staffById(l.staffId);[p?.name||'—',`${E(ltEmo(l.type))}${ltName(l.type)}`,fmtDY(parseDate(l.from)),fmtDY(parseDate(l.to||l.from)),l.full===false?`${l.hFrom}–${l.hTo}`:t('leave.fullDay'),l.note||''].forEach((v,c)=>s3.set(4+i,c,v,c===0?sName[z]:c===5?sTxt[z]:sCell[z]));s3.heights[4+i]=22});
  [24,16,13,13,16,36].forEach((w,c)=>s3.cols[c]=w);s3.freeze={r:4,c:0};
  /* --- Foglio 4: Regole e avvisi --- */
  const s4=B.sheet(E('⚙️')+t('xs.rules'));s4.tab=th.tab[3];const ST=state.settings;
  s4.merge(0,0,9,`${E('⚙️')}${t('xl.rulesT')}`,sTitle);s4.heights[0]=34;s4.heights[1]=8;
  s4.set(2,0,t('xl.rule'),sHeadL).set(2,1,t('xl.value'),sHead);s4.heights[2]=24;
  [['consecT',ST.maxConsecutive+' h'],['restT',ST.minRest+' h'],['weekRestT',ST.minWeeklyRest+' h'],['biRestT',ST.minBiweeklyRest+' h'],['maxWT',ST.maxWeekly+' h'],['maxBT',ST.maxBiweekly+' h'],['otT',ST.overtime+' h']].forEach(([a,b],i)=>{s4.set(3+i,0,t('rule.'+a),sName[i%2]).set(3+i,1,b,sCell[i%2]);s4.heights[3+i]=20});
  let r4=11;s4.set(r4,0,t('xl.shift'),sHeadL).set(r4,1,t('xl.time'),sHead);DAYS.forEach((d,w)=>s4.set(r4,2+w,d,w>4?sWe:sHead));s4.set(r4,9,t('xl.duration'),sHead);s4.heights[r4]=24;
  plan.shifts.forEach((sh,i)=>{r4++;s4.set(r4,0,`${E(sh.emoji)}${shiftName(sh)}`,shSt[sh.id]).set(r4,1,`${sh.start}–${sh.end}`,shSt[sh.id]);DAYS.forEach((d,w)=>s4.set(r4,2+w,+sh.need[w]||0,sCell[i%2]));const[a,b]=shiftSpan(sh);s4.set(r4,9,(b-a)/60,sNum[i%2]);s4.heights[r4]=20});
  r4+=2;s4.merge(r4,0,9,`${E('⚠️')}${t('xl.warnT',{v:an.nViol,u:an.uncovered})}`,sHeadL);s4.heights[r4]=24;
  const vl=Object.entries(an.viol);if(!vl.length&&!an.uncovered)s4.merge(++r4,0,9,`${E('✅')}${t('xl.allOk')}`,sOk);
  vl.forEach(([k,v],i)=>{const[sid,d]=k.split('|');r4++;s4.set(r4,0,rows.find(x=>x.id===sid)?.name||'',sName[i%2]).set(r4,1,fmtDY(addDays(start,+d)),sCell[i%2]);s4.merge(r4,2,9,v.join(' · '),sTxt[i%2])});
  for(let d=0;d<N;d++)for(const sh of plan.shifts){const c=an.cov[d+'|'+sh.id];if(c.have<c.need){r4++;s4.set(r4,0,t('xl.uncov',{s:shiftName(sh)}),sKo).set(r4,1,fmtDY(addDays(start,d)),sKo);s4.merge(r4,2,9,t('xl.missing',{n:c.need-c.have,a:c.have,b:c.need}),sKo)}}
  [32,14,7,7,7,7,7,7,7,10].forEach((w,c)=>s4.cols[c]=w);
  return B.blob();
}
function xlDialog(plan){
  let th=state.settings.xlTheme||'kawaii';
  const mini0=k=>{const x=XT[k];const c=(bg,fg='333')=>`background:#${bg};color:#${fg}`;return `<div class="xlmini" aria-hidden="true" style="box-shadow:var(--sh2)"><div style="grid-template-columns:1fr;${c(x.title,x.titleC)}"><span style="font-size:11px">${x.emoji?ic('owl')+' ':''}${h(plan.name)}</span></div><div><span style="${c(x.head,x.headC)}">${t('plan.person')}</span><span style="${c(x.head,x.headC)}">${h(DAYS[0])}</span><span style="${c(x.head,x.headC)}">${h(DAYS[1])}</span><span style="${c(x.we,x.weC)}">${h(DAYS[5])}</span><span style="${c(x.we,x.weC)}">${h(DAYS[6])}</span></div>${[0,1,2].map(i=>`<div><span style="${c(x.alt[i%2],x.accent)}">${['Giulia','Marco','Sara'][i]}</span>${[0,1,2,3].map(j=>{const n=plan.shifts.length;const sh=plan.shifts[(i+j)%n];return sh?`<span style="${c(x.shiftFill(sh,(i+j)%n))}">${x.emoji?sh.emoji:h([...shiftName(sh)].slice(0,3).join(''))}</span>`:'<span></span>'}).join('')}</div>`).join('')}</div>`};
  const mini=k=>mini0(k).replace(/>([^<>]+)<\/span>/g,'><b class="xb"></b></span>');
  modal(`${ic('sheet')} ${t('xl.title')}`,`<p class="muted" style="font-weight:700;margin-top:0">${t('xl.choose')}</p>
  <div class="xlprev" role="group" aria-label="${h(t('xl.title'))}"><button type="button" class="xlopt ${th==='kawaii'?'on':''}" data-th="kawaii" aria-pressed="${th==='kawaii'}"><b>${ic('flower')} ${t('xl.kawaii')}</b><div class="muted" style="font-size:12px;margin-bottom:6px">${t('xl.kawaiiD')}</div>${mini('kawaii')}</button>
  <button type="button" class="xlopt ${th==='seria'?'on':''}" data-th="seria" aria-pressed="${th==='seria'}"><b>${ic('briefcase')} ${t('xl.serious')}</b><div class="muted" style="font-size:12px;margin-bottom:6px">${t('xl.seriousD')}</div>${mini('seria')}</button></div>
  <div class="actions"><button class="btn ghost" data-close>${t('btn.cancel')}</button><button class="btn pri" id="xlGo">${ic('download')} ${t('xl.download')}</button></div>`,{onMount(m,close){
    m.querySelectorAll('[data-th]').forEach(o=>o.onclick=()=>{th=o.dataset.th;m.querySelectorAll('[data-th]').forEach(x=>{x.classList.toggle('on',x===o);x.setAttribute('aria-pressed',x===o)})});
    m.querySelector('[data-close]').onclick=close;
    m.querySelector('#xlGo').onclick=async()=>{state.settings.xlTheme=th;save();try{const blob=exportXlsx(plan,th);close();if(await saveFile(blob,`Turnotto-${slug(plan.name)}-${th}.xlsx`,'Excel'))toast(`${t('xl.ready')}`),confetti()}catch(e){console.error(e);toast(`${t('xl.error')} ${ic('sad')}`)}};
  }});
}

/* ---------------- PWA ---------------- */
const isIOS=()=>/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const isStandalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
let deferredPrompt=null;
addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('#installBtn').classList.remove('hide')});
$('#installBtn').onclick=async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();const r=await deferredPrompt.userChoice;deferredPrompt=null;$('#installBtn').classList.add('hide');if(r.outcome==='accepted'){toast(ic('sparkle')+' '+t('pwa.installed'));confetti()}};
addEventListener('appinstalled',()=>$('#installBtn').classList.add('hide'));
if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1'))addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));

/* ---------------- versione, wizard ---------------- */
const APP_VERSION='1.2.0',AUTHOR='Marco (Marketto)',REPO_URL='https://github.com/Marketto/turnotto';
/* novità per versione: chiavi cl.<versione>.<lettera> in lang/*.json */
const CHANGELOG={'1.0.0':['a','b','c','d'],'1.0.1':[],'1.1.0':['a','b'],'1.2.0':['a','b','c','d']};
const MKEY='turnotto.meta';
const getMeta=()=>{try{return JSON.parse(localStorage.getItem(MKEY))||{}}catch(e){return{}}};
const setMeta=m=>{try{localStorage.setItem(MKEY,JSON.stringify({...getMeta(),...m}))}catch(e){}};
const vcmp=(a,b)=>{const x=String(a).split('.').map(Number),y=String(b).split('.').map(Number);for(let i=0;i<3;i++){if((x[i]||0)!==(y[i]||0))return(x[i]||0)-(y[i]||0)}return 0};
function wizard(full){
  const meta=getMeta();
  const news=Object.keys(CHANGELOG).filter(v=>meta.seen&&vcmp(v,meta.seen)>0&&CHANGELOG[v].length).sort(vcmp);
  let choice=state.demo?'sample':'keep';
  const steps=full?['welcome','lang','how','data','privacy']:['news'];
  if(full&&meta.accepted)steps.pop();
  let i=0;
  const bg=modal('',`<div class="steps"></div><div class="wbody"></div><div class="actions" style="justify-content:space-between"><button class="btn ghost" data-w="back"></button><button class="btn pri" data-w="next"></button></div>`);
  const m=bg.querySelector('.modal');m.classList.add('wiz');m.setAttribute('aria-label',t('wiz.welcomeT'));
  bg.dataset.lock='1';
  const body=m.querySelector('.wbody');
  const draw=()=>{const st=steps[i];
    m.querySelector('.steps').setAttribute('aria-hidden','true');m.querySelector('.steps').innerHTML=steps.length>1?steps.map((_,k)=>`<i class="${k===i?'on':''}"></i>`).join(''):'';
    const back=m.querySelector('[data-w=back]');back.innerHTML=i?`${ic('chev-left')} ${t('wiz.back')}`:t('wiz.skip');back.style.visibility=(i===0&&st==='privacy')?'hidden':'visible';
    if(steps.includes('privacy')&&!getMeta().accepted&&i===0)back.style.visibility='hidden';
    m.querySelector('[data-w=next]').innerHTML=i===steps.length-1?`${t('wiz.start')} ${ic('sparkle')}`:`${t('wiz.next')} ${ic('chev-right')}`;
    let html='';
    if(st==='welcome')html=`${owl(150)}<h2 style="color:var(--lavd)">${t('wiz.welcomeT')}</h2><p style="font-weight:700">${t('wiz.welcomeD')}</p>`;
    if(st==='lang')html=`<h2 style="color:var(--lavd)">${ic('globe')} ${t('lang.title')}</h2><div class="langgrid">${Object.keys(LANGS).sort((a,b)=>LANGS[a].localeCompare(LANGS[b],'en')).map(c=>`<button type="button" data-l="${c}" lang="${c}" class="${c===LANG?'on':''}" aria-pressed="${c===LANG}"><span>${LANGS[c]}</span><small aria-hidden="true">${c.toUpperCase()}</small></button>`).join('')}</div>`;
    if(st==='how')html=`<h2 style="color:var(--lavd)">${ic('wand')} ${t('wiz.howT')}</h2><ol>${[['team',1],['beach',2],['gear',3],['sparkle',4],['sheet',5]].map(([e,k])=>`<li>${ic(e)} ${t('wiz.how'+k)}</li>`).join('')}</ol>`;
    if(st==='data')html=`<h2 style="color:var(--lavd)">${ic('heart')} ${t('wiz.dataT')}</h2><p style="font-weight:700">${t('wiz.dataD')}</p><div class="choice"><button type="button" data-c="sample" aria-pressed="${choice==='sample'}" class="${choice==='sample'?'on':''}">${ic('flask')}${t('wiz.sample')}</button><button type="button" data-c="empty" aria-pressed="${choice==='empty'}" class="${choice==='empty'?'on':''}">${ic('sprout')}${t('wiz.empty')}</button></div>`;
    if(st==='privacy')html=`${owl(90)}<h2 style="color:var(--lavd)">${ic('lock')} ${t('info.privacyT')} · ${t('info.disclT')}</h2><ul style="font-size:13.5px">${['p1','p3','d1','d3'].map(k=>`<li>${t('info.'+k)}</li>`).join('')}</ul><details style="text-align:left;width:100%"><summary style="cursor:pointer;font-weight:800;color:var(--lavd)">${t('wiz.read')}</summary><div class="info" style="font-size:13px;max-height:200px;overflow:auto"><h3>${t('info.privacyT')}</h3><ul>${[1,2,3,4,5,6].map(k=>`<li>${t('info.p'+k)}</li>`).join('')}</ul><h3>${t('info.disclT')}</h3><ul>${[1,2,3,4].map(k=>`<li>${t('info.d'+k)}</li>`).join('')}</ul></div></details><label class="acc"><input type="checkbox" id="wAcc">${t('wiz.accept')}</label>`;
    if(st==='news')html=`${owl(110)}${news.map(v=>`<h2 style="color:var(--lavd)">${ic('sparkle')} ${t('wiz.newT',{v})}</h2><ul>${CHANGELOG[v].map(k=>`<li>${t(`cl.${v}.${k}`)}</li>`).join('')}</ul>`).join('')}`;
    body.innerHTML=html;body.style.animation='none';void body.offsetWidth;body.style.animation='';
  };
  const finish=()=>{if(full&&steps.includes('data')){if(choice==='empty'&&state.demo){state=freshState(false);save()}else if(choice==='sample'&&!state.demo&&!state.staff.length){state=freshState(true);save()}}
    setMeta({seen:APP_VERSION,...(steps.includes('privacy')||getMeta().accepted?{accepted:true}:{})});closeModal(bg,true);render();confetti();owlJump();setTimeout(()=>{const h1=$('#view h1');if(h1){h1.setAttribute('tabindex','-1');h1.focus({preventScroll:true})}},260)};
  m.addEventListener('click',async e=>{
    const l=e.target.closest('[data-l]');if(l){await setLang(l.dataset.l,true);draw();renderNav();return}
    const c=e.target.closest('[data-c]');if(c){choice=c.dataset.c;draw();return}
    const w=e.target.closest('[data-w]');if(!w)return;
    if(w.dataset.w==='back'){if(i===0){if(steps.includes('privacy')){i=steps.length-1;draw()}else finish()}else{i--;draw()}return}
    if(steps[i]==='privacy'&&!m.querySelector('#wAcc').checked){toast(t('wiz.needAccept'));m.querySelector('.acc').animate([{transform:'translateX(-8px)'},{transform:'translateX(8px)'},{transform:'none'}],{duration:300});return}
    if(i<steps.length-1){i++;draw()}else finish();
  });
  draw();
}

/* ---------------- avvio ---------------- */
(async()=>{
  applyTheme();$('#minilogo').innerHTML=owl(34);
  await setLang(detectLang(),false);
  load();render();
  const meta=getMeta();
  if(!meta.seen||!meta.accepted)wizard(true);
  else if(vcmp(APP_VERSION,meta.seen)>0){if(Object.keys(CHANGELOG).some(v=>vcmp(v,meta.seen)>0&&CHANGELOG[v].length))wizard(false);else setMeta({seen:APP_VERSION})}
  const sp=$('#splash');sp.style.transition='opacity .35s';sp.style.opacity='0';setTimeout(()=>sp.remove(),400);
})();
