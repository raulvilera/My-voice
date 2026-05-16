const CACHE = 'myvoice-v2';
const ASSETS = ['/'];

// URLs que NUNCA devem ser cacheadas (APIs externas)
const BYPASS_URLS = [
  'supabase.co',
  'supabase.com',
  'anthropic.com',
  'googleapis.com',
];

const shouldBypass = (url) =>
  BYPASS_URLS.some(domain => url.includes(domain));

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Nunca intercepta chamadas à API
  if (shouldBypass(e.request.url)) return;
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
