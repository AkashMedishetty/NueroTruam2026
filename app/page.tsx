"use client"

import { useState, useEffect } from "react"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import { Button } from "@/components/ui/button"
import { MainLayout } from "@/components/layout/MainLayout"
import { Navigation } from "@/components/navigation"
import { Calendar, MapPin, Users, Award, Play, Sparkles, ArrowRight, X, Navigation as NavigationIcon, ExternalLink } from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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
  const [selectedLocation, setSelectedLocation] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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

  const handleLearnMore = (place: any) => {
    setSelectedLocation(place)
    setIsModalOpen(true)
  }

  const handleGetDirections = (placeName: string) => {
    const query = encodeURIComponent(`${placeName} Hyderabad India`)
    window.open(`https://www.google.com/maps/search/${query}`, '_blank')
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedLocation(null)
  }

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
                  <span className="text-lg text-orange-600">Science, Sports & Spiritually</span>
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
                  {/* Watch Trailer Button - Commented out as requested */}
                  {/*
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/program">
                    <Button variant="outline" className="px-8 py-4 text-lg border-2 border-orange-500 text-orange-600 hover:bg-orange-50 rounded-full transition-all duration-300 dark:border-orange-400 dark:text-orange-400 dark:hover:bg-orange-900/20">
                      <Play className="mr-2 h-5 w-5" />
                    Watch Trailer
                  </Button>
                  </Link>
                </motion.div>
                */}
                </div>
              </motion.div>

              {/* Organized By Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
                className="text-center max-w-4xl mx-auto"
              >
                <h3 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8">
                  Organized by
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center justify-items-center">
                  {[
                    {
                      src: "/NTSILOGO.png",
                      alt: "Neurotrauma Society of India",
                      name: "Neurotrauma Society of India"
                    },
                    {
                      src: "/brainandspinesociety.png",
                      alt: "Brain and Spine Society(BASS)",
                      name: "Brain and Spine Society(BASS)"
                    },
                    {
                      src: "/KIMS.png",
                      alt: "KIMS Hospitals",
                      name: "KIMS Hospitals"
                    },
                  ].map((org, index) => (
                    <motion.div
                      key={index}
                      className="flex flex-col items-center space-y-4 p-6 rounded-xl bg-white/80 backdrop-blur-xl border border-orange-100 hover:bg-white hover:shadow-lg transition-all duration-300 dark:bg-gray-800/80 dark:border-gray-700 dark:hover:bg-gray-800 w-full max-w-xs"
                      whileHover={{ y: -5, scale: 1.02 }}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                    >
                      <img
                        src={org.src}
                        alt={org.alt}
                        className="h-16 w-auto object-contain filter hover:brightness-110 transition-all duration-300"
                      />
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">
                        {org.name}
                      </p>
                    </motion.div>
                  ))}
                </div>
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
                  <div className="relative bg-white backdrop-blur-xl border border-orange-100 p-6 sm:p-8 rounded-3xl hover:border-orange-300 transition-all duration-300 shadow-lg hover:shadow-orange-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:shadow-gray-900">
                    <div className="text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-b from-gray-800 to-gray-900 bg-clip-text text-transparent dark:from-gray-100 dark:to-gray-300 mb-2 leading-none py-2">
                      {item.value.toString().padStart(2, "0")}
                    </div>
                    <div className="text-xs sm:text-sm uppercase tracking-[0.2em] text-orange-600 dark:text-orange-400 font-medium">{item.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Welcome Message Section */}
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
            WELCOME MESSAGE
          </motion.h2>

          <div className="max-w-7xl mx-auto">
            {/* Welcome Content with Spine Model - 30-70 Split */}
            <div className="flex flex-col lg:flex-row gap-8 items-stretch">
              {/* Left side: 3D Spine Model - 35% */}
              <div className="lg:w-[35%] flex justify-center items-center">
                <div className="three-canvas-container mobile-3d-model w-full max-w-md">
                  <SpineModel />
                </div>
              </div>

              {/* Right side: Welcome Content - 65% */}
              <div className="lg:w-[65%]">
                <motion.div
                  className="bg-white rounded-3xl p-8 shadow-2xl border border-orange-100 dark:bg-gray-800 dark:border-gray-700 dark:shadow-gray-900/50 flex flex-col justify-center min-h-[600px]"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Welcome to NeuroTrauma 2026</h3>
                  <div className="prose prose-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p className="mb-6">
                      Dear Healthcare Professionals, Researchers, and Medical Innovators,
                    </p>
                    <p className="mb-6">
                      We are delighted to welcome you to NeuroTrauma 2026, a premier gathering that represents the pinnacle of neurotrauma medical excellence. This extraordinary conference will bring together the most brilliant minds in neuroscience, emergency medicine, and trauma care under one roof in the historic city of Hyderabad.
                    </p>
                    <p className="mb-6">
                      For three transformative days, we will explore the frontiers of neurotrauma medicine, from breakthrough surgical techniques and innovative rehabilitation protocols to cutting-edge research in neural regeneration and brain-computer interfaces. Our comprehensive program features world-renowned keynote speakers, interactive workshops, live surgical demonstrations, and unparalleled networking opportunities.
                    </p>
                    <p className="mb-6">
                      Hyderabad, known as the "City of Pearls" and a burgeoning hub of medical excellence, provides the perfect setting for this monumental event. The city's rich heritage in healthcare innovation and its state-of-the-art medical facilities create an inspiring backdrop for advancing neurotrauma care.
                    </p>
                    <p className="mb-8">
                      Whether you are a neurosurgeon, emergency physician, researcher, resident, or allied healthcare professional, NeuroTrauma 2026 offers invaluable insights, practical knowledge, and professional connections that will enhance your practice and contribute to better patient outcomes. Join us in shaping the future of neurotrauma medicine and making a lasting impact on countless lives.
                    </p>

                    <div className="border-t border-orange-200 dark:border-gray-600 pt-6">
                      <p className="font-semibold text-gray-800 dark:text-gray-100">The Organizing Committee</p>
                      <p className="text-orange-600 dark:text-orange-400">NeuroTrauma Society of India</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Organizing Committee Members Section */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-900">
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-800 via-orange-600 to-red-600 bg-clip-text text-transparent">
              Meet Our Leadership Team
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Distinguished professionals leading the charge in neurotrauma excellence and innovation.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Dr. Manas Panigrahi",
                title: "Organising Chairman"
              },
              {
                name: "Dr. Raghavendra H",
                title: "Organising Secretary"
              },
              {
                name: "Dr. Swetha P",
                title: "Treasurer"
              }
            ].map((member, index) => (
              <motion.div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-orange-100 dark:border-gray-700 hover:shadow-2xl hover:shadow-orange-100/20 dark:hover:shadow-gray-700/20 transition-all duration-300"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                    {member.name === "Dr. Manas Panigrahi" ? (
                      <img
                        src="/Dr. Manas P.jpg"
                        alt="Dr. Manas Panigrahi"
                        className="w-full h-full object-cover"
                      />
                    ) : member.name === "Dr. Raghavendra H" ? (
                      <img
                        src="/Dr. R H.jpg"
                        alt="Dr. Raghavendra H"
                        className="w-full h-full object-cover"
                      />
                    ) : member.name === "Dr. Swetha P" ? (
                      <img
                        src="/Dr S P.jpg"
                        alt="Dr. Swetha P"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-white">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                    {member.name}
                  </h3>
                  <p className="text-orange-600 font-semibold">{member.title}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link href="/committee">
              <Button className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-full shadow-lg hover:shadow-orange-200/50 transition-all duration-300">
                View Complete Committee
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
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

            {/* Optimized Horizontal Scrolling Container */}
            <div
              ref={(el) => {
                if (el) {
                  const handleWheel = (e: WheelEvent) => {
                    // Only handle horizontal scrolling if shift is pressed or if we're on desktop
                    if (e.shiftKey || window.innerWidth >= 768) {
                      // Check if we can scroll horizontally
                      const canScrollLeft = el.scrollLeft > 0;
                      const canScrollRight = el.scrollLeft < (el.scrollWidth - el.clientWidth);
                      
                      if ((e.deltaY > 0 && canScrollRight) || (e.deltaY < 0 && canScrollLeft)) {
                        e.preventDefault();
                        el.scrollLeft += e.deltaY;
                      }
                    }
                  };
                  
                  el.addEventListener('wheel', handleWheel, { passive: false });
                  return () => el.removeEventListener('wheel', handleWheel);
                }
              }}
              className="overflow-x-auto overflow-y-hidden pb-8 snap-x snap-mandatory scrollbar-hide horizontal-scroll-container"
              style={{
                scrollBehavior: 'smooth',
                WebkitOverflowScrolling: 'touch',
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
                    image: "/Slarjung.png"
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
                    image: "/Hitec City.jpg"
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
                    image: "/birlamandir.jpg"
                  }
                ].map((place, index) => (
                  <div
                    key={index}
                    className="relative group w-80 h-[500px] flex-shrink-0 snap-center"
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
                          <button
                            onClick={() => handleLearnMore(place)}
                            className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105"
                          >
                            Learn More
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
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
                Independence Day Offer
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
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Independence Day Offer</h3>
                <p className="text-gray-600 dark:text-gray-400">Independence Day special offer - Register now to secure your spot!</p>
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
                *Independence Day offer now live! Early Bird registration starts from August 16.
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
                  Register Now
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/abstracts">
                <Button
                  variant="outline"
                  className="px-12 py-6 text-xl border-2 border-white text-white bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm font-bold shadow-lg"
                >
                  Submit Abstract
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Comprehensive Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-black text-white py-20">
        <div className="container mx-auto px-6">
          {/* Organizers Section */}
          <div className="mb-16">
            <div className="text-center">
              <h3 className="text-3xl font-bold mb-8 text-orange-400 leading-relaxed">Organized By</h3>
              <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-12">
                {/* Neurotrauma Society of India */}
                <div className="flex flex-col items-center space-y-4">
                  <img
                    src="/NTSILOGO.png"
                    alt="Neurotrauma Society of India"
                    className="h-20 w-auto object-contain"
                  />
                  <p className="text-gray-300 text-center font-medium">Neurotrauma Society of India</p>
                </div>

                {/* Brain and Spine Society */}
                <div className="flex flex-col items-center space-y-4">
                  <img
                    src="/brainandspinesociety.png"
                    alt="Brain and Spine Society(BASS)"
                    className="h-20 w-auto object-contain"
                  />
                  <p className="text-gray-300 text-center font-medium">Brain and Spine Society(BASS)</p>
                </div>

                {/* KIMS Hospitals */}
                <div className="flex flex-col items-center space-y-4">
                  <img
                    src="/KIMS.png"
                    alt="KIMS Hospitals"
                    className="h-20 w-auto object-contain"
                  />
                  <p className="text-gray-300 text-center font-medium">KIMS Hospitals</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Footer Content */}
          <div className="grid md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
            {/* Conference Info */}
            <div className="md:col-span-2 lg:col-span-1">
              <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-6 bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent leading-tight py-2">
                NEUROTRAUMA 2026
              </h3>
              <p className="text-gray-300 leading-relaxed mb-6">
                Science, Sports & Spiritually through innovation, collaboration, and excellence. Join us in Hyderabad for three transformative days of medical learning.
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
                <p className="text-gray-300 text-sm">Dr. Raghavendra H</p>
                <p className="text-gray-400 text-sm">Conference Secretariat</p>
                <p className="text-gray-400 text-sm">Hyderabad, India 500001</p>
              </div>

              {/* <div className="mb-6">
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
              </div> */}
            </div>

            {/* Conference Manager */}
            <div>
              <h4 className="font-bold mb-6 text-orange-400 uppercase tracking-wide">Conference Manager</h4>

              <div className="mb-6">
                <h5 className="font-semibold text-white mb-2">Mr. Kiran Kumar Lella</h5>
                <p className="text-gray-400 text-sm mb-2">Conference Manager</p>
                <p className="text-gray-300 text-sm mb-1">Mobile: +91 – 9676541985</p>
                <p className="text-gray-300 text-sm mb-4">Email: kiran@cmchyd.com</p>

                {/* CMC Logo under Conference Manager */}
                <div className="flex items-center mt-4">
                  <img
                    src="/CMC Logo Footer.png"
                    alt="CMC Logo"
                    className="h-36 w-auto object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Social Media & Follow */}
            <div>
              <h4 className="font-bold mb-6 text-orange-400 uppercase tracking-wide">Follow Us</h4>
              <div className="flex space-x-4 mb-8">
                {[
                  { logo: "/LinkedIn_logo_initials.png", label: "LinkedIn" },
                  { logo: "/Logo_of_Twitter.png", label: "Twitter" },
                  { logo: "/Facebook_Logo_(2019).png", label: "Facebook" },
                  { logo: "/Instagram_icon.png", label: "Instagram" },
                  { logo: "/Youtube_logo.png", label: "YouTube" }
                ].map((social, index) => (
                  <motion.div
                    key={index}
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer p-1"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    title={social.label}
                  >
                    <img
                      src={social.logo}
                      alt={social.label}
                      className="w-6 h-6 object-contain"
                    />
                  </motion.div>
                ))}
              </div>

              <div>
                <h5 className="font-semibold text-white mb-4">Tech Partner</h5>
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                    PurpleHat Events
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-gray-400 text-sm">
                <p>&copy; 2026 NeuroTrauma Conference. All rights reserved.</p>
                <p>Hyderabad, India</p>
              </div>
              <div className="flex space-x-6 text-gray-400 text-sm">
                <Link href="/privacy-policy" className="hover:text-orange-400 transition-colors">Privacy Policy</Link>
                <Link href="/terms-conditions" className="hover:text-orange-400 transition-colors">Terms & Conditions</Link>
                <Link href="/cookies-policy" className="hover:text-orange-400 transition-colors">Cookies Policy</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Location Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl sm:text-2xl font-bold pr-8">
              <span className="text-xl sm:text-2xl">{selectedLocation?.icon}</span>
              <span className="line-clamp-2">{selectedLocation?.name}</span>
            </DialogTitle>
            <DialogDescription className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
              {selectedLocation?.description}
            </DialogDescription>
          </DialogHeader>

          {selectedLocation && (
            <div className="space-y-6">
              {/* Location Image */}
              <div className="w-full h-48 sm:h-64 rounded-lg overflow-hidden">
                <img
                  src={selectedLocation.image}
                  alt={selectedLocation.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Location Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Category</h3>
                    <div className="inline-block px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full text-sm font-medium">
                      {selectedLocation.category}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Visit Duration</h3>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <span className="text-orange-500 mr-2">⏰</span>
                      {selectedLocation.time}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Best Time to Visit</h3>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <span className="text-orange-500 mr-2">🌅</span>
                      {selectedLocation.bestTime}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Rating</h3>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <span className="text-yellow-500 mr-2">⭐</span>
                      {selectedLocation.rating}/5.0
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Key Highlights</h3>
                  <div className="space-y-2">
                    {selectedLocation.highlights?.map((highlight: string, idx: number) => (
                      <div key={idx} className="flex items-center text-gray-600 dark:text-gray-400">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                        {highlight}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  onClick={() => handleGetDirections(selectedLocation.name)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12"
                >
                  <NavigationIcon className="w-4 h-4 mr-2" />
                  Get Directions
                </Button>

                <Button
                  onClick={() => {
                    const searchQuery = encodeURIComponent(`${selectedLocation.name} Hyderabad tourism`)
                    window.open(`https://www.google.com/search?q=${searchQuery}`, '_blank')
                  }}
                  variant="outline"
                  className="w-full border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 h-12"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Learn More Online
                </Button>

                <Button
                  onClick={() => setIsModalOpen(false)}
                  variant="outline"
                  className="w-full border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800 h-12 sm:hidden"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}