const CACHE_NAME = 'visa4-pwa-v2';
const ASSETS_TO_CACHE = [
    '/favicon.ico',
    '/logo.png',
    '/favicon_io/site.webmanifest'
];

// Install Event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Activate Event
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

// Fetch Event
self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') return;

    // Skip API calls and Admin routes
    const url = new URL(event.request.url);
    if (url.pathname.startsWith('/api') || url.pathname.startsWith('/admin')) {
        return;
    }

    const isHTMLRequest =
        event.request.mode === 'navigate' ||
        (event.request.headers.get('accept') || '').includes('text/html');

    if (isHTMLRequest) {
        event.respondWith(
            fetch(event.request)
                .then((networkResponse) => networkResponse)
                .catch(() =>
                    caches.match(event.request).then((cachedResponse) => {
                        if (cachedResponse) return cachedResponse;
                        return caches.match('/');
                    })
                )
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(event.request).then((networkResponse) => {
                // Cache static assets like images, CSS, JS
                if (
                    networkResponse.ok &&
                    (url.pathname.includes('/_next/static/') ||
                        url.pathname.match(/\.(png|jpg|jpeg|svg|webp|woff2|css|js)$/))
                ) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            });
        })
    );
});
