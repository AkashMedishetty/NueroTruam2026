import type React from "react"
import type { Metadata } from "next"
import { Inter, Orbitron } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { SessionProvider } from "@/components/providers/SessionProvider"
import { Toaster } from "@/components/ui/sonner"
import GlobalErrorBoundary from "@/components/error/GlobalErrorBoundary"
import { Analytics } from "./analytics"
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt"
// import { ServiceWorkerUpdate } from "@/components/ServiceWorkerUpdate" // Removed to prevent infinite reload loops
import { DeviceSessionManager } from "@/components/auth/DeviceSessionManager"
import { RedirectLoopHandler } from "@/components/auth/RedirectLoopHandler"
import "./globals.css"

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial']
})
const orbitron = Orbitron({ 
  subsets: ["latin"], 
  variable: "--font-orbitron",
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial']
})

export const metadata: Metadata = {
  title: {
    default: "NeuroTrauma 2026 - Annual Conference of Neurotrauma Society of India",
    template: "%s | NeuroTrauma 2026"
  },
  description: "Join the premier neurotrauma conference in Hyderabad, India from August 7-9, 2026. Advancing Neurotrauma Care & Research through innovation, collaboration, and clinical excellence. Register now for early bird pricing.",
  keywords: [
    "neurotrauma",
    "conference", 
    "medical conference",
    "neurosurgery",
    "brain injury",
    "spinal injury",
    "trauma care",
    "Hyderabad",
    "India",
    "medical education",
    "CME",
    "neuroscience",
    "emergency medicine",
    "rehabilitation",
    "Neurotrauma Society of India",
    "NTSI",
    "2026"
  ],
  authors: [
    { name: "Neurotrauma Society of India" },
    { name: "Dr. Manas Panigrahi" },
    { name: "Dr. Raghavendra H" }
  ],
  creator: "Neurotrauma Society of India",
  publisher: "Neurotrauma Society of India",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://neurotrauma2026.in'),
  alternates: {
    canonical: '/',
    languages: {
      'en-IN': '/en-in',
      'en-US': '/en-us',
    },
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/Favicons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/Favicons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/Favicons/favicon.ico', sizes: 'any' }
    ],
    apple: [
      { url: '/Favicons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/Favicons/favicon.ico',
        color: '#ff6b35'
      }
    ]
  },
  manifest: '/Favicons/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://neurotrauma2026.in',
    siteName: 'NeuroTrauma 2026',
    title: 'NeuroTrauma 2026 - Annual Conference of Neurotrauma Society of India',
    description: 'Join the premier neurotrauma conference in Hyderabad, India from August 7-9, 2026. Advancing Neurotrauma Care & Research through innovation and clinical excellence.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'NeuroTrauma 2026 Conference - Hyderabad, India',
      },
      {
        url: '/og-image-square.jpg',
        width: 1200,
        height: 1200,
        alt: 'NeuroTrauma 2026 Conference Logo',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@NeuroTrauma2026',
    creator: '@NTSI_India',
    title: 'NeuroTrauma 2026 - Annual Conference of Neurotrauma Society of India',
    description: 'Join the premier neurotrauma conference in Hyderabad, India from August 7-9, 2026. Early bird registration now open!',
    images: ['/og-image.jpg'],
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  category: 'Medical Conference',
  classification: 'Medical Education, Healthcare, Neuroscience',
  referrer: 'origin-when-cross-origin',
  bookmarks: ['https://neurotrauma2026.in'],
  applicationName: 'NeuroTrauma 2026',
  generator: 'Next.js',
  abstract: 'Annual Conference of Neurotrauma Society of India focusing on advancing neurotrauma care through research, innovation, and clinical excellence.',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${orbitron.variable}`} suppressHydrationWarning>
      <head>
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "MedicalEvent",
              "name": "NeuroTrauma 2026 - Annual Conference of Neurotrauma Society of India",
              "description": "Premier neurotrauma conference advancing care and research through innovation, collaboration, and clinical excellence in Hyderabad, India.",
              "startDate": "2026-08-07T09:00:00+05:30",
              "endDate": "2026-08-09T18:00:00+05:30",
              "eventStatus": "https://schema.org/EventScheduled",
              "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
              "location": {
                "@type": "Place",
                "name": "Hyderabad, Telangana, India",
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": "Hyderabad",
                  "addressRegion": "Telangana",
                  "addressCountry": "IN"
                }
              },
              "organizer": {
                "@type": "Organization",
                "name": "Neurotrauma Society of India",
                "url": "https://neurotrauma2026.in"
              },
              "sponsor": [
                {
                  "@type": "Organization",
                  "name": "KIMS Hospitals"
                },
                {
                  "@type": "Organization", 
                  "name": "Brain and Spine Society"
                }
              ],
              "offers": {
                "@type": "Offer",
                "price": "5000",
                "priceCurrency": "INR",
                "availability": "https://schema.org/InStock",
                "validFrom": "2024-01-01T00:00:00+05:30",
                "url": "https://neurotrauma2026.in/register"
              },
              "performer": [
                {
                  "@type": "Person",
                  "name": "Dr. Manas Panigrahi",
                  "jobTitle": "Organising Chairman"
                },
                {
                  "@type": "Person",
                  "name": "Dr. Raghavendra H",
                  "jobTitle": "Organising Secretary"
                }
              ],
              "audience": {
                "@type": "MedicalAudience",
                "audienceType": "Medical Professionals, Neurosurgeons, Emergency Physicians, Researchers"
              },
              "image": [
                "https://neurotrauma2026.in/og-image.jpg",
                "https://neurotrauma2026.in/conference-banner.jpg"
              ],
              "url": "https://neurotrauma2026.in",
              "workFeatured": {
                "@type": "CreativeWork",
                "name": "Advancing Neurotrauma Care & Research",
                "description": "Conference theme focusing on innovation in neurotrauma treatment and research"
              }
            })
          }}
        />
        
        {/* Additional Meta Tags for Enhanced SEO */}
        <meta name="theme-color" content="#ff6b35" />
        <meta name="msapplication-TileColor" content="#ff6b35" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Geo Tags */}
        <meta name="geo.region" content="IN-TG" />
        <meta name="geo.placename" content="Hyderabad" />
        <meta name="geo.position" content="17.3850;78.4867" />
        <meta name="ICBM" content="17.3850, 78.4867" />
        
        {/* Medical Conference Specific Tags */}
        <meta name="medical.specialty" content="Neurosurgery, Trauma Care, Emergency Medicine" />
        <meta name="event.date" content="2026-08-07/2026-08-09" />
        <meta name="event.location" content="Hyderabad, India" />
        <meta name="conference.registration" content="Open" />
        <meta name="conference.pricing" content="₹5,000 Early Bird" />
        
        {/* Dublin Core Metadata */}
        <meta name="DC.title" content="NeuroTrauma 2026 - Annual Conference" />
        <meta name="DC.creator" content="Neurotrauma Society of India" />
        <meta name="DC.subject" content="Neurotrauma, Medical Conference, Neurosurgery" />
        <meta name="DC.description" content="Premier neurotrauma conference in Hyderabad, India" />
        <meta name="DC.publisher" content="Neurotrauma Society of India" />
        <meta name="DC.date" content="2026-08-07" />
        <meta name="DC.type" content="Event" />
        <meta name="DC.format" content="text/html" />
        <meta name="DC.identifier" content="https://neurotrauma2026.in" />
        <meta name="DC.language" content="en" />
        <meta name="DC.coverage" content="Hyderabad, India" />
        
        {/* Preconnect for Performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        
        {/* Service Worker Registration with Force Update */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Enhanced Cache Management and Auto-Update System
              if ('serviceWorker' in navigator) {
                // Always clear existing service workers first
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  console.log('🔄 Found existing service workers:', registrations.length);
                  
                  // Unregister all existing service workers
                  const unregisterPromises = registrations.map(function(registration) {
                    console.log('🗑️ Unregistering SW:', registration.scope);
                    return registration.unregister();
                  });
                  
                  return Promise.all(unregisterPromises);
                }).then(function() {
                  console.log('✅ All existing service workers cleared');
                  
                  // Clear all caches
                  if ('caches' in window) {
                    return caches.keys().then(function(cacheNames) {
                      console.log('🗑️ Clearing caches:', cacheNames);
                      return Promise.all(
                        cacheNames.map(function(cacheName) {
                          return caches.delete(cacheName);
                        })
                      );
                    });
                  }
                }).then(function() {
                  console.log('✅ All caches cleared');
                  
                  // Only register new service worker in production
                  if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
                    console.log('🚀 Registering force-update service worker...');
                    return navigator.serviceWorker.register('/sw-force-update.js?' + Date.now(), {
                      scope: '/',
                      updateViaCache: 'none'
                    });
                  }
                }).then(function(registration) {
                  if (registration) {
                    console.log('✅ Force-update SW registered:', registration.scope);
                    
                    // Force immediate activation
                    if (registration.waiting) {
                      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                    }
                    
                    // Check for updates every 5 minutes (less aggressive)
                    setInterval(function() {
                      registration.update();
                    }, 5 * 60 * 1000);
                  }
                }).catch(function(error) {
                  console.error('❌ Service worker registration failed:', error);
                });
              }
              
              // Initialize Auto Cache Updater for production
              if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
                // Dynamic import to avoid SSR issues
                import('@/lib/utils/auto-cache-updater').then(function(module) {
                  const autoCacheUpdater = module.autoCacheUpdater;
                  autoCacheUpdater.initialize().then(function() {
                    console.log('🚀 Auto Cache Updater initialized');
                  }).catch(function(error) {
                    console.error('❌ Auto Cache Updater failed:', error);
                  });
                }).catch(function(error) {
                  console.warn('⚠️ Could not load Auto Cache Updater:', error);
                });
              }
              
              // Add cache busting to all fetch requests (disabled for development to fix 3D models)
              if (typeof window !== 'undefined' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
                const originalFetch = window.fetch;
                window.fetch = function(input, init) {
                  // Skip cache busting for GLB files, blob URLs, and data URLs to fix 3D models
                  if (typeof input === 'string') {
                    if (input.startsWith('blob:') || input.startsWith('data:') || input.endsWith('.glb') || input.includes('.glb?')) {
                      return originalFetch(input, init);
                    }
                    
                    // Add cache busting parameter to other requests
                    if (!input.includes('cache_bust=')) {
                      const separator = input.includes('?') ? '&' : '?';
                      input = input + separator + 'cache_bust=' + Date.now();
                    }
                  }
                  
                  // Add no-cache headers (but not for GLB files)
                  const headers = new Headers(init?.headers || {});
                  headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
                  headers.set('Pragma', 'no-cache');
                  
                  return originalFetch(input, {
                    ...init,
                    headers: headers
                  });
                };
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <GlobalErrorBoundary>
                    <SessionProvider>
            <DeviceSessionManager>
              <ThemeProvider
                attribute="class"
                defaultTheme="light"
                enableSystem
                disableTransitionOnChange={false}
              >
                <div className="relative min-h-screen">
                  {children}
                  <Toaster />
                  <Analytics />
                  <PWAInstallPrompt />
                  {/* {process.env.NODE_ENV === 'production' && <ServiceWorkerUpdate />} */}
        {/* ServiceWorkerUpdate component removed to prevent infinite reload loops */}
                  <RedirectLoopHandler />

              {/* Background particles - Fixed positions to prevent memory leaks */}
              <div className="fixed inset-0 pointer-events-none z-0 opacity-60 dark:opacity-30">
                <div className="particle animate-pulse" style={{ left: '10%', top: '20%', width: '2px', height: '2px', background: 'hsl(25, 70%, 60%)', animationDelay: '0s', animationDuration: '8s' }} />
                <div className="particle animate-pulse" style={{ left: '80%', top: '10%', width: '3px', height: '3px', background: 'hsl(35, 70%, 60%)', animationDelay: '2s', animationDuration: '10s' }} />
                <div className="particle animate-pulse" style={{ left: '60%', top: '70%', width: '2px', height: '2px', background: 'hsl(20, 70%, 60%)', animationDelay: '4s', animationDuration: '12s' }} />
                <div className="particle animate-pulse" style={{ left: '30%', top: '80%', width: '4px', height: '4px', background: 'hsl(40, 70%, 60%)', animationDelay: '1s', animationDuration: '9s' }} />
                <div className="particle animate-pulse" style={{ left: '90%', top: '50%', width: '2px', height: '2px', background: 'hsl(30, 70%, 60%)', animationDelay: '3s', animationDuration: '11s' }} />
                <div className="particle animate-pulse" style={{ left: '20%', top: '40%', width: '3px', height: '3px', background: 'hsl(25, 70%, 60%)', animationDelay: '5s', animationDuration: '7s' }} />
                <div className="particle animate-pulse" style={{ left: '70%', top: '30%', width: '2px', height: '2px', background: 'hsl(35, 70%, 60%)', animationDelay: '6s', animationDuration: '13s' }} />
                <div className="particle animate-pulse" style={{ left: '50%', top: '90%', width: '3px', height: '3px', background: 'hsl(20, 70%, 60%)', animationDelay: '2s', animationDuration: '8s' }} />
              </div>
                </div>
              </ThemeProvider>
            </DeviceSessionManager>
          </SessionProvider>
        </GlobalErrorBoundary>
      </body>
    </html>
  )
}
