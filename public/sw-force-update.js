// Force Update Service Worker - v8
// This service worker forces cache invalidation and ensures users get fresh content

const CACHE_VERSION = 'neurotrauma-2026-v1754578187826-08598ec';
const STATIC_CACHE_NAME = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE_NAME = `${CACHE_VERSION}-dynamic`;

// Minimal static assets - only truly essential ones
const STATIC_ASSETS = [
  '/offline.html',
  '/NTSILOGO.png',
  '/brainandspinesociety.png',
  '/KIMS.png'
];

// Install event - aggressive cache clearing
self.addEventListener('install', (event) => {
  console.log('🔄 Force Update SW v8: Installing and clearing ALL caches...');
  
  event.waitUntil(
    // First, delete ALL existing caches
    caches.keys()
      .then(cacheNames => {
        console.log('🗑️ Deleting all existing caches:', cacheNames);
        return Promise.all(
          cacheNames.map(cacheName => {
            console.log('Deleting cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      })
      .then(() => {
        // Then cache only essential assets
        return caches.open(STATIC_CACHE_NAME);
      })
      .then(cache => {
        console.log('📦 Caching essential assets only');
        return Promise.allSettled(
          STATIC_ASSETS.map(asset => 
            fetch(asset, { 
              cache: 'no-cache',
              credentials: 'omit' 
            })
              .then(response => {
                if (response.ok) {
                  return cache.put(asset, response);
                }
              })
              .catch(err => console.warn(`Failed to cache ${asset}:`, err))
          )
        );
      })
      .then(() => {
        console.log('✅ Force Update SW v8: Installation complete');
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ Force Update SW v8: Installation failed:', error);
      })
  );
});

// Activate event - take control immediately
self.addEventListener('activate', (event) => {
  console.log('🚀 Force Update SW v8: Activating...');
  
  event.waitUntil(
    // Delete any remaining old caches
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (!cacheName.includes('v8-force-update')) {
              console.log('🗑️ Deleting old cache during activation:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Force Update SW v8: Taking control of all clients');
        return self.clients.claim();
      })
      .then(() => {
        // Notify all clients to reload
        return self.clients.matchAll();
      })
      .then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'FORCE_RELOAD',
            message: 'Cache cleared - reloading for fresh content'
          });
        });
      })
  );
});

// Fetch event - bypass cache for most requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // BYPASS SERVICE WORKER FOR DYNAMIC CONTENT:
  // 1. All API routes
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // 2. All auth routes
  if (url.pathname.startsWith('/auth/') || 
      url.pathname.includes('auth') ||
      url.pathname.includes('login') ||
      url.pathname.includes('signin') ||
      url.pathname.includes('signout')) {
    return;
  }

  // 3. All dashboard and protected routes
  if (url.pathname.startsWith('/dashboard') ||
      url.pathname.startsWith('/admin') ||
      url.pathname.startsWith('/profile')) {
    return;
  }

  // 4. Any request with cookies (authentication)
  if (request.headers.get('cookie')) {
    return;
  }

  // 5. Next.js internal routes
  if (url.pathname.startsWith('/_next/') && !url.pathname.includes('.js') && !url.pathname.includes('.css')) {
    return;
  }

  // For static assets only - serve from cache with network fallback
  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request)
        .then(response => {
          if (response) {
            console.log('📦 Serving from cache:', url.pathname);
            return response;
          }
          
          // Fallback to network with no-cache headers
          return fetch(request, {
            cache: 'no-cache',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache'
            }
          });
        })
        .catch(() => {
          if (request.destination === 'document') {
            return caches.match('/offline.html');
          }
        })
    );
  }
  
  // For all other requests - go directly to network with no-cache
  // This ensures fresh content for HTML, JS, CSS, and API calls
});

// Message handler for forced updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('⚡ Force Update SW v8: Skipping waiting...');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_ALL_CACHES') {
    console.log('🧹 Force Update SW v8: Clearing all caches on demand...');
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            console.log('Clearing cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }).then(() => {
        console.log('✅ All caches cleared');
        // Notify client that caches are cleared
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({ success: true });
        }
      })
    );
  }
});

console.log('🚀 NeuroTrauma 2026 Force Update Service Worker v8 - Loaded and ready to clear caches!');