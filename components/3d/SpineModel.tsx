'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { ModelErrorBoundary } from './ModelErrorBoundary'
import { ModelSkeleton } from './ModelSkeleton'

// Lazy load components
const SpineModelClient = dynamic(() => import('./SpineModelClient'), {
  ssr: false,
  loading: () => <ModelSkeleton />
})

const MobileSpineFallback = dynamic(() => import('./MobileSpineFallback'), {
  ssr: false,
  loading: () => <ModelSkeleton />
})

export default function SpineModel() {
  // Mobile detection
  const isMobile = typeof window !== 'undefined' && (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth < 768
  )

  return (
    <ModelErrorBoundary>
      <Suspense fallback={<ModelSkeleton />}>
        {isMobile ? (
          <MobileSpineFallback />
        ) : (
          <SpineModelClient />
        )}
      </Suspense>
    </ModelErrorBoundary>
  )
}