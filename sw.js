const CACHE = 'myvoice-v1';
const ASSETS = ['/'];

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
  if (e.request.method !== 'GET') return;
  
  // Estratégia Network First: tenta a rede primeiro, se falhar usa o cache.
  // Isso evita que o usuário veja conteúdo antigo ou fique preso em um estado de carregamento infinito se o cache estiver corrompido.
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Só faz cache de requisições bem-sucedidas
        if (res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
