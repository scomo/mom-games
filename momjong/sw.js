const CACHE_NAME = 'mahjong-cache-v1';
const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

// 1. Install Event: Cache the core files immediately
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
    // Force the waiting service worker to become the active service worker
    self.skipWaiting(); 
});

// 2. Activate Event: Clean up any old caches if you change the CACHE_NAME
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    // Take control of the page immediately without requiring a refresh
    self.clients.claim(); 
});

// 3. Fetch Event: Network-First strategy
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request).then(response => {
            // If the network fetch is successful, update the cache with the newest version
            return caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, response.clone());
                return response;
            });
        }).catch(() => {
            // If the network fails (offline), return the cached version
            return caches.match(event.request);
        })
    );
});