// Minimal service worker to enable PWA installability
const CACHE_NAME = 'journal-app-v1';

self.addEventListener('install', (_event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Network-first or stale-while-revalidate could be added here
  // For now, we just need the fetch handler to be present for PWA detection
  event.respondWith(fetch(event.request));
});