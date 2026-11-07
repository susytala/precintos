// Service worker — Precintos de Seguridad
// Para publicar cambios del sitio, subí la versión (v12 → v13) así los clientes actualizan.
const VERSION = "v12";
const CACHE = "precintos-" + VERSION;
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./maskable-512.png", "./apple-touch-icon.png", "./favicon-32.png"];
const NET_TIMEOUT = 3500; // ms: si la red tarda más, se muestra la copia guardada

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith("precintos-") && k !== CACHE).map(k => caches.delete(k)));
    // Precarga de navegación: la red arranca en paralelo con el service worker
    if (self.registration.navigationPreload) { try { await self.registration.navigationPreload.enable(); } catch (_) {} }
    await self.clients.claim();
  })());
});

// Red con límite de tiempo
function fromNetwork(e) {
  const net = (async () => (await e.preloadResponse) || fetch(e.request))();
  const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), NET_TIMEOUT));
  return Promise.race([net, timeout]);
}

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;        // Tawk.to, WhatsApp, etc. van directo a la red

  // Páginas: red primero (siempre lo último); si falla, tarda o responde con error, usa la copia guardada
  if (req.mode === "navigate") {
    e.respondWith((async () => {
      try {
        const res = await fromNetwork(e);
        if (res && res.ok) {
          const copy = res.clone();
          e.waitUntil(caches.open(CACHE).then(c => c.put("./index.html", copy)).catch(() => {}));
          return res;
        }
        throw new Error("bad response");
      } catch (_) {
        const hit = await caches.match("./index.html");
        if (hit) return hit;
        return fetch(req); // sin copia guardada: intento normal
      }
    })());
    return;
  }
  // Archivos estáticos (íconos, manifest): primero la copia guardada
  e.respondWith((async () => {
    const hit = await caches.match(req);
    if (hit) return hit;
    const res = await fetch(req);
    if (res.ok) { const copy = res.clone(); e.waitUntil(caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {})); }
    return res;
  })());
});
