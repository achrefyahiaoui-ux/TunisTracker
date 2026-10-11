/* TunisTracker service worker: network-first for the page, cache fallback when offline. */
const CACHE='tunistracker-v1';
self.addEventListener('install',e=>{ self.skipWaiting(); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET') return;
  const u=new URL(r.url);
  const own=u.origin===location.origin;
  const font=u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com';
  if(!own && !font) return;
  if(own){ // network first, fall back to cache
    e.respondWith(fetch(r).then(res=>{ if(res.ok){ const c=res.clone(); caches.open(CACHE).then(x=>x.put(r,c)); } return res; }).catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||caches.match('/index.html')||caches.match('/'))));
  } else { // fonts: cache first
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{ const c=res.clone(); caches.open(CACHE).then(x=>x.put(r,c)); return res; })));
  }
});
