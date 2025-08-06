'use client'

import { motion } from "framer-motion"

export default function MobileBrainFallback() {
  return (
    <div className="mobile-fallback w-full h-[750px] rounded-2xl bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center overflow-hidden relative">
      {/* Background neural network pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-16 left-12 w-16 h-16 rounded-full bg-blue-300 animate-pulse"></div>
        <div className="absolute top-24 right-20 w-12 h-12 rounded-full bg-purple-300 animate-pulse delay-300"></div>
        <div className="absolute bottom-32 left-16 w-14 h-14 rounded-full bg-pink-300 animate-pulse delay-700"></div>
        <div className="absolute bottom-20 right-16 w-18 h-18 rounded-full bg-indigo-300 animate-pulse delay-500"></div>
        
        {/* Neural connections */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 600">
          <motion.path
            d="M50,100 Q200,150 350,120"
            stroke="#a78bfa"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 1 }}
          />
          <motion.path
            d="M80,200 Q150,250 320,180"
            stroke="#f472b6"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 1.5 }}
          />
          <motion.path
            d="M60,350 Q200,300 340,380"
            stroke="#60a5fa"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 2 }}
          />
        </svg>
      </div>

      {/* Stylized brain representation */}
      <div className="relative z-10">
        {/* Main brain structure */}
        <motion.div
          className="relative w-48 h-64 mx-auto"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          {/* Left hemisphere */}
          <motion.div
            className="absolute left-0 top-8 w-20 h-40 bg-gradient-to-br from-blue-400 to-purple-500 rounded-l-full"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            {/* Frontal lobe */}
            <div className="absolute top-2 left-2 w-12 h-12 bg-blue-300 rounded-full opacity-80"></div>
            {/* Parietal lobe */}
            <div className="absolute top-8 right-1 w-10 h-10 bg-purple-300 rounded-full opacity-80"></div>
            {/* Temporal lobe */}
            <div className="absolute bottom-8 left-1 w-14 h-8 bg-indigo-300 rounded-full opacity-80"></div>
            {/* Occipital lobe */}
            <div className="absolute bottom-2 right-2 w-8 h-8 bg-violet-300 rounded-full opacity-80"></div>
          </motion.div>

          {/* Right hemisphere */}
          <motion.div
            className="absolute right-0 top-8 w-20 h-40 bg-gradient-to-bl from-pink-400 to-red-500 rounded-r-full"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            {/* Frontal lobe */}
            <div className="absolute top-2 right-2 w-12 h-12 bg-pink-300 rounded-full opacity-80"></div>
            {/* Parietal lobe */}
            <div className="absolute top-8 left-1 w-10 h-10 bg-red-300 rounded-full opacity-80"></div>
            {/* Temporal lobe */}
            <div className="absolute bottom-8 right-1 w-14 h-8 bg-rose-300 rounded-full opacity-80"></div>
            {/* Occipital lobe */}
            <div className="absolute bottom-2 left-2 w-8 h-8 bg-orange-300 rounded-full opacity-80"></div>
          </motion.div>

          {/* Cerebellum */}
          <motion.div
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-12 bg-gradient-to-t from-green-400 to-teal-500 rounded-b-full"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.5 }}
          >
            {/* Cerebellum folds */}
            <div className="absolute inset-1 bg-green-300 rounded-b-full opacity-60"></div>
            <div className="absolute inset-2 bg-teal-300 rounded-b-full opacity-60"></div>
          </motion.div>

          {/* Brain stem */}
          <motion.div
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2 w-6 h-8 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-b-lg"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 8, opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.8 }}
          />
        </motion.div>

        {/* Floating neurons */}
        {Array.from({ length: 8 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 bg-yellow-400 rounded-full"
            style={{
              left: `${20 + (i * 15)}%`,
              top: `${30 + (i % 3) * 20}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 1, 0], 
              scale: [0, 1, 0],
              y: [0, -10, 0]
            }}
            transition={{ 
              duration: 2, 
              delay: 2 + (i * 0.2),
              repeat: Infinity,
              repeatDelay: 3
            }}
          />
        ))}
      </div>

      {/* Pulsing effect overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-100/30 via-purple-100/30 to-pink-100/30 rounded-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.5, 0] }}
        transition={{ duration: 3, repeat: Infinity, delay: 2 }}
      />

      {/* Title overlay */}
      <div className="absolute bottom-4 left-4 right-4 text-center z-20">
        <motion.h3
          className="text-lg font-semibold text-gray-800 dark:text-gray-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3, duration: 0.5 }}
        >
          Human Brain Structure
        </motion.h3>
        <motion.p
          className="text-sm text-gray-600 dark:text-gray-400 mt-1"
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