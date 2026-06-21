const CACHE_NAME = 'help-vitall-cache-v3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/env.js',
  './js/db.js',
  './js/app.js',
  './Pngss/logo.png',
  './Pngss/logohel.png',
  'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).catch(err => {
      console.warn('Failed to cache assets during install:', err);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only intercept requests for local assets or standard CDN imports
  const url = new URL(event.request.url);
  const isLocal = url.origin === self.location.origin;
  const isCDN = url.hostname.includes('jsdelivr.net');

  if (event.request.method !== 'GET' || (!isLocal && !isCDN)) {
    return; // Pass through to network directly (e.g. Supabase POST/PATCH operations)
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Stale-while-revalidate for background updates
        fetch(event.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {}); // silent catch for network connection errors
        return cachedResponse;
      }
      return fetch(event.request);
    }).catch(() => {
      // Fallback
    })
  );
});
