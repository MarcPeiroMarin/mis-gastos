// Mis Gastos: funciona sin conexión. Red primero para la app (así llegan las actualizaciones), caché como respaldo.
const C = "mis-gastos-v1";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-180.png", "./icon-192.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);
  const keep = res => { if (res && (res.ok || res.type === "opaque")) { const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)); } return res; };
  if (u.origin === location.origin) {
    e.respondWith(fetch(r).then(keep).catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || caches.match("./index.html"))));
  } else if (/(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)) {
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(keep)));
  }
});
