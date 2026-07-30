const CACHE_NAME = "zencash-shell-v1";
const APP_SHELL = ["/", "/manifest.json", "/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.pathname.startsWith("/api/")) {
    // Network-first para datos: si falla, deja que la cola offline (Dexie) se encargue.
    event.respondWith(fetch(request).catch(() => caches.match(request)));
    return;
  }

  // Cache-first para el app shell y assets estáticos.
  event.respondWith(caches.match(request).then((cached) => cached ?? fetch(request)));
});
