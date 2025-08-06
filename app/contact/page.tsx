"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from "lucide-react"
import { Navigation } from "@/components/navigation"
import Link from "next/link"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })

  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate form submission
    setIsSubmitted(true)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Navigation currentPage="contact" />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center p-8 lg:p-12 bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md mx-4"
        >
          <CheckCircle className="w-12 h-12 lg:w-16 lg:h-16 text-green-500 mx-auto mb-4 lg:mb-6" />
          <h2 className="text-xl lg:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3 lg:mb-4">Message Sent Successfully!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4 lg:mb-6 text-sm lg:text-base">Thank you for contacting us. We will get back to you shortly.</p>
          <Button onClick={() => setIsSubmitted(false)} className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600">
            Send Another Message
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navigation currentPage="contact" />

      <div className="pt-20 lg:pt-24 pb-12">
        {/* Header */}
        <section className="py-12 lg:py-16 bg-gradient-to-r from-orange-600 to-orange-700 text-white">
          <div className="container mx-auto px-4 text-center">
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 lg:mb-6">Contact Us</h1>
              <p className="text-lg lg:text-xl max-w-3xl mx-auto">
                Have questions about the conference? Get in touch with our team and we'll be happy to assist you.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-2xl lg:text-3xl font-bold mb-6 lg:mb-8 text-gray-800 dark:text-gray-100">Get In Touch</h2>
                <div className="space-y-6 lg:space-y-8">
                  <div className="flex items-start">
                    <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full mr-4">
                      <MapPin className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">Conference Secretariat</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Hyderabad International Convention Center
                        <br />
                        123 Convention Road, Hyderabad, Telangana 500001, India
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full mr-4">
                      <Phone className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">Phone</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        +91 8765432100
                        <br />
                        +91 9876543210
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full mr-4">
                      <Mail className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">Email</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        info@neurotraumacon2026.com
                        <br />
                        support@neurotraumacon2026.com
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full mr-4">
                      <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">Working Hours</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Monday - Friday: 9:00 AM - 5:00 PM
                        <br />
                        Saturday: 9:00 AM - 1:00 PM
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 lg:p-8">
                  <h2 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6 text-gray-800 dark:text-gray-100">Send Us a Message</h2>
                  <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Name *</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Enter your full name"
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address *</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="your.email@example.com"
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+91 9876543210"
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject *</label>
                      <Select value={formData.subject} onValueChange={(value) => handleInputChange("subject", value)}>
                        <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                          <SelectItem value="registration" className="dark:text-gray-100 dark:hover:bg-gray-600">Registration Inquiry</SelectItem>
                          <SelectItem value="abstract" className="dark:text-gray-100 dark:hover:bg-gray-600">Abstract Submission</SelectItem>
                          <SelectItem value="accommodation" className="dark:text-gray-100 dark:hover:bg-gray-600">Accommodation</SelectItem>
                          <SelectItem value="program" className="dark:text-gray-100 dark:hover:bg-gray-600">Scientific Program</SelectItem>
                          <SelectItem value="sponsorship" className="dark:text-gray-100 dark:hover:bg-gray-600">Sponsorship & Exhibition</SelectItem>
                          <SelectItem value="other" className="dark:text-gray-100 dark:hover:bg-gray-600">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message *</label>
                      <Textarea
                        value={formData.message}
                        onChange={(e) => handleInputChange("message", e.target.value)}
                        placeholder="Type your message here..."
                        rows={5}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600">
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 md:py-16 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-800 dark:to-gray-900">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-8 md:mb-12"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800 dark:text-white">Frequently Asked Questions</h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-sm md:text-base">Find answers to common questions about the conference.</p>
            </motion.div>

            <div className="max-w-4xl mx-auto">
              {[
                {
                  question: "What are the registration fees for the conference?",
                  answer:
                    "Registration fees vary depending on your category (regular delegate, student, international delegate, etc.). Early bird registration offers a 50% discount. Please visit the Registration page for detailed fee structure.",
                },
                {
                  question: "Is accommodation included in the registration fee?",
                  answer:
                    "No, accommodation is not included in the registration fee. However, we have partnered with several hotels near the venue to provide special rates for conference delegates.",
                },
                {
                  question: "What is the deadline for abstract submission?",
                  answer:
                    "The deadline for abstract submission is June 30, 2026. Authors will be notified of acceptance by July 15, 2026.",
                },
                {
                  question: "Will there be CME credits for attending the conference?",
                  answer:
                    "Yes, the conference is accredited for CME credits. Certificates will be provided to all registered delegates who attend the sessions.",
                },
                {
                  question: "How can I become a sponsor or exhibitor?",
                  answer:
                    "We offer various sponsorship and exhibition opportunities. Please contact our sponsorship team at sponsors@neurotraumacon2026.com for more information.",
                },
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="mb-6"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
                    <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-white mb-3">{faq.question}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">{faq.answer}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-8 md:mb-12"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800 dark:text-white">Find Us</h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-sm md:text-base">
                The conference will be held at the Hyderabad International Convention Center.
              </p>
            </motion.div>

            <div className="rounded-2xl overflow-hidden shadow-xl h-64 md:h-96 bg-gray-200 dark:bg-gray-700">
              {/* Placeholder for map - in a real implementation, you would use Google Maps or similar */}
              <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                <div className="text-center">
                  <MapPin className="w-10 h-10 md:w-12 md:h-12 text-orange-600 dark:text-orange-400 mx-auto mb-4" />
                  <p className="text-gray-700 dark:text-gray-200 font-semibold text-sm md:text-base">Interactive Map Placeholder</p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">Hyderabad International Convention Center</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-12 md:py-16 bg-gradient-to-r from-orange-600 to-orange-700 text-white">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6">Stay Updated</h2>
              <p className="text-lg md:text-xl mb-6 md:mb-8 max-w-2xl mx-auto">
                Subscribe to our newsletter to receive the latest updates about the conference.
              </p>
              <div className="max-w-md mx-auto">
                <form className="flex flex-col sm:flex-row gap-4">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="bg-white text-gray-800 flex-1"
                    required
                  />
                  <Button type="submit" className="bg-white text-orange-600 hover:bg-gray-100 px-6 py-2">
                    Subscribe
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  )
}
