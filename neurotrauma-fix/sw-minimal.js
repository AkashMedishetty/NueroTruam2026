// MINIMAL Service Worker - Bypass everything for debugging 
const VERSION = 'neurotrauma-2026-v7-minimal'; 

self.addEventListener('install', (event) => { 
  console.log('SW v7 minimal: Installing...'); 
  self.skipWaiting(); 
}); 

self.addEventListener('activate', (event) => { 
  console.log('SW v7 minimal: Activating...'); 
  event.waitUntil( 
    caches.keys().then(cacheNames => { 
      // Delete ALL caches 
      return Promise.all( 
        cacheNames.map(cacheName => { 
          console.log('Deleting cache:', cacheName); 
          return caches.delete(cacheName); 
        }) 
      ); 
    }).then(() => self.clients.claim()) 
  ); 
}); 

// DO NOTHING on fetch - let everything go to network 
self.addEventListener('fetch', (event) => { 
  // Completely bypass service worker 
  return; 
}); 

console.log('NeuroTrauma 2026 Service Worker v7 - MINIMAL MODE');