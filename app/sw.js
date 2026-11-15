/* Turnotto – service worker (offline). ASSETS e VERSION sono generati da tools/build.mjs: non modificare a mano. */
const VERSION = 'turnotto-1.0.0-69366c15';
const ASSETS = ["./","./app.js","./fonts.css","./fonts/baloo-2-latin-700-normal.woff2","./fonts/baloo-2-latin-800-normal.woff2","./fonts/baloo-2-latin-ext-700-normal.woff2","./fonts/baloo-2-latin-ext-800-normal.woff2","./fonts/nunito-cyrillic-400-normal.woff2","./fonts/nunito-cyrillic-700-normal.woff2","./fonts/nunito-cyrillic-800-normal.woff2","./fonts/nunito-cyrillic-ext-400-normal.woff2","./fonts/nunito-cyrillic-ext-700-normal.woff2","./fonts/nunito-cyrillic-ext-800-normal.woff2","./fonts/nunito-latin-400-normal.woff2","./fonts/nunito-latin-700-normal.woff2","./fonts/nunito-latin-800-normal.woff2","./fonts/nunito-latin-ext-400-normal.woff2","./fonts/nunito-latin-ext-700-normal.woff2","./fonts/nunito-latin-ext-800-normal.woff2","./icon.svg","./icons/apple-touch-icon.png","./icons/favicon.svg","./icons/icon-192.png","./icons/icon-512.png","./icons/maskable-512.png","./index.html","./lang/be.json","./lang/bg.json","./lang/bs.json","./lang/ca.json","./lang/cs.json","./lang/da.json","./lang/de.json","./lang/el.json","./lang/en.json","./lang/es.json","./lang/et.json","./lang/fi.json","./lang/fr.json","./lang/ga.json","./lang/hr.json","./lang/hu.json","./lang/is.json","./lang/it.json","./lang/ja.json","./lang/ko.json","./lang/lb.json","./lang/lt.json","./lang/lv.json","./lang/mk.json","./lang/mt.json","./lang/nb.json","./lang/nl.json","./lang/pl.json","./lang/pt.json","./lang/ro.json","./lang/ru.json","./lang/sk.json","./lang/sl.json","./lang/sq.json","./lang/sr.json","./lang/sv.json","./lang/tr.json","./lang/uk.json","./lang/zh.json","./manifest.webmanifest"];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(r => {
    if (r.ok) { const copy = r.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
    return r;
  })));
});
