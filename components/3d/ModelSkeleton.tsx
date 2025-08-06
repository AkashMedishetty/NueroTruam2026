'use client'

import { motion } from 'framer-motion'

export function ModelSkeleton() {
  return (
    <div className="flex items-center justify-center h-full bg-gradient-to-br from-orange-100/60 via-orange-50/40 to-red-100/30 rounded-3xl">
      <div className="text-center p-8">
        <motion.div
          className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Loading 3D Model</h3>
        <p className="text-gray-600 text-sm">Please wait while the model loads...</p>
      </div>
    </div>
  )
}