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
  return (
    <ModelErrorBoundary>
      <Suspense fallback={<ModelSkeleton />}>
        <SpineModelClient />
      </Suspense>
    </ModelErrorBoundary>
  )
}