"use client"

import React from 'react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Handle chunk loading errors specifically
    if (error.message.includes('Loading chunk') || error.message.includes('ChunkLoadError')) {
      console.log('🔄 Chunk loading error detected, attempting reload...')
      
      // Clear any cached chunks and reload
      setTimeout(() => {
        window.location.reload()
      }, 1000)
      return
    }

    this.setState({
      error,
      errorInfo
    })

    // Log error for monitoring
    console.error('🚨 Error Boundary caught error:', error, errorInfo)
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      const { error } = this.state

      // Handle chunk loading errors with auto-reload
      if (error?.message.includes('Loading chunk') || error?.message.includes('ChunkLoadError')) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center space-y-4 p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
              <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
              <p className="text-gray-600">Updating application, please wait...</p>
            </div>
          </div>
        )
      }

      // Custom fallback component
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={error!} retry={this.retry} />
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center space-y-4 p-8 max-w-md">
            <div className="text-red-500 text-6xl">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900">Something went wrong</h2>
            <p className="text-gray-600">
              {error?.message || 'An unexpected error occurred'}
            </p>
            <div className="space-y-2">
              <Button 
                onClick={this.retry}
                className="bg-orange-500 hover:bg-orange-600"
              >
                Try Again
              </Button>
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook version for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: React.ErrorInfo) => {
    if (error.message.includes('Loading chunk') || error.message.includes('ChunkLoadError')) {
      console.log('🔄 Chunk loading error, reloading page...')
      window.location.reload()
    } else {
      console.error('🚨 Unhandled error:', error, errorInfo)
    }
  }
}