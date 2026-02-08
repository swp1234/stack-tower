// Stack Tower - Service Worker
// Progressive Web App (PWA) - Offline Support

const CACHE_NAME = 'stack-tower-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/js/game-data.js',
  '/js/i18n.js',
  '/js/sound-engine.js',
  '/js/locales/ko.json',
  '/js/locales/en.json',
  '/js/locales/ja.json',
  '/js/locales/es.json',
  '/js/locales/pt.json',
  '/js/locales/zh.json',
  '/js/locales/id.json',
  '/js/locales/tr.json',
  '/js/locales/de.json',
  '/js/locales/fr.json',
  '/js/locales/hi.json',
  '/js/locales/ru.json',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache).catch(err => {
          console.log('Cache addAll error:', err);
          // Continue even if some files fail to cache
        });
      })
      .catch(err => {
        console.log('Cache open error:', err);
      })
  );
  self.skipWaiting();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  // Only cache GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }

        return fetch(event.request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Return cached version or offline page
            return caches.match(event.request);
          });
      })
  );
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});
