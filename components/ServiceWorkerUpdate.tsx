'use client'

import { useEffect } from 'react'

export function ServiceWorkerUpdate() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Force service worker update for authentication fixes
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          // Force update to latest version
          registration.update().then(() => {
            console.log('Service Worker updated for auth fixes')
            
            // Skip waiting to activate immediately
            if (registration.waiting) {
              registration.waiting.postMessage({ type: 'SKIP_WAITING' })
            }
          })
        })
      })

      // Listen for new service worker
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('New Service Worker activated - reloading page')
        window.location.reload()
      })
    }
  }, [])

  return null // This component doesn't render anything
}