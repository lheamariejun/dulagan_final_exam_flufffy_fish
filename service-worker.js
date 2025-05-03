const CACHE_NAME = 'flappy-fish-cache-v5'; // Updated cache version
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  '/images/pish1.png', // Game character
  '/images/pish-background.jpg', // Background image
  '/images/pipe-north.png', // Pipe north
  '/images/pipe-south.png', // Pipe south
  '/sounds/fish_swim.mp3', // Swim sound
  '/sounds/score.mp3', // Score sound
  '/sounds/game_over.mp3', // Game over sound
  '/sounds/underwater_bubbles.mp3', // Background music
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css', // Bootstrap CSS
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js' // Bootstrap JS
];

// Install event: Cache all necessary files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.error('Failed to cache files during install:', err))
  );
});

// Fetch event: Serve cached files if available, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Serve from cache
        }
        return fetch(event.request).then(networkResponse => {
          // Optionally cache the new response
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
      .catch(err => console.error('Fetch failed:', err))
  );
});

// Activate event: Remove old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
