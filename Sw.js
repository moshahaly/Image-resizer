const CACHE_NAME = 'image-resizer-v2';
const CACHE_EXPIRATION_DAYS = 7;

const precacheAssets = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/fallback.html'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(precacheAssets))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.url.includes('/api/')) {
        // Network first for API calls
        event.respondWith(networkFirst(event.request));
    } else {
        // Cache first with update
        event.respondWith(cacheFirst(event.request));
    }
});

async function cacheFirst(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    return cached || fetchAndCache(request);
}

async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        return networkResponse;
    } catch (error) {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request);
        return cached || caches.match('/fallback.html');
    }
}

async function fetchAndCache(request) {
    const cache = await caches.open(CACHE_NAME);
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
}