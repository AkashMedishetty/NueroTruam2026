'use client'

import { motion } from "framer-motion"

export default function MobileSpineFallback() {
  return (
    <div className="mobile-fallback w-full h-[750px] rounded-2xl bg-gradient-to-br from-orange-50 to-white dark:from-gray-800 dark:to-gray-900 flex items-center justify-center overflow-hidden relative">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-orange-300 animate-pulse"></div>
        <div className="absolute top-32 right-16 w-16 h-16 rounded-full bg-red-300 animate-pulse delay-300"></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 rounded-full bg-orange-400 animate-pulse delay-700"></div>
        <div className="absolute bottom-40 right-12 w-14 h-14 rounded-full bg-red-400 animate-pulse delay-500"></div>
      </div>

      {/* Static spine representation */}
      <div className="flex flex-col items-center space-y-1 z-10">
        {/* Cervical vertebrae */}
        {Array.from({ length: 7 }, (_, i) => (
          <motion.div
            key={`cervical-${i}`}
            className="w-6 h-4 bg-orange-400 rounded-full"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          />
        ))}

        {/* Thoracic vertebrae */}
        {Array.from({ length: 12 }, (_, i) => (
          <motion.div
            key={`thoracic-${i}`}
            className="w-8 h-5 bg-orange-500 rounded-full relative"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: (i + 7) * 0.1, duration: 0.5 }}
          >
            {/* Rib connections */}
            <div className="absolute -left-3 top-1/2 w-2 h-1 bg-orange-300 rounded-full transform -translate-y-1/2"></div>
            <div className="absolute -right-3 top-1/2 w-2 h-1 bg-orange-300 rounded-full transform -translate-y-1/2"></div>
          </motion.div>
        ))}

        {/* Lumbar vertebrae */}
        {Array.from({ length: 5 }, (_, i) => (
          <motion.div
            key={`lumbar-${i}`}
            className="w-10 h-6 bg-orange-600 rounded-full"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: (i + 19) * 0.1, duration: 0.5 }}
          />
        ))}

        {/* Sacrum */}
        <motion.div
          className="w-12 h-8 bg-orange-700 rounded-lg"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.4, duration: 0.5 }}
        />

        {/* Coccyx */}
        <motion.div
          className="w-8 h-4 bg-orange-800 rounded-full"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.6, duration: 0.5 }}
        />
      </div>

      {/* Title overlay */}
      <div className="absolute bottom-4 left-4 right-4 text-center">
        <motion.h3
          className="text-lg font-semibold text-orange-800 dark:text-orange-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3, duration: 0.5 }}
        >
          Human Spine Structure
        </motion.h3>
        <motion.p
          className="text-sm text-orange-600 dark:text-orange-400 mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.2, duration: 0.5 }}
        >
          Mobile-optimized view
        </motion.p>
      </div>
    </div>
  )
}