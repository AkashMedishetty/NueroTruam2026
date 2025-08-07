"use client"

import React, { useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { MapPin, Phone, Globe, Hotel, Car, Plane, Train, Bus, Bell, Mail, X, Zap, Clock } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Navigation } from "@/components/navigation"

export default function VenuePage() {
  const [isNotifyOpen, setIsNotifyOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, -50])
  const opacity = useTransform(scrollY, [0, 300], [1, 0.3])

  const handleNotifySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          source: 'venue'
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setIsSubmitted(true)
        setTimeout(() => {
          setIsNotifyOpen(false)
          setIsSubmitted(false)
          setEmail("")
        }, 2000)
      } else {
        console.error('Failed to subscribe:', data.error)
        alert('Failed to subscribe. Please try again.')
      }
    } catch (error) {
      console.error('Error subscribing to notifications:', error)
      alert('Failed to subscribe. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navigation currentPage="venue" />

      <div className="pt-20 pb-8 lg:pt-24 lg:pb-12">
        {/* Hero Section */}
        <section className="relative h-[50vh] lg:h-[60vh] overflow-hidden bg-gradient-to-r from-orange-600 to-orange-700">
          <div className="absolute inset-0 flex items-center justify-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-white px-4"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 lg:mb-6">Conference Venue</h1>
              
              <div className="mb-6">
                <motion.div 
                  className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full mb-4"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <Zap className="w-5 h-5 mr-2 text-white" />
                  <span className="text-white font-semibold">Details Coming Soon</span>
                </motion.div>
                
                <p className="text-base md:text-lg lg:text-xl max-w-3xl mx-auto mb-6">
                  We're finalizing the perfect venue for our prestigious conference.
                  <br />
                  <span className="text-orange-200">Get notified when venue details are announced!</span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    onClick={() => setIsNotifyOpen(true)}
                    className="px-8 py-4 text-lg bg-white text-orange-600 hover:bg-orange-50 rounded-full shadow-2xl font-bold"
                  >
                    <Bell className="w-5 h-5 mr-2" />
                    Notify Me
                  </Button>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/register">
                    <Button 
                      variant="outline"
                      className="px-8 py-4 text-lg border-2 border-white text-white bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm font-bold shadow-lg"
                    >
                      Register Now
                    </Button>
                  </Link>
                </motion.div>
              </div>

              <div className="flex items-center justify-center space-x-2 text-sm md:text-base lg:text-lg">
                <MapPin className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
                <span>Hyderabad, India</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* COMMENTED OUT - What to Expect Section
        <section className="py-16">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-800 via-orange-600 to-red-600 bg-clip-text text-transparent">
                What to Expect
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                We're selecting a world-class venue that will provide the perfect setting for our conference
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  icon: Hotel,
                  title: "Premium Location",
                  desc: "Strategically located with easy access from major transportation hubs",
                  color: "from-blue-500 to-cyan-600",
                },
                {
                  icon: Globe,
                  title: "Modern Facilities",
                  desc: "State-of-the-art audiovisual equipment and conference technology",
                  color: "from-purple-500 to-pink-600",
                },
                {
                  icon: MapPin,
                  title: "Multiple Venues",
                  desc: "Large auditorium, breakout rooms, and exhibition spaces",
                  color: "from-orange-500 to-red-600",
                },
                {
                  icon: Car,
                  title: "Easy Access",
                  desc: "Convenient parking and accessible from all parts of the city",
                  color: "from-green-500 to-teal-600",
                },
                {
                  icon: Phone,
                  title: "Full Support",
                  desc: "Dedicated event staff and technical support throughout",
                  color: "from-yellow-500 to-orange-600",
                },
                {
                  icon: Clock,
                  title: "Comfortable Setting",
                  desc: "Climate-controlled environment with premium amenities",
                  color: "from-indigo-500 to-purple-600",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="relative group"
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-10 rounded-2xl blur-xl group-hover:opacity-20 transition-all duration-300`}></div>
                  <div className="relative text-center p-8 bg-white dark:bg-gray-800 backdrop-blur-xl border border-orange-100 dark:border-gray-700 rounded-2xl hover:border-orange-200 dark:hover:border-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <div className={`w-16 h-16 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">{item.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        */}

        {/* COMMENTED OUT - Detailed Venue Information 
        <section className="py-8 lg:py-16 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-800 dark:to-gray-700">
          ... (all existing venue facilities, map, accommodation, transportation, and local attractions content remains here, commented out)
        </section>
        */}

        {/* CTA Section */}
        <section className="py-12 md:py-16 bg-gradient-to-r from-orange-600 to-orange-700 text-white">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6">Ready to Join Us in Hyderabad?</h2>
              <p className="text-lg md:text-xl mb-6 md:mb-8 max-w-2xl mx-auto">
                Register now to secure your spot at this premier neurotrauma conference.
              </p>
              <Link href="/register">
                <Button className="bg-white text-orange-600 hover:bg-orange-50 hover:text-orange-700 px-6 md:px-8 py-3 md:py-4 text-base md:text-lg rounded-full font-bold shadow-lg border-2 border-white">
                  Register Now
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Email Notification Modal */}
        {isNotifyOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 relative"
            >
              <button
                onClick={() => setIsNotifyOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                  Get Venue Updates
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Be the first to know when venue details are announced
                </p>
              </div>

              <form onSubmit={handleNotifySubmit} className="space-y-6">
                <div>
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsNotifyOpen(false)}
                    className="flex-1 py-3 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Notify Me
                  </Button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  We'll send venue details as soon as they're finalized. No spam, ever.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
