// Service Worker v2 — força limpeza do cache de icones PWA
const CACHE_VERSION = 'myvoice-v3-lv';
const ICON_URLS = ['/icon-48.png', '/icon-192.png', '/icon-512.png', '/icon-180.png', '/my_voice_default.png'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(ICON_URLS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Rede primeiro para icones, cache como fallback
self.addEventListener('fetch', (event) => {
  if (ICON_URLS.some((u) => event.request.url.endsWith(u))) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
  }
});
