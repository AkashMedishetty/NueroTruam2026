'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { ModelErrorBoundary } from './ModelErrorBoundary'
import { ModelSkeleton } from './ModelSkeleton'

// Lazy load the 3D component to prevent SSR issues
const SpineModelClient = dynamic(() => import('./SpineModelClient'), {
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