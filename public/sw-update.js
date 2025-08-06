// Service Worker Update Script
// Helps clear cached authentication state

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CLEAR_AUTH_CACHE') {
        // Clear authentication-related caches
        caches.keys().then((cacheNames) => {
            const authCaches = cacheNames.filter(name =>
                name.includes('auth') ||
                name.includes('session') ||
                name.includes('api')
            );

            return Promise.all(
                authCaches.map(cacheName => caches.delete(cacheName))
            );
        }).then(() => {
            console.log('🧹 Service Worker: Cleared authentication caches');
            event.ports[0].postMessage({ success: true });
        }).catch((error) => {
            console.error('❌ Service Worker: Failed to clear caches', error);
            event.ports[0].postMessage({ success: false, error: error.message });
        });
    }
});

self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker: Installing auth cache cleaner');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('✅ Service Worker: Activated auth cache cleaner');
    event.waitUntil(clients.claim());
});