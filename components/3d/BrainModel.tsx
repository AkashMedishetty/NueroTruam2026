'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { ModelErrorBoundary } from './ModelErrorBoundary'
import { ModelSkeleton } from './ModelSkeleton'

// Lazy load components
const BrainModelClient = dynamic(() => import('./BrainModelClient'), {
  ssr: false,
  loading: () => <ModelSkeleton />
})

const MobileBrainFallback = dynamic(() => import('./MobileBrainFallback'), {
  ssr: false,
  loading: () => <ModelSkeleton />
})

export default function BrainModel() {
  return (
    <ModelErrorBoundary>
      <Suspense fallback={<ModelSkeleton />}>
        <BrainModelClient />
      </Suspense>
    </ModelErrorBoundary>
  )
}