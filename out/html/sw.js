const CACHE_NAME = 'pwa-cache-v2'; // bump version when you change cached files
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
  './logos/favicon.ico'
];

// Install Event: Cache essential app shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
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

// Fetch Event: Serve cached content offline, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
