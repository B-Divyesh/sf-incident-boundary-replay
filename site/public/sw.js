const CACHE = 'boundary-replay-v2';
const BUILD_ASSETS = /* __BOUNDARY_REPLAY_ASSETS__ */ [];
const SHELL = ['/', '/demo', '/privacy', '/terms', '/404.html', '/404.css', '/favicon.svg', ...BUILD_ASSETS];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).then(response => {
    const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(event.request, copy)); return response;
  }).catch(() => caches.match(event.request, { ignoreVary: true }).then(hit => hit || (event.request.mode === 'navigate' ? caches.match('/', { ignoreVary: true }) : undefined))));
});
