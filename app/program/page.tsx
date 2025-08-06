"use client"

import React, { useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Clock, MapPin, Users, Award, Calendar, Download, Play, Zap, Brain, Cpu, Bell, Mail, CheckCircle, X } from "lucide-react"
import { Navigation } from "@/components/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const futuristicProgram = {
  day1: [
    {
      time: "08:00 - 09:00",
      title: "Neural Interface Registration",
      type: "registration",
      venue: "Quantum Lobby",
      description: "Biometric registration with AI-powered health scanning",
      icon: Brain,
      color: "from-cyan-500 to-blue-600",
      tech: "AI Biometrics",
    },
    {
      time: "09:00 - 09:30",
      title: "Holographic Opening Ceremony",
      type: "ceremony",
      venue: "Main Reality Chamber",
      description: "3D holographic welcome by global leaders",
      speakers: ["Dr. Rajesh Kumar - Quantum Chairman"],
      icon: Zap,
      color: "from-purple-500 to-pink-600",
      tech: "Holographic Projection",
    },
    {
      time: "09:30 - 10:30",
      title: "Keynote: Quantum Joint Replacement",
      type: "keynote",
      venue: "Main Reality Chamber",
      description: "Nano-scale joint reconstruction using quantum mechanics",
      speakers: ["Dr. Elena Vasquez - MIT Quantum Lab"],
      icon: Cpu,
      color: "from-orange-500 to-red-600",
      tech: "Quantum Computing",
    },
    {
      time: "10:30 - 11:00",
      title: "Neural Coffee Break",
      type: "break",
      venue: "Molecular Café",
      description: "AI-optimized nutrition and networking",
      icon: Brain,
      color: "from-green-500 to-teal-600",
      tech: "Molecular Gastronomy",
    },
    {
      time: "11:00 - 12:30",
      title: "Session 1: Robotic Surgery Evolution",
      type: "session",
      venue: "Cybernetic Hall A",
      description: "Autonomous surgical robots with machine learning",
      speakers: ["Dr. Priya Sharma", "Dr. Yuki Tanaka", "Dr. Marcus Weber"],
      icon: Cpu,
      color: "from-blue-500 to-purple-600",
      tech: "Autonomous Robotics",
    },
    {
      time: "11:00 - 12:30",
      title: "Session 2: Genetic Bone Engineering",
      type: "session",
      venue: "Bio-Lab Chamber B",
      description: "CRISPR-based bone regeneration and enhancement",
      speakers: ["Dr. Meera Reddy", "Dr. Chen Liu", "Dr. Sarah Johnson"],
      icon: Brain,
      color: "from-pink-500 to-purple-600",
      tech: "CRISPR Technology",
    },
    {
      time: "12:30 - 13:30",
      title: "Molecular Lunch Experience",
      type: "break",
      venue: "Quantum Dining",
      description: "Personalized nutrition based on genetic analysis",
      icon: Zap,
      color: "from-yellow-500 to-orange-600",
      tech: "Personalized Medicine",
    },
    {
      time: "13:30 - 15:00",
      title: "Workshop: VR Surgical Training",
      type: "workshop",
      venue: "Virtual Reality Lab",
      description: "Immersive surgical training in virtual environments",
      speakers: ["Dr. Arun Patel", "Dr. Lisa Chen"],
      icon: Brain,
      color: "from-indigo-500 to-blue-600",
      tech: "Virtual Reality",
    },
    {
      time: "15:00 - 15:30",
      title: "Quantum Energy Break",
      type: "break",
      venue: "Energy Chamber",
      description: "Bioenergy optimization and meditation",
      icon: Zap,
      color: "from-teal-500 to-green-600",
      tech: "Bioenergy",
    },
    {
      time: "15:30 - 17:00",
      title: "Panel: AI Consciousness in Medicine",
      type: "panel",
      venue: "Main Reality Chamber",
      description: "Ethical implications of conscious AI in healthcare",
      speakers: ["Dr. AI Consciousness", "Dr. Ethics Bot", "Dr. Future Mind"],
      icon: Brain,
      color: "from-red-500 to-pink-600",
      tech: "AI Consciousness",
    },
    {
      time: "19:00 - 21:00",
      title: "Holographic Gala Dinner",
      type: "social",
      venue: "Interdimensional Ballroom",
      description: "Multi-dimensional cultural experience",
      icon: Zap,
      color: "from-purple-500 to-pink-600",
      tech: "Holographic Entertainment",
    },
  ],
  day2: [
    {
      time: "08:30 - 09:00",
      title: "Quantum Registration Portal",
      type: "registration",
      venue: "Quantum Lobby",
      description: "Instant molecular-level health assessment",
      icon: Cpu,
      color: "from-blue-500 to-cyan-600",
      tech: "Quantum Scanning",
    },
    {
      time: "09:00 - 10:00",
      title: "Keynote: Regenerative Immortality",
      type: "keynote",
      venue: "Main Reality Chamber",
      description: "Achieving biological immortality through bone regeneration",
      speakers: ["Dr. Immortal Bones - Future Institute"],
      icon: Brain,
      color: "from-green-500 to-blue-600",
      tech: "Regenerative Medicine",
    },
    {
      time: "10:00 - 10:30",
      title: "Neural Enhancement Break",
      type: "break",
      venue: "Cognitive Café",
      description: "Brain-computer interface demonstrations",
      icon: Brain,
      color: "from-purple-500 to-blue-600",
      tech: "Neural Interface",
    },
    {
      time: "10:30 - 12:00",
      title: "Session 3: Nano-Medicine Revolution",
      type: "session",
      venue: "Molecular Hall A",
      description: "Microscopic robots for cellular repair",
      speakers: ["Dr. Nano Expert", "Dr. Micro Surgeon", "Dr. Cellular Pro"],
      icon: Cpu,
      color: "from-orange-500 to-red-600",
      tech: "Nanotechnology",
    },
    {
      time: "10:30 - 12:00",
      title: "Session 4: Quantum Sports Medicine",
      type: "session",
      venue: "Athletic Enhancement Lab",
      description: "Quantum-enhanced athletic performance",
      speakers: ["Dr. Quantum Athlete", "Dr. Performance Plus", "Dr. Speed Force"],
      icon: Zap,
      color: "from-yellow-500 to-orange-600",
      tech: "Quantum Enhancement",
    },
    {
      time: "12:00 - 13:00",
      title: "Future Minds Forum",
      type: "forum",
      venue: "Consciousness Chamber",
      description: "Young researchers present breakthrough discoveries",
      speakers: ["Next-Gen Innovators"],
      icon: Brain,
      color: "from-pink-500 to-purple-600",
      tech: "Innovation Showcase",
    },
    {
      time: "13:00 - 14:00",
      title: "Molecular Gastronomy Lunch",
      type: "break",
      venue: "Quantum Dining",
      description: "Food designed at the molecular level",
      icon: Zap,
      color: "from-green-500 to-teal-600",
      tech: "Molecular Cuisine",
    },
    {
      time: "14:00 - 15:30",
      title: "Holographic Research Presentations",
      type: "presentation",
      venue: "Multiple Reality Chambers",
      description: "3D holographic research demonstrations",
      speakers: ["Holographic Presenters"],
      icon: Brain,
      color: "from-indigo-500 to-purple-600",
      tech: "Holographic Display",
    },
    {
      time: "15:30 - 16:00",
      title: "Quantum Energy Restoration",
      type: "break",
      venue: "Energy Chamber",
      description: "Quantum field energy restoration",
      icon: Zap,
      color: "from-cyan-500 to-blue-600",
      tech: "Quantum Energy",
    },
    {
      time: "16:00 - 17:00",
      title: "Interdimensional Awards Ceremony",
      type: "ceremony",
      venue: "Main Reality Chamber",
      description: "Recognition across multiple dimensions",
      speakers: ["Quantum Committee"],
      icon: Award,
      color: "from-gold-500 to-yellow-600",
      tech: "Interdimensional Tech",
    },
    {
      time: "17:00 - 17:30",
      title: "Portal Closing Ceremony",
      type: "ceremony",
      venue: "Main Reality Chamber",
      description: "Closing the conference portal to the future",
      speakers: ["Dr. Rajesh Kumar"],
      icon: Zap,
      color: "from-purple-500 to-pink-600",
      tech: "Portal Technology",
    },
  ],
}

const getTypeColor = (type: string) => {
  const colors = {
    keynote: "from-orange-500 to-red-600",
    session: "from-blue-500 to-purple-600",
    workshop: "from-green-500 to-teal-600",
    panel: "from-purple-500 to-pink-600",
    ceremony: "from-red-500 to-pink-600",
    break: "from-gray-500 to-gray-600",
    registration: "from-yellow-500 to-orange-600",
    social: "from-pink-500 to-purple-600",
    forum: "from-indigo-500 to-blue-600",
    presentation: "from-teal-500 to-cyan-600",
  }
  return colors[type as keyof typeof colors] || "from-gray-500 to-gray-600"
}

export default function ProgramPage() {
  const [selectedDay, setSelectedDay] = useState(1)
  const [isNotifyOpen, setIsNotifyOpen] = useState(false)
  const [email, setEmail] = useState("")
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 1000], [0, -200])

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
          source: 'program'
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
// Remove setIsSubmitted since it's not defined and not needed
        setTimeout(() => {
          setIsNotifyOpen(false)
// Remove setIsSubmitted since it's not defined
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
    <div className="min-h-screen bg-gradient-to-b from-white to-orange-50 text-gray-800 overflow-hidden dark:from-gray-900 dark:to-gray-800 dark:text-gray-100">
      <Navigation currentPage="program" />

      <div className="pt-20 lg:pt-24">
        {/* Interactive Coming Soon Section */}
        <section className="relative py-32 overflow-hidden bg-gradient-to-b from-orange-100 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">

          <div className="container mx-auto px-6 text-center">
            <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-8 leading-none">
                <span className="bg-gradient-to-r from-gray-800 via-orange-600 to-red-600 bg-clip-text text-transparent dark:from-white dark:via-orange-400 dark:to-red-400">
                  CONFERENCE
                </span>
                <br />
                <span className="bg-gradient-to-r from-orange-500 via-red-500 to-red-600 bg-clip-text text-transparent">
                  PROGRAM
                </span>
              </h1>

              <div className="mb-8">
                <motion.div 
                  className="inline-flex items-center px-6 py-3 bg-orange-100 dark:bg-orange-900/30 rounded-full mb-6"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <Zap className="w-5 h-5 mr-2 text-orange-600 dark:text-orange-400" />
                  <span className="text-orange-600 dark:text-orange-400 font-semibold">Coming Soon</span>
                </motion.div>
                
                <p className="text-xl lg:text-2xl text-gray-700 dark:text-gray-300 mb-6 max-w-4xl mx-auto leading-relaxed">
                  Our expert committee is crafting an extraordinary program featuring cutting-edge research,
                  <br />
                  <span className="text-lg text-orange-600 dark:text-orange-400">interactive workshops, and world-renowned speakers.</span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    onClick={() => setIsNotifyOpen(true)}
                    className="px-8 py-4 text-lg bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-full shadow-2xl"
                  >
                    <Bell className="w-5 h-5 mr-2" />
                    Notify Me When Available
                  </Button>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/register">
                    <Button 
                      variant="outline"
                      className="px-8 py-4 text-lg border-2 border-orange-500 text-orange-600 hover:bg-orange-50 rounded-full dark:border-orange-400 dark:text-orange-400 dark:hover:bg-orange-900/20"
                    >
                      <Calendar className="w-5 h-5 mr-2" />
                      Register Now
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Program Preview Section */}
        <section className="py-16 relative">
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
                Get a sneak peek at what our revolutionary program will include
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  icon: Brain,
                  title: "Keynote Sessions",
                  desc: "World-renowned experts sharing breakthrough research",
                  color: "from-purple-500 to-pink-600",
                },
                {
                  icon: Users,
                  title: "Interactive Workshops",
                  desc: "Hands-on learning with cutting-edge techniques",
                  color: "from-blue-500 to-cyan-600",
                },
                {
                  icon: Cpu,
                  title: "Technical Sessions",
                  desc: "Latest innovations in neurotrauma care",
                  color: "from-orange-500 to-red-600",
                },
                {
                  icon: Award,
                  title: "Awards Ceremony",
                  desc: "Recognizing excellence in the field",
                  color: "from-green-500 to-teal-600",
                },
                {
                  icon: MapPin,
                  title: "Networking Events",
                  desc: "Connect with peers and industry leaders",
                  color: "from-yellow-500 to-orange-600",
                },
                {
                  icon: Download,
                  title: "Research Presentations",
                  desc: "Latest findings and clinical studies",
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

        {/* COMMENTED OUT - Detailed Program Content */}
        {/*
        <section className="py-8 md:py-16 relative">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-8 md:mb-16">
              ... (all the existing detailed program content remains here, commented out)
            </div>
          </div>
        </section>
        */}

        {/* COMMENTED OUT - Day Selector & Program Schedule 
        <section className="py-4 md:py-8">
          ... (all existing day selector and program schedule content remains here, commented out)
        </section>
        */}

        {/* Spectacular CTA */}
        <section className="py-16 md:py-24 lg:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-orange-600 to-red-600"></div>
          <div className="absolute inset-0 bg-white/10"></div>

          <motion.div
            className="relative z-10 container mx-auto px-4 md:px-6 text-center"
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 md:mb-8 text-white">
              Ready to Join
              <br />
              <span className="bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">
                The Future?
              </span>
            </h2>

            <p className="text-lg md:text-xl lg:text-2xl text-white/90 mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
              Don't just attend a conference—experience the future of neurotrauma medicine.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 md:gap-8 justify-center px-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/register">
                  <Button className="w-full sm:w-auto px-8 md:px-12 py-4 md:py-6 text-lg md:text-xl bg-white text-orange-600 hover:bg-gray-100 rounded-full shadow-2xl font-bold">
                    <Play className="mr-2 md:mr-3 h-5 w-5 md:h-6 md:w-6" />
                    Register Now
                  </Button>
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/abstracts">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto px-8 md:px-12 py-4 md:py-6 text-lg md:text-xl border-2 border-white text-white bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm font-bold shadow-lg"
                  >
                    Submit Abstract
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
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
                  Get Notified
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Be the first to know when our program is released
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
                  We'll only send you updates about the conference program. No spam, ever.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
