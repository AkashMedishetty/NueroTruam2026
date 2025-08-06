"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import { Calendar, FileText, Award, Upload, CheckCircle, Bell, Mail, X, Zap, Clock } from "lucide-react"
import Link from "next/link"

export default function AbstractsPage() {
  const [isNotifyOpen, setIsNotifyOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  
  // COMMENTED OUT - Original form data
  /*
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    authors: "",
    institution: "",
    email: "",
    phone: "",
    abstract: "",
    keywords: "",
    presentation: "",
  })
  */

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
          source: 'abstracts'
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

  // COMMENTED OUT - Original handlers
  /*
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate form submission
    setIsSubmitted(true)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }
  */

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center p-8 lg:p-12 bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">You're All Set!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            We'll notify you as soon as abstract submissions open. Keep an eye on your inbox!
          </p>
          <div className="flex gap-3">
            <Button onClick={() => setIsSubmitted(false)} className="flex-1 bg-orange-600 hover:bg-orange-700">
              Back to Page
            </Button>
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full">
                Go Home
          </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navigation currentPage="abstracts" />

      <div className="pt-24 pb-12">
        {/* Header */}
        <section className="py-12 md:py-16 bg-gradient-to-r from-orange-600 to-orange-700 text-white">
          <div className="container mx-auto px-4 text-center">
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">Abstract Submission</h1>
              
              <div className="mb-6">
                <motion.div 
                  className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full mb-4"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <Zap className="w-5 h-5 mr-2 text-white" />
                  <span className="text-white font-semibold">Opening Soon</span>
                </motion.div>
                
              <p className="text-lg md:text-xl max-w-3xl mx-auto">
                  Abstract submissions will open soon! Be among the first to share your groundbreaking research
                  <br />
                  <span className="text-orange-200">with the global neurotrauma community.</span>
                </p>
              </div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={() => setIsNotifyOpen(true)}
                  className="px-8 py-4 text-lg bg-white text-orange-600 hover:bg-orange-50 rounded-full shadow-2xl font-bold"
                >
                  <Bell className="w-5 h-5 mr-2" />
                  Notify Me When Open
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Timeline Preview */}
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
                Submission Timeline
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Here's what to expect when abstract submissions open
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                { 
                  date: "TBD", 
                  title: "Submissions Open", 
                  icon: Calendar,
                  desc: "Start submitting your research abstracts"
                },
                { 
                  date: "TBD", 
                  title: "Review Period", 
                  icon: FileText,
                  desc: "Expert committee reviews all submissions"
                },
                { 
                  date: "TBD", 
                  title: "Notifications Sent", 
                  icon: Award,
                  desc: "Acceptance notifications and program finalization"
                },
                ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="relative group"
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-600/10 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-all duration-300"></div>
                  <div className="relative text-center p-8 bg-white dark:bg-gray-800 backdrop-blur-xl border border-orange-100 dark:border-gray-700 rounded-2xl hover:border-orange-200 dark:hover:border-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{item.title}</h3>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-3">{item.date}</p>
                    <p className="text-gray-600 dark:text-gray-300">{item.desc}</p>
                  </div>
                </motion.div>
                ))}
              </div>
          </div>
        </section>

        {/* Research Categories Preview */}
        <section className="py-16 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-800 dark:to-gray-900">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-800 via-orange-600 to-red-600 bg-clip-text text-transparent">
                Research Categories
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                We welcome abstracts across all areas of neurotrauma research and clinical practice
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: "Clinical Research", desc: "Patient outcomes and treatment efficacy studies", icon: FileText },
                { title: "Surgical Techniques", desc: "Innovative surgical approaches and technologies", icon: Award },
                { title: "Rehabilitation", desc: "Recovery protocols and therapeutic interventions", icon: Clock },
                { title: "Emergency Care", desc: "Acute management and trauma response", icon: Zap },
                { title: "Neuroimaging", desc: "Advanced imaging techniques and diagnostics", icon: Upload },
                { title: "Case Studies", desc: "Unique cases and clinical presentations", icon: CheckCircle },
              ].map((category, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="relative group"
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-600/10 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-all duration-300"></div>
                  <div className="relative bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-100 dark:border-gray-700 hover:border-orange-200 dark:hover:border-gray-600">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-6">
                      <category.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">{category.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{category.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* COMMENTED OUT - Detailed Submission Form and Guidelines 
        <section className="py-12 lg:py-16">
          ... (all existing submission form and guidelines content remains here, commented out)
        </section>
        */}

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
                  Be the first to know when abstract submissions open
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
                  We'll send you an email as soon as submissions open. No spam, ever.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
