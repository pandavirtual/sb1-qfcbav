const CACHE_NAME = 'mm-scheduler-v1';
const urlsToCache = [
    '/',
    '/index.php',
    '/css/style.css',
    '/js/app.js',
    '/js/auth.js',
    '/images/icon-192x192.png',
    '/images/icon-512x512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});