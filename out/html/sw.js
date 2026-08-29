const CACHE_NAME = 'pwa-cache-v3'; // bump version when you change cached files

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './game.css',
  './core.js',
  './game.js',
  './jquery-1.11.1.min.js',
  './d3.v7.min.js',
  './d3-parliament.js',
  './d3-linegraph.js',
  './logos/android-chrome-192x192.png',
  './logos/android-chrome-512x512.png',
  './logos/apple-touch-icon.png',
  './logos/favicon.ico',
  './logos/favicon-16x16.png',
  './logos/favicon-32x32.png'
];

// Install Event: Cache essential app shell assets.
// Cache each file individually (instead of cache.addAll) so one missing
// file doesn't silently abort caching everything else.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      const results = await Promise.allSettled(
        ASSETS_TO_CACHE.map((asset) => cache.add(asset))
      );
      results.forEach((result, i) => {
        if (result.status === 'rejected') {
          console.error('SW install: failed to cache', ASSETS_TO_CACHE[i], result.reason);
        }
      });
    })
  );
  self.skipWaiting();
});

// Activate Event: Clean up old caches if version changes
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: Cache-first for the app shell, with runtime caching for
// everything else (img/, music/ — the ~220 files we deliberately don't
// precache) so they get cached the first time they're actually used.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then((networkResponse) => {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type === 'basic'
        ) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse);
    })
  );
});
