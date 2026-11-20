// Minimal service worker to enable PWA installability
const CACHE_NAME = 'journal-app-v2';

self.addEventListener('install', (_event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only handle same-origin GET requests. Everything else (cross-origin API on
  // another subdomain, OpenObserve RUM/log POSTs, non-GET methods) must go straight
  // to the network: proxying them through respondWith() breaks CORS preflights and
  // fails with NS_ERROR_INTERCEPTION_FAILED.
  if (url.origin !== self.location.origin || event.request.method !== 'GET') {
    return;
  }

  // Skip interception for API calls to let the browser handle them directly
  // This is crucial for authentication and SSL/CORS issues
  if (url.pathname.startsWith('/api')) {
    return;
  }

  // For everything else, proceed with standard fetch
  event.respondWith(fetch(event.request));
});
