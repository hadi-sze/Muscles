const CACHE = 'musclewiki-pwa-755aad5f17ee170d';
const ASSETS = ["/apple-touch-icon.png","/assets/index-Curi0Q3b.css","/assets/index-DhpmzOUm.js","/favicon.svg","/icon-192.png","/icon-512.png","/icon-maskable.png","/index.html","/manifest.webmanifest"];
self.addEventListener('install', event => {
 event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
 // Updates wait until every old app window is closed, preserving active timers.
});
self.addEventListener('activate', event => {
 event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(key=>key.startsWith('musclewiki-pwa-')&&key!==CACHE).map(key=>caches.delete(key)));
  await self.clients.claim();
 })());
});
self.addEventListener('fetch', event => {
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin)return;
 // Health checks must reach the network, even when the app is available offline.
 if(url.pathname==='/health.json')return;
 if(request.mode==='navigate'){
  event.respondWith(caches.open(CACHE).then(async cache=>(await cache.match('/index.html'))||fetch(request)));
  return;
 }
 if(ASSETS.includes(url.pathname)){
  event.respondWith(caches.open(CACHE).then(async cache=>(await cache.match(url.pathname))||fetch(request)));
 }
});
