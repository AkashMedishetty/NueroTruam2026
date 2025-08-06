"use client"

import { useState, useEffect } from "react"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import { Button } from "@/components/ui/button"
import { MainLayout } from "@/components/layout/MainLayout"
import { Navigation } from "@/components/navigation"
import { Calendar, MapPin, Users, Award, Play, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"

// Lazy load 3D components for better performance
const BrainModel = dynamic(() => import("@/components/3d/BrainModel"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gradient-to-br from-orange-100/60 via-orange-50/40 to-red-100/30 rounded-3xl">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500"></div>
    </div>
  )
})

const SpineModel = dynamic(() => import("@/components/3d/SpineModel"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gradient-to-br from-orange-100/60 via-orange-50/40 to-red-100/30 rounded-3xl">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500"></div>
    </div>
  )
})





export default function HomePage() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [isPlaying, setIsPlaying] = useState(true)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 1000], [0, -200])
  const y2 = useTransform(scrollY, [0, 1000], [0, -400])
  const opacity = useTransform(scrollY, [0, 500], [1, 0])
  const scale = useTransform(scrollY, [0, 500], [1, 0.8])

  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 }
  const x = useSpring(0, springConfig)
  const y = useSpring(0, springConfig)

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
        // Conference has started
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    // Update immediately
    updateCountdown()
    
    // Then update every second
    const timer = setInterval(updateCountdown, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e
      const { innerWidth, innerHeight } = window
      const xPos = (clientX / innerWidth - 0.5) * 2
      const yPos = (clientY / innerHeight - 0.5) * 2
      setMousePosition({ x: xPos, y: yPos })
      x.set(xPos * 20)
      y.set(yPos * 20)
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [x, y])

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-orange-50 text-gray-800 overflow-hidden dark:from-gray-900 dark:to-gray-900 dark:text-gray-100">
      <Navigation currentPage="home" />

      {/* Revolutionary Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 dark:bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-white dark:bg-gray-900"></div>

        {/* Main Content Container */}
        <div className="container mx-auto px-6 relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center min-h-[80vh]">
            {/* Left Column - Content */}
            <div className="space-y-8">
              {/* Conference Details Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="inline-block"
              >
                <div className="px-6 py-3 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-orange-100 dark:bg-gray-800/90 dark:border-gray-700">
                  <div className="flex items-center space-x-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-orange-500" />
                      August 7-9, 2026
                    </div>
                    <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-orange-500" />
                      Hyderabad, India
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Main Title */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              >
                <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black leading-none">
                  <span className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                    NEURO
                  </span>
                  <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 bg-clip-text text-transparent">
                    TRAUMA
                  </span>
                  <br />
                  <span className="text-4xl lg:text-5xl xl:text-6xl bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                    2026
                  </span>
                </h1>
              </motion.div>

              {/* Subtitle */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
              >
                <p className="text-xl lg:text-2xl text-gray-700 dark:text-gray-300 font-light leading-relaxed">
                  Annual Conference of Neurotrauma Society of India
                  <br />
                  <span className="text-lg text-orange-600">Advancing Neurotrauma Care & Research</span>
                </p>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
              >
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/register">
                    <Button className="px-8 py-4 text-lg bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-full shadow-lg hover:shadow-orange-200/50 transition-all duration-300 border-0">
                      <Sparkles className="mr-2 h-5 w-5" />
                      Register Now
                    </Button>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/program">
                    <Button variant="outline" className="px-8 py-4 text-lg border-2 border-orange-500 text-orange-600 hover:bg-orange-50 rounded-full transition-all duration-300 dark:border-orange-400 dark:text-orange-400 dark:hover:bg-orange-900/20">
                      <Play className="mr-2 h-5 w-5" />
                    Watch Trailer
                  </Button>
                  </Link>
                </motion.div>
              </div>
              </motion.div>

              {/* Stats Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-md md:max-w-none"
              >
                {[
                  { number: "TBD", label: "Neuro Experts", icon: Users },
                  { number: "TBD", label: "Countries", icon: MapPin },
                  { number: "TBD", label: "Sessions", icon: Calendar },
                  { number: "TBD", label: "Awards", icon: Award },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    className="text-center p-4 rounded-xl bg-white/80 backdrop-blur-xl border border-orange-100 hover:bg-white hover:shadow-md transition-all duration-300 dark:bg-gray-800/80 dark:border-gray-700 dark:hover:bg-gray-800"
                    whileHover={{ y: -3, scale: 1.02 }}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.05, duration: 0.3 }}
                  >
                    {(() => {
  const Icon = stat.icon;
  return <Icon className="w-6 h-6 text-orange-500 mx-auto mb-2" />;
})()}
                    <div className="text-2xl font-bold text-orange-600 mb-1">{stat.number}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Right Column - Clean 3D Model (Optimized) */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="relative h-[500px] md:h-[800px] lg:h-[900px] three-canvas-container mobile-3d-model"
            >
              <BrainModel />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Holographic Countdown */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900"></div>
        <motion.div className="relative z-10">
          <div className="container mx-auto px-6 text-center">
            <motion.h2
              className="text-5xl font-bold mb-16 bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              Conference Countdown
            </motion.h2>

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
          </div>
        </motion.div>
      </section>

      {/* Organizing Committee Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-white dark:bg-gray-900"></div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.h2
            className="text-6xl font-bold text-center mb-20 bg-gradient-to-r from-gray-800 via-orange-600 to-red-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            ORGANIZING COMMITTEE
          </motion.h2>

          <div className="max-w-7xl mx-auto">
            {/* Committee Content with Spine Model - 30-70 Split */}
            <div className="flex flex-col lg:flex-row gap-8 items-stretch">
              {/* Left side: 3D Spine Model - 35% */}
              <div className="lg:w-[35%] flex justify-center items-center">
                <div className="three-canvas-container mobile-3d-model w-full max-w-md">
                  <SpineModel />
                </div>
              </div>

              {/* Right side: Committee Content - 65% */}
              <div className="lg:w-[65%]">
              <motion.div
                className="bg-white rounded-3xl p-8 shadow-2xl border border-orange-100 dark:bg-gray-800 dark:border-gray-700 dark:shadow-gray-900/50 flex flex-col justify-center min-h-[600px]"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
              <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">A Message from Our Chairman</h3>
              <div className="prose prose-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                <p className="mb-6">
                  Dear Esteemed Colleagues and Neurotrauma Professionals,
                </p>
                <p className="mb-6">
                  It is with immense pleasure and honor that we invite you to NeuroTrauma 2026, the Annual Conference of the Neurotrauma Society of India, taking place in the vibrant city of Hyderabad. This landmark event promises to bring together the brightest minds in neurotrauma care for three transformative days of groundbreaking discussions, innovative presentations, and collaborative learning.
                </p>
                <p className="mb-6">
                  Our conference theme, "Advancing Neurotrauma Care & Research," reflects our commitment to pushing the boundaries of what's possible in brain and spinal injury management. From cutting-edge surgical techniques to revolutionary rehabilitation protocols, we'll explore the latest developments that are reshaping patient outcomes in neurotrauma care.
                </p>
                <p className="mb-6">
                  Hyderabad, with its rich medical heritage and world-class healthcare facilities, provides the perfect backdrop for this gathering of neurotrauma excellence. We've curated an exceptional program featuring renowned international speakers, hands-on workshops, and networking opportunities that will enhance your practice and expand your professional network.
                </p>
                <p className="mb-8">
                  Whether you're a seasoned neurosurgeon, an emergency medicine specialist, a resident beginning your journey, or a healthcare professional seeking to broaden your neurotrauma expertise, this conference offers something valuable for everyone. Together, we'll shape the future of neurotrauma care and improve outcomes for patients across India and beyond.
                </p>
                
                <div className="border-t border-orange-200 dark:border-gray-600 pt-6">
                  <p className="font-semibold text-gray-800 dark:text-gray-100">Dr. Priya Krishnamurthy</p>
                  <p className="text-orange-600 dark:text-orange-400">Chairman, Organizing Committee</p>
                  <p className="text-gray-600 dark:text-gray-400">President, Neurotrauma Society of India</p>
                </div>
              </div>
            </motion.div>
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Hyderabad - Premium Horizontal Scrolling */}
      <section className="py-32 relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-300 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-300 rounded-full blur-3xl"></div>
          </div>

        <div className="container mx-auto px-6 relative z-10">
          {/* Header */}
          <div className="text-center mb-16">
          <motion.div
              className="inline-block px-6 py-3 bg-orange-100 dark:bg-orange-900/30 rounded-full mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-orange-600 dark:text-orange-400 font-semibold text-sm uppercase tracking-wide">
                🏛️ Discover the City of Pearls
              </span>
                </motion.div>

          <motion.h2
              className="text-6xl lg:text-7xl font-black mb-6 bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
          >
              Explore Hyderabad
          </motion.h2>

          <motion.p
              className="text-xl lg:text-2xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
          >
              Experience the perfect blend of ancient heritage and modern innovation while attending the conference. From historic monuments to cutting-edge technology hubs.
          </motion.p>
          </div>

          {/* Enhanced Horizontal Scrolling Cards Container */}
          <motion.div
            className="relative"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            onWheel={(e) => {
              // Prevent this container from interfering with scroll
              e.stopPropagation()
            }}
          >
            {/* Scroll Indicators */}
            <div className="flex justify-center items-center space-x-4 mb-8">
              <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                <span className="text-sm font-medium">🖱️ Scroll horizontally or drag to explore</span>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse delay-100"></div>
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse delay-200"></div>
            </div>
        </div>
            </div>

            {/* Enhanced Horizontal Scrolling Container */}
            <div 
              className="overflow-x-auto overflow-y-hidden pb-8 snap-x snap-mandatory cursor-grab active:cursor-grabbing horizontal-scroll-container"
              style={{ 
                scrollBehavior: 'smooth',
                WebkitOverflowScrolling: 'touch',
              }}
              onWheel={(e) => {
                const container = e.currentTarget
                const rect = container.getBoundingClientRect()
                const mouseX = e.clientX - rect.left
                const mouseY = e.clientY - rect.top
                
                // Check if mouse is actually over the scrollable area
                if (mouseX >= 0 && mouseX <= rect.width && mouseY >= 0 && mouseY <= rect.height) {
                  // Always prevent default when over the horizontal scroll area
                  e.preventDefault()
                  e.stopPropagation()
                  
                  // Scroll horizontally
                  container.scrollLeft += e.deltaY * 2
                }
              }}
              onMouseDown={(e) => {
                const slider = e.currentTarget
                let isDown = true
                let startX = e.pageX - slider.offsetLeft
                let scrollLeft = slider.scrollLeft
                
                const handleMouseMove = (e: MouseEvent) => {
                  if (!isDown) return
                  e.preventDefault()
                  const x = e.pageX - slider.offsetLeft
                  const walk = (x - startX) * 2
                  slider.scrollLeft = scrollLeft - walk
                }
                
                const handleMouseUp = () => {
                  isDown = false
                  document.removeEventListener('mousemove', handleMouseMove)
                  document.removeEventListener('mouseup', handleMouseUp)
                }
                
                document.addEventListener('mousemove', handleMouseMove)
                document.addEventListener('mouseup', handleMouseUp)
              }}
            >
              <div className="flex space-x-6 px-4" style={{ width: 'max-content' }}>
                {[
                  {
                    name: "Charminar",
                    description: "Iconic 16th-century monument and symbol of Hyderabad",
                    category: "Heritage",
                    rating: "4.8",
                    time: "1-2 hours",
                    bestTime: "Evening",
                    highlights: ["Historic Architecture", "Night Illumination", "Local Markets"],
                    icon: "🏛️",
                    image: "/Charminar.png"
                  },
                  {
                    name: "Ramoji Film City",
                    description: "World's largest film studio complex and theme park",
                    category: "Entertainment", 
                    rating: "4.6",
                    time: "Full day",
                    bestTime: "Morning",
                    highlights: ["Film Sets", "Adventure Rides", "Live Shows"],
                    icon: "🎬",
                    image: "/Ramoji.png"
                  },
                  {
                    name: "Golconda Fort",
                    description: "Historic fortress with incredible acoustics and architecture",
                    category: "Heritage",
                    rating: "4.7",
                    time: "2-3 hours",
                    bestTime: "Late afternoon",
                    highlights: ["Ancient Architecture", "Acoustic Marvel", "Sunset Views"],
                    icon: "🏰",
                    image: "/Golconda.png"
                  },
                  {
                    name: "Hussain Sagar Lake",
                    description: "Heart-shaped lake with beautiful Buddha statue",
                    category: "Nature",
                    rating: "4.5", 
                    time: "1-2 hours",
                    bestTime: "Evening",
                    highlights: ["Boat Rides", "Buddha Statue", "Lake Views"],
                    icon: "🌊",
                    image: "/Hussian.png"
                  },
                  {
                    name: "Salar Jung Museum",
                    description: "One of India's largest museums with rare artifacts",
                    category: "Culture",
                    rating: "4.4",
                    time: "2-3 hours", 
                    bestTime: "Morning",
                    highlights: ["Rare Artifacts", "Art Collections", "Historical Items"],
                    icon: "🏛️",
                    image: "/placeholder.jpg"
                  },
                  {
                    name: "HITEC City",
                    description: "India's largest IT and financial district",
                    category: "Modern",
                    rating: "4.3",
                    time: "2-3 hours",
                    bestTime: "Evening",
                    highlights: ["Modern Architecture", "Shopping Malls", "Fine Dining"],
                    icon: "🏢",
                    image: "/placeholder.jpg"
                  },
                  {
                    name: "Birla Mandir",
                    description: "Beautiful white marble temple with panoramic city views",
                    category: "Religious",
                    rating: "4.6",
                    time: "1-2 hours",
                    bestTime: "Evening",
                    highlights: ["Marble Architecture", "City Views", "Peaceful Ambiance"],
                    icon: "🛕",
                    image: "/placeholder.jpg"
                  },
                  {
                    name: "Laad Bazaar",
                    description: "Famous shopping street known for bangles and pearls",
                    category: "Shopping", 
                    rating: "4.2",
                    time: "2-3 hours",
                    bestTime: "Evening",
                    highlights: ["Traditional Bangles", "Pearl Jewelry", "Local Crafts"],
                    icon: "🛍️",
                    image: "/placeholder.jpg"
                  }
                ].map((place, index) => (
                <motion.div
                  key={index}
                    className="relative group w-80 h-[500px] flex-shrink-0 snap-center"
                    initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    {/* Full Image Card with Simple Overlay */}
                    <div className="attraction-card relative w-full h-full rounded-3xl shadow-2xl overflow-hidden border border-white/20 transition-all duration-200 ease-out hover:shadow-orange-500/20">
                      {/* Full Background Image */}
                      <img 
                        src={place.image} 
                        alt={place.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      
                      {/* Dark Overlay for Better Text Readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                      
                      {/* Top Badges */}
                      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
                        {/* Category Badge */}
                        <div className="px-3 py-1 bg-white/90 rounded-full">
                          <span className="text-xs font-bold text-gray-800">{place.category}</span>
                        </div>
                        
                        {/* Rating Badge */}
                        <div className="px-3 py-1 bg-white/90 rounded-full flex items-center space-x-1">
                          <span className="text-yellow-500">⭐</span>
                          <span className="text-xs font-bold text-gray-800">{place.rating}</span>
                        </div>
                      </div>

                      {/* Bottom Simple Content Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                        <div className="bg-black/60 rounded-xl p-4">
                          <h3 className="text-xl font-bold text-white mb-2">{place.name}</h3>
                          <p className="text-white/90 text-sm mb-3 line-clamp-2">{place.description}</p>

                          {/* Info Grid */}
                          <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                            <div className="flex items-center space-x-2">
                              <span className="text-orange-400">⏰</span>
                              <span className="text-white/80">{place.time}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-orange-400">🌅</span>
                              <span className="text-white/80">{place.bestTime}</span>
                            </div>
                          </div>

                          {/* Highlights */}
                          <div className="mb-3">
                            <div className="flex flex-wrap gap-1.5">
                              {place.highlights.slice(0, 2).map((highlight, idx) => (
                                <span key={idx} className="px-2 py-1 bg-orange-500/80 text-white text-xs rounded-full">
                                  {highlight}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Learn More Button */}
                          <button className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-all duration-200">
                            Learn More
                          </button>
                        </div>
                      </div>
            </div>
          </motion.div>
                ))}
              </div>
            </div>


          </motion.div>
        </div>
      </section>

      {/* Registration Section */}
      <section className="py-20 relative overflow-hidden bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              className="inline-block px-6 py-3 bg-orange-100 dark:bg-orange-900/30 rounded-full mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-orange-600 dark:text-orange-400 font-semibold text-sm uppercase tracking-wide">
                💰 Early Bird Registration Open
              </span>
            </motion.div>

          <motion.h2
              className="text-5xl lg:text-6xl font-black mb-6 bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
          >
              Secure Your Spot
          </motion.h2>

          <motion.p
              className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
          >
              Join leading neurotrauma professionals for three days of groundbreaking sessions, hands-on workshops, and networking opportunities.
          </motion.p>

            {/* Registration Card */}
          <motion.div
              className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-800 rounded-3xl p-8 shadow-2xl border border-orange-200 dark:border-gray-700 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="text-center mb-8">
                <div className="text-6xl font-black bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent mb-4">
                  ₹5,000
                      </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Early Bird Registration</h3>
                <p className="text-gray-600 dark:text-gray-400">Limited time offer - Register now to secure your spot!</p>
                    </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8 text-left">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    <span className="text-gray-700 dark:text-gray-300">3 Days Full Access</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    <span className="text-gray-700 dark:text-gray-300">Welcome Kit</span>
            </div>
                  <div className="flex items-center space-x-3">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    <span className="text-gray-700 dark:text-gray-300">All Meals Included</span>
                    </div>
                  </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    <span className="text-gray-700 dark:text-gray-300">Conference Certificate</span>
                    </div>
                  <div className="flex items-center space-x-3">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    <span className="text-gray-700 dark:text-gray-300">CME Credits</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    <span className="text-gray-700 dark:text-gray-300">Networking Sessions</span>
                      </div>
                </div>
                  </div>
                  
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link href="/register">
                  <button className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold text-lg rounded-xl transition-all duration-300 shadow-lg hover:shadow-orange-200/50 dark:hover:shadow-orange-900/50">
                    Register Now - ₹5,000
                  </button>
                </Link>
          </motion.div>

              <p className="text-xs text-gray-500 dark:text-gray-500 mt-4 text-center">
                *Early bird pricing available for limited time. Standard pricing will be announced later.
              </p>
                </motion.div>
            </div>
        </div>
      </section>

      {/* Spectacular CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-orange-600 to-red-600"></div>
        <div className="absolute inset-0 bg-white/10"></div>

        <motion.div
          className="relative z-10 container mx-auto px-6 text-center"
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h2 className="text-7xl font-black mb-8 text-white">
            Ready to Shape
            <br />
            <span className="bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">The Future?</span>
          </h2>

          <p className="text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join the most revolutionary neurotrauma conference ever conceived. Where advanced neuroscience meets clinical
            excellence.
          </p>

          <div className="flex flex-col sm:flex-row gap-8 justify-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/register">
                <Button className="px-12 py-6 text-xl bg-white text-orange-600 hover:bg-gray-100 rounded-full shadow-2xl font-bold">
                  <Sparkles className="mr-3 h-6 w-6" />
                  Secure Your Future
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/abstracts">
                <Button
                  variant="outline"
                  className="px-12 py-6 text-xl border-2 border-white text-white hover:bg-white/10 rounded-full backdrop-blur-sm font-bold"
                >
                  Submit Innovation
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Comprehensive Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-black text-white py-20">
        <div className="container mx-auto px-6">
          {/* Main Footer Content */}
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            {/* Conference Info */}
            <div>
              <h3 className="text-4xl font-bold mb-6 bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                NEUROTRAUMA 2026
              </h3>
              <p className="text-gray-300 leading-relaxed mb-6">
                Advancing Neurotrauma Care & Research through innovation, collaboration, and excellence. Join us in Hyderabad for three transformative days of medical learning.
              </p>
              <div className="space-y-2 text-gray-400">
                <p className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-orange-500" />
                  August 7-9, 2026
                </p>
                <p className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-orange-500" />
                  Hyderabad, India
                </p>
                <p className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-orange-500" />
                  400+ Expected Delegates
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold mb-6 text-orange-400 uppercase tracking-wide">Quick Links</h4>
              <ul className="space-y-3 text-gray-300">
                {[
                  "About Conference",
                  "Scientific Program", 
                  "Registration",
                  "Abstracts",
                  "Venue Information",
                  "Local Tourism"
                ].map((item) => (
                  <li key={item}>
                    <Link href="#" className="hover:text-orange-400 transition-colors duration-300 flex items-center">
                      <ArrowRight className="w-3 h-3 mr-2" />
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Information */}
            <div>
              <h4 className="font-bold mb-6 text-orange-400 uppercase tracking-wide">Contact Information</h4>
              
              <div className="mb-6">
                <h5 className="font-semibold text-white mb-2">Conference Secretariat</h5>
                <p className="text-gray-300 text-sm">Dr. Priya Krishnamurthy</p>
                <p className="text-gray-400 text-sm">President, Neurotrauma Society of India</p>
                <p className="text-gray-400 text-sm">Conference Secretariat</p>
                <p className="text-gray-400 text-sm">Hyderabad, India 500001</p>
              </div>

              <div className="mb-6">
                <h5 className="font-semibold text-white mb-2">Registration Inquiries</h5>
                <p className="text-gray-300 text-sm">+91 9876 543 210</p>
                <p className="text-gray-300 text-sm">+91 9876 543 211</p>
                <p className="text-gray-300 text-sm">register@neurotrauma2026.in</p>
                <p className="text-gray-400 text-xs">Mon-Fri: 9:00 AM - 6:00 PM</p>
              </div>

              <div>
                <h5 className="font-semibold text-white mb-2">Technical Support</h5>
                <p className="text-gray-300 text-sm">+91 9876 543 212</p>
                <p className="text-gray-300 text-sm">support@neurotrauma2026.in</p>
                <p className="text-gray-300 text-sm">abstracts@neurotrauma2026.in</p>
                <p className="text-gray-400 text-xs">Available 24/7</p>
              </div>
            </div>

            {/* Social Media & Follow */}
            <div>
              <h4 className="font-bold mb-6 text-orange-400 uppercase tracking-wide">Follow Us</h4>
              <div className="flex space-x-4 mb-8">
                {[
                  { icon: "💼", label: "LinkedIn" },
                  { icon: "🐦", label: "Twitter" },
                  { icon: "📘", label: "Facebook" },
                  { icon: "📷", label: "Instagram" },
                  { icon: "📺", label: "YouTube" }
                ].map((social, index) => (
                  <motion.div
                    key={index}
                    className="w-10 h-10 bg-orange-600/20 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors cursor-pointer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    title={social.label}
                  >
                    <span className="text-lg">{social.icon}</span>
                  </motion.div>
                ))}
              </div>

              <div>
                <h5 className="font-semibold text-white mb-4">Tech Partner</h5>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-700 rounded flex items-center justify-center text-white font-bold text-sm">
                    PH
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                    PurpleHat
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-gray-400 text-sm">
                <p>&copy; 2026 NeuroTrauma 2026 Conference. All rights reserved.</p>
                <p>Organized by Neurotrauma Society of India | Hyderabad, India</p>
              </div>
              <div className="flex space-x-6 text-gray-400 text-sm">
                <Link href="#" className="hover:text-orange-400 transition-colors">Privacy Policy</Link>
                <Link href="#" className="hover:text-orange-400 transition-colors">Terms of Service</Link>
                <Link href="#" className="hover:text-orange-400 transition-colors">Cookie Policy</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}