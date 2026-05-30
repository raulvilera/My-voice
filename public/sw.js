// Service Worker v3 — força limpeza do cache de icones PWA
const CACHE_VERSION = 'myvoice-v4';
const ICON_URLS = ['/icon-48_v4.png', '/icon-192_v4.png', '/icon-512_v4.png', '/icon-180_v4.png', '/my_voice_default_v4.png'];

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
  const urlPath = new URL(event.request.url).pathname;
  if (ICON_URLS.some((u) => urlPath.endsWith(u))) {
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
