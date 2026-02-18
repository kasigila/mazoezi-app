/**
 * MAZOEZI Service Worker
 * Handles offline caching, background notifications, PWA install support
 * Version: 1.0.0
 */

const CACHE_NAME = 'mazoezi-v1.2.0';
const OFFLINE_URL = 'index.html';

// Core assets to cache for offline dashboard viewing
const CORE_ASSETS = [
  './',
  './index.html',
  './onboarding.html',
  './generate-icons.html',
  './login.html',
  './signup.html',
  './challenge-selection.html',
  './dashboard.html',
  './challenges.js',
  './challenge-selection.js',
  './camera.js',
  './styles.css',
  './landing.css',
  './auth.js',
  './storage.js',
  './app.js',
  './protocol.js',
  './discipline-score.js',
  './momentum.js',
  './relapse.js',
  './analytics.js',
  './manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS).catch((err) => {
        console.warn('Cache addAll failed for some assets:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL) || caches.match('./index.html');
      })
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        if (event.request.url.startsWith(self.location.origin)) {
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// Push notification handler
self.addEventListener('push', (event) => {
  let data = { title: 'MAZOEZI', body: 'Stay disciplined.' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: './assets/icons/icon-192.png',
    badge: './assets/icons/icon-72.png',
    vibrate: [100, 50, 100],
    tag: data.tag || 'mazoezi-notification',
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('dashboard') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('./dashboard.html');
      }
    })
  );
});
