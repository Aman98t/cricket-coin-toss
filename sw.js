const CACHE_NAME = 'cricket-toss-cache-v1';

// List all the files your app needs to work offline
const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json',
    './assets/coin-head.svg',
    './assets/coin-tail.svg',
    './assets/app-icon.svg',
    './assets/background.png' // Change to .jpg if your background is a JPG
];

// Install Event: Save files to cache
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch Event: Load files from cache if offline
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // If the file is in the cache, return it. Otherwise, fetch from internet.
                return response || fetch(event.request);
            })
    );
});