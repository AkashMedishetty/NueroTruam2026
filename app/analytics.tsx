'use client'

import Script from 'next/script'

export function Analytics() {
  // Temporarily disabled analytics for debugging authentication issues
  // Replace 'GA_MEASUREMENT_ID' with your actual Google Analytics ID when ready
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX'
  
  // Return null to disable all analytics scripts during debugging
  if (!process.env.NEXT_PUBLIC_GA_ID || GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
    console.log('Analytics disabled: No valid GA_ID provided')
    return null
  }
  
  return (
    <>
      {/* Google Analytics */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_title: document.title,
            page_location: window.location.href,
          });
        `}
      </Script>
      
      {/* Google Tag Manager - Only load if GTM_ID is provided */}
      {process.env.NEXT_PUBLIC_GTM_ID && process.env.NEXT_PUBLIC_GTM_ID !== 'GTM-XXXXXXX' && (
        <Script id="gtm-script" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');
          `}
        </Script>
      )}
    </>
  )
}

// Event tracking helper functions
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, properties)
  }
}

export const trackRegistration = () => {
  trackEvent('registration_started', {
    event_category: 'engagement',
    event_label: 'conference_registration'
  })
}

export const trackAbstractSubmission = () => {
  trackEvent('abstract_submission', {
    event_category: 'engagement', 
    event_label: 'abstract_form'
  })
}

export const trackContactForm = () => {
  trackEvent('contact_form_submitted', {
    event_category: 'engagement',
    event_label: 'contact_us'
  })
}

// TypeScript declaration for gtag
declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: any) => void
    dataLayer: any[]
  }
}