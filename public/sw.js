// Service Worker for NeuroTrauma 2026 PWA - Updated to fix auth issues
const CACHE_NAME = 'neurotrauma-2026-v2';
const STATIC_CACHE_NAME = 'neurotrauma-2026-static-v2';
const DYNAMIC_CACHE_NAME = 'neurotrauma-2026-dynamic-v2';

// Static assets to cache immediately (only essential ones)
const STATIC_ASSETS = [
  '/',
  '/offline.html',
];

// Optional assets to cache (don't fail if they don't exist)
const OPTIONAL_ASSETS = [
  '/Favicons/site.webmanifest',
  '/NTSILOGO.png',
  '/brainandspinesociety.png',
  '/KIMS.png',
];

// Dynamic assets to cache on demand
const DYNAMIC_CACHE_LIMIT = 50;

// Helper function to cache assets with error handling
async function cacheAssets(cache, assets, optional = false) {
  const results = await Promise.allSettled(
    assets.map(asset => 
      fetch(asset)
        .then(response => {
          if (response.ok) {
            return cache.put(asset, response);
          } else if (!optional) {
            throw new Error(`Failed to fetch ${asset}: ${response.status}`);
          }
        })
        .catch(error => {
          if (!optional) {
            console.error(`Failed to cache ${asset}:`, error);
            throw error;
          } else {
            console.warn(`Optional asset failed to cache: ${asset}`);
          }
        })
    )
  );
  
  if (!optional) {
    const failures = results.filter(result => result.status === 'rejected');
    if (failures.length > 0) {
      throw new Error(`Failed to cache ${failures.length} essential assets`);
    }
  }
}

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(async (cache) => {
        console.log('Caching essential assets');
        await cacheAssets(cache, STATIC_ASSETS, false);
        
        console.log('Caching optional assets');
        await cacheAssets(cache, OPTIONAL_ASSETS, true);
      })
      .then(() => {
        console.log('Service Worker installed successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip blob URLs (causes NetworkError in Cache.put())
  if (url.protocol === 'blob:') {
    return;
  }

  // Skip data URLs
  if (url.protocol === 'data:') {
    return;
  }

  // Skip chrome-extension URLs
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Skip API routes (let them hit the network)
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Skip authentication routes (critical for NextAuth to work properly)
  if (url.pathname.startsWith('/auth/')) {
    return;
  }

  // Skip dashboard routes (require server-side session validation)
  if (url.pathname.startsWith('/dashboard/')) {
    return;
  }

  // Skip Next.js internal routes (e.g., _next/static, _next/data)
  if (url.pathname.startsWith('/_next/')) {
    return;
  }

  // Skip external domains (except images) - Fixed syntax error
  if (url.origin !== location.origin && request.destination !== 'image') {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise fetch from network and cache
        return fetch(request)
          .then((networkResponse) => {
            // Don't cache non-successful responses
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }

            // Clone the response
            const responseToCache = networkResponse.clone();

            // Determine which cache to use
            const cacheName = STATIC_ASSETS.includes(url.pathname) 
              ? STATIC_CACHE_NAME 
              : DYNAMIC_CACHE_NAME;

            // Cache the response
            caches.open(cacheName)
              .then((cache) => {
                // Limit dynamic cache size
                if (cacheName === DYNAMIC_CACHE_NAME) {
                  limitCacheSize(cache, DYNAMIC_CACHE_LIMIT);
                }
                cache.put(request, responseToCache);
              });

            return networkResponse;
          });
      })
      .catch(() => {
        // Offline fallback for HTML pages
        if (request.destination === 'document') {
          return caches.match('/offline.html');
        }
        
        // Offline fallback for images
        if (request.destination === 'image') {
          return caches.match('/offline-image.svg');
        }
      })
  );
});

// Helper function to limit cache size
function limitCacheSize(cache, maxItems) {
  cache.keys().then((keys) => {
    if (keys.length > maxItems) {
      cache.delete(keys[0]).then(() => {
        limitCacheSize(cache, maxItems);
      });
    }
  });
}

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'contact-form-sync') {
    event.waitUntil(syncContactForm());
  }
  
  if (event.tag === 'registration-sync') {
    event.waitUntil(syncRegistration());
  }
});

// Helper functions for background sync
function syncContactForm() {
  // Implementation for syncing contact forms when back online
  return fetch('/api/contact', {
    method: 'POST',
    // Include stored form data
  }).catch((err) => {
    console.error('Failed to sync contact form:', err);
  });
}

function syncRegistration() {
  // Implementation for syncing registrations when back online
  return fetch('/api/register', {
    method: 'POST',
    // Include stored registration data
  }).catch((err) => {
    console.error('Failed to sync registration:', err);
  });
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New update from NeuroTrauma 2026',
    icon: '/Favicons/favicon-192x192.png',
    badge: '/Favicons/favicon-96x96.png',
    tag: 'neurotrauma-notification',
    data: {
      url: '/'
    },
    actions: [
      {
        action: 'open',
        title: 'Open Conference',
        icon: '/Favicons/favicon-32x32.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/close-icon.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('NeuroTrauma 2026', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.action);
  
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('NeuroTrauma 2026 Service Worker v2 loaded successfully - Auth issues fixed');

// Force update if user has old version
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});