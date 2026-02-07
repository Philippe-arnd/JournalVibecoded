// Minimal service worker to enable PWA installability
const CACHE_NAME = 'journal-app-v1';

self.addEventListener('install', (_event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip interception for API calls to let the browser handle them directly
  // This is crucial for authentication and SSL/CORS issues
  if (url.pathname.startsWith('/api')) {
    return;
  }

  // For everything else, proceed with standard fetch
  event.respondWith(fetch(event.request));
});
