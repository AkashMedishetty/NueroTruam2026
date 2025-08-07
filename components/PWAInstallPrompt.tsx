"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Download, Smartphone, Zap, Wifi } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [showFooterPrompt, setShowFooterPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [hasScrolledToFooter, setHasScrolledToFooter] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isIOSStandalone = (window.navigator as any).standalone === true
    
    if (isStandalone || isIOSStandalone) {
      setIsInstalled(true)
      return
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Show install prompt after user has been on site for 30 seconds
      setTimeout(() => {
        if (!sessionStorage.getItem('pwa-install-dismissed')) {
          setShowInstallPrompt(true)
        }
      }, 30000)
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstallPrompt(false)
      setShowFooterPrompt(false)
      setDeferredPrompt(null)
    }

    // Scroll detection for footer prompt
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const footerThreshold = documentHeight - 800 // Show when 800px from bottom
      
      if (scrollPosition >= footerThreshold && !hasScrolledToFooter) {
        setHasScrolledToFooter(true)
        // Show footer prompt if main prompt was dismissed and we have the deferred prompt
        if (sessionStorage.getItem('pwa-install-dismissed') && deferredPrompt) {
          setTimeout(() => {
            setShowFooterPrompt(true)
          }, 1000) // Delay to avoid immediate popup
        }
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [deferredPrompt, hasScrolledToFooter])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
      setShowInstallPrompt(false)
      setShowFooterPrompt(false)
    }
    
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    // Don't show again for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true')
  }

  const handleFooterDismiss = () => {
    setShowFooterPrompt(false)
    // Don't show footer prompt again for this session
    sessionStorage.setItem('pwa-footer-dismissed', 'true')
  }

  // Don't show if already installed
  if (isInstalled) {
    return null
  }

  return (
    <>
      {/* Main Install Prompt */}
      <AnimatePresence>
        {showInstallPrompt && !sessionStorage.getItem('pwa-install-dismissed') && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50"
          >
            <div className="bg-white dark:bg-gray-800 border border-orange-200 dark:border-gray-600 rounded-xl shadow-lg p-4 backdrop-blur-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                    <Download className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Install App
                  </h3>
                </div>
                <button
                  onClick={handleDismiss}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Install NeuroTrauma 2026 for quick access to conference updates, schedule, and offline features.
              </p>
              
              <div className="flex space-x-2">
                <Button
                  onClick={handleInstallClick}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white text-sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Install
                </Button>
                <Button
                  onClick={handleDismiss}
                  variant="outline"
                  className="text-sm border-orange-200 dark:border-gray-600"
                >
                  Later
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Install Prompt - More Prominent */}
      <AnimatePresence>
        {showFooterPrompt && !sessionStorage.getItem('pwa-footer-dismissed') && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4"
          >
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-t-2xl shadow-2xl overflow-hidden">
                <div className="relative p-6 text-white">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                      backgroundImage: `url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')`
                    }} />
                  </div>
                  
                  <div className="relative flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                          <Smartphone className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">
                            Get the NeuroTrauma 2026 App!
                          </h3>
                          <p className="text-white/90 text-sm">
                            Don't miss out on the full conference experience
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <Zap className="w-4 h-4 text-yellow-300" />
                          <span className="text-sm">Instant Updates</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Wifi className="w-4 h-4 text-blue-300" />
                          <span className="text-sm">Offline Access</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Download className="w-4 h-4 text-green-300" />
                          <span className="text-sm">Quick Launch</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                        <Button
                          onClick={handleInstallClick}
                          className="bg-white text-orange-600 hover:bg-gray-100 font-semibold px-6 py-2 rounded-lg transition-all duration-200 transform hover:scale-105"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Install Now - It's Free!
                        </Button>
                        <Button
                          onClick={handleFooterDismiss}
                          variant="ghost"
                          className="text-white hover:bg-white/10 border border-white/30"
                        >
                          Maybe Later
                        </Button>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleFooterDismiss}
                      className="ml-4 text-white/70 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}