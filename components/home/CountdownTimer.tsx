"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const targetDate = new Date("2026-08-07T09:00:00").getTime()

    const updateCountdown = () => {
      const now = new Date().getTime()
      const difference = targetDate - now

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        setTimeLeft({ days, hours, minutes, seconds })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    updateCountdown()
    const timer = setInterval(updateCountdown, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
      {[
        { label: "Days", value: timeLeft.days },
        { label: "Hours", value: timeLeft.hours },
        { label: "Minutes", value: timeLeft.minutes },
        { label: "Seconds", value: timeLeft.seconds },
      ].map((item, index) => (
        <motion.div
          key={item.label}
          className="relative group"
          initial={{ scale: 0, rotateY: 180 }}
          whileInView={{ scale: 1, rotateY: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1, duration: 0.4, ease: "easeOut" }}
          whileHover={{ scale: 1.05, rotateY: 5 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
          <div className="relative bg-white backdrop-blur-xl border border-orange-100 p-8 rounded-3xl hover:border-orange-300 transition-all duration-300 shadow-lg hover:shadow-orange-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:shadow-gray-900">
            <div className="text-6xl font-black bg-gradient-to-b from-gray-800 to-gray-900 bg-clip-text text-transparent dark:from-gray-100 dark:to-gray-300 mb-2">
              {item.value.toString().padStart(2, "0")}
            </div>
            <div className="text-sm uppercase tracking-[0.2em] text-orange-600 dark:text-orange-400 font-medium">{item.label}</div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}