// Service Worker for NeuroTrauma 2026 PWA - v6 (Complete Auth & Cache Fix) 
const CACHE_VERSION = 'neurotrauma-2026-v6'; 
const STATIC_CACHE_NAME = 'neurotrauma-2026-static-v6'; 
const DYNAMIC_CACHE_NAME = 'neurotrauma-2026-dynamic-v6'; 

// Only cache truly static public assets 
const STATIC_ASSETS = [ 
  '/offline.html', 
  '/NTSILOGO.png', 
  '/brainandspinesociety.png', 
  '/KIMS.png', 
]; 

// Install event - cache static assets 
self.addEventListener('install', (event) => { 
  console.log('Service Worker v6 installing...'); 
  event.waitUntil( 
    caches.open(STATIC_CACHE_NAME) 
      .then(async (cache) => { 
        console.log('Caching essential assets'); 
        // Only cache assets that actually exist 
        const results = await Promise.allSettled( 
          STATIC_ASSETS.map(asset => 
            fetch(asset, { credentials: 'omit' }) // Don't send cookies 
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
        console.log('Service Worker v6 installed successfully'); 
        return self.skipWaiting(); 
      }) 
  ); 
}); 

// Activate event - clean up ALL old caches 
self.addEventListener('activate', (event) => { 
  console.log('Service Worker v6 activating...'); 
  event.waitUntil( 
    caches.keys() 
      .then((cacheNames) => { 
        return Promise.all( 
          cacheNames.map((cacheName) => { 
            // Delete ALL old cache versions 
            if (cacheName.startsWith('neurotrauma') && 
                cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME) { 
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

// Fetch event - CRITICAL: Bypass SW for auth and dynamic content 
self.addEventListener('fetch', (event) => { 
  const { request } = event; 
  const url = new URL(request.url); 

  // BYPASS SERVICE WORKER FOR: 
  
  // 1. All non-GET requests 
  if (request.method !== 'GET') { 
    return; 
  } 

  // 2. Any request with cookies (authentication) 
  if (request.headers.get('cookie')) { 
    return; 
  } 

  // 3. All API routes 
  if (url.pathname.startsWith('/api/')) { 
    return; 
  } 

  // 4. All auth routes 
  if (url.pathname.startsWith('/auth/') || 
      url.pathname.includes('auth') || 
      url.pathname.includes('login') || 
      url.pathname.includes('signin') || 
      url.pathname.includes('signout')) { 
    return; 
  } 

  // 5. All dashboard and protected routes 
  if (url.pathname.startsWith('/dashboard') || 
      url.pathname.startsWith('/admin') || 
      url.pathname.startsWith('/profile')) { 
    return; 
  } 

  // 6. Next.js internal routes (CRITICAL for preventing JS errors) 
  if (url.pathname.startsWith('/_next/')) { 
    return; 
  } 

  // 7. The root page (often has user-specific content) 
  if (url.pathname === '/') { 
    return; 
  } 

  // 8. Any request with credentials 
  if (request.credentials === 'include' || 
      request.credentials === 'same-origin') { 
    return; 
  } 

  // 9. External domains (except images) 
  if (url.origin !== location.origin && 
      request.destination !== 'image') { 
    return; 
  } 

  // Only cache specific static assets 
  const isStaticAsset = STATIC_ASSETS.some(asset => url.pathname.endsWith(asset)); 
  
  if (!isStaticAsset) { 
    // For non-static assets, just fetch from network 
    return; 
  } 

  // For static assets, try cache first, then network 
  event.respondWith( 
    caches.match(request) 
      .then((cachedResponse) => { 
        if (cachedResponse) { 
          return cachedResponse; 
        } 
        
        return fetch(request, { credentials: 'omit' }) 
          .then((networkResponse) => { 
            if (!networkResponse || networkResponse.status !== 200) { 
              return networkResponse; 
            } 
            
            const responseToCache = networkResponse.clone(); 
            caches.open(STATIC_CACHE_NAME) 
              .then((cache) => { 
                cache.put(request, responseToCache); 
              }); 
            
            return networkResponse; 
          }); 
      }) 
      .catch(() => { 
        if (request.destination === 'document') { 
          return caches.match('/offline.html'); 
        } 
      }) 
  ); 
}); 

console.log('NeuroTrauma 2026 Service Worker v6 loaded - Complete auth isolation'); 

// Force update message handler 
self.addEventListener('message', (event) => { 
  if (event.data && event.data.type === 'SKIP_WAITING') { 
    self.skipWaiting(); 
  } 
});