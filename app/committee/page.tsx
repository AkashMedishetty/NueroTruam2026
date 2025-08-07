"use client"

import { useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { Mail, Linkedin, Award, GraduationCap, Star, Sparkles, Users, Trophy } from "lucide-react"
import Link from "next/link"

const committeeMembers = [
  {
    id: 1,
    name: "Dr. Manas Panigrahi",
    title: "Organising Chairman",
    // institution: "AIIMS Hyderabad",
    // specialty: "Brain & Spinal Injury Surgery",
    image: "/Dr. Manas P.jpg",
    bio: "Dr. Manas Panigrahi is a distinguished neurotrauma surgeon with extensive experience in brain and spinal injury treatment.",
    // achievements: ["Padma Shri Awardee", "500+ Research Papers", "AI Surgery Pioneer", "Global Innovation Leader"],
    email: "manas.panigrahi@hospital.edu",
    color: "#ff6b35",
    // stats: { surgeries: "5000+", papers: "500+", awards: "25+" },
  },
  {
    id: 2,
    name: "Dr. Raghavendra H",
    title: "Organising Secretary",
    // institution: "NIMS Hyderabad",
    // specialty: "Spine Surgery & Robotics",
    image: "/Dr. R H.jpg",
    bio: "Dr. Raghavendra H is an experienced neurosurgeon specializing in advanced neurotrauma care and surgical techniques.",
    // achievements: ["Robotics Pioneer", "300+ Publications", "Innovation Excellence", "Future Medicine Award"],
    email: "raghavendra.h@hospital.edu",
    color: "#ff8c42",
    // stats: { surgeries: "3000+", papers: "300+", awards: "20+" },
  },
  {
    id: 3,
    name: "Dr. Swetha P",
    title: "Treasurer",
    // institution: "Hyderabad Medical College",
    // specialty: "Sports Medicine & VR Therapy",
    image: "/Dr S P.jpg",
    bio: "Dr. Swetha P is a dedicated medical professional with expertise in neurotrauma management and administrative excellence.",
    // achievements: ["VR Therapy Creator", "Olympic Innovation", "Biometric Expert", "Future Sports Medicine"],
    email: "swetha.p@hospital.edu",
    color: "#ffa726",
    // stats: { surgeries: "2500+", papers: "200+", awards: "15+" },
  },
  // {
  //   id: 4,
  //   name: "Dr. Meera Reddy",
  //   title: "Pediatric Innovation Director",
  //   institution: "Apollo Hospitals",
  //   specialty: "Pediatric Neurotrauma & Gene Therapy",
  //   image: "/placeholder.svg?height=400&width=400",
  //   bio: "Dr. Meera Reddy pioneers genetic correction techniques for congenital neurotrauma conditions. Her breakthrough work in CRISPR-based neural regeneration offers hope to millions of children worldwide.",
  //   achievements: ["Gene Therapy Pioneer", "CRISPR Innovation", "Pediatric Excellence", "Regenerative Medicine"],
  //   email: "meera.reddy@apollo.com",
  //   color: "#ff7043",
  //   stats: { surgeries: "1500+", papers: "250+", awards: "18+" },
  // },
  // {
  //   id: 5,
  //   name: "Dr. Vikram Singh",
  //   title: "Trauma & Emergency Chief",
  //   institution: "PGIMER Chandigarh",
  //   specialty: "Emergency Robotics & AI Diagnostics",
  //   image: "/placeholder.svg?height=400&width=400",
  //   bio: "Dr. Vikram Singh leads emergency trauma response with AI-powered diagnostic systems and robotic surgical units. His innovations have reduced emergency surgery time by 70% while improving outcomes exponentially.",
  //   achievements: ["Emergency AI Pioneer", "Robotic Surgery Leader", "Trauma Innovation", "Life-Saving Technology"],
  //   email: "vikram.singh@pgimer.edu",
  //   color: "#ff5722",
  //   stats: { surgeries: "4000+", papers: "350+", awards: "22+" },
  // },
  // {
  //   id: 6,
  //   name: "Dr. Kavitha Nair",
  //   title: "Oncology & Bioengineering Lead",
  //   institution: "CMC Vellore",
  //   specialty: "Neurotrauma Oncology & 3D Bioprinting",
  //   image: "/placeholder.svg?height=400&width=400",
  //   bio: "Dr. Kavitha Nair creates living neural tissue through 3D bioprinting technology. Her revolutionary brain and spinal reconstruction techniques using patient-specific stem cells have eliminated the need for traditional treatments.",
  //   achievements: ["3D Bioprinting Pioneer", "Stem Cell Innovation", "Oncology Excellence", "Tissue Engineering"],
  //   email: "kavitha.nair@cmc.edu",
  //   color: "#e91e63",
  //   stats: { surgeries: "2000+", papers: "280+", awards: "16+" },
  // },
]

// New committee members from your list
const additionalCommitteeMembers = [
  "Dr. A K Purohit", "Dr. A Krishna Reddy", "Dr. Abhi Ramchandra G", "Dr. Alok Ranjan", 
  "Dr. Ambresh A", "Dr. Amitava Ray", "Dr. Aneel Kumar P", "Dr. Anil Kumar", 
  "Dr. B J Rajesh", "Dr. B S V Raju", "Dr. Bala Rajashekhar", "Dr. Chandrashekhar Naidu", 
  "Dr. Dasardhi", "Dr. Devi", "Dr. G Prakash Rao", "Dr. G Venu gopal", 
  "Dr. Gopala Krishna", "Dr. I Dinakar", "Dr. Jaleel Kirmani", "Dr. K V L Narasinga Rao", 
  "Dr. K V R Sastry", "Dr. Kalyan Bommakanti", "Dr. Kaushal Ippili", "Dr. M A Jaleel", 
  "Dr. Manik Prabhu", "Dr. Manohar Reddy", "Dr. Mastan Reddy", "Dr. N Pratap Kumar", 
  "Dr. Naveen Mehrotra", "Dr. Pasham Amarendra", "Dr. Phaniraj G L", "Dr. R Nagaraju", 
  "Dr. R T S Naik", "Dr. Raghu Samala", "Dr. Rahul Lath", "Dr. Rajesh Alugolu", 
  "Dr. Rajesh Reddy", "Dr. Ram Kishan", "Dr. Rama Krishna Choudary", "Dr. Ramanadha Reddy K", 
  "Dr. S Madan Reddy", "Dr. S Ramesh", "Dr. Sai Kalyan Savarapu", "Dr. Sandhya Kodali", 
  "Dr. Savitr Sastri BV", "Dr. Sharan Basappa", "Dr. Sreedharala Srinivasa S", "Dr. Subodh Raju", 
  "Dr. Suchanda Bhattacharjee", "Dr. Sujit Kumar Vidiyala", "Dr. Sukumar Sura", 
  "Dr. Syed Ameer Basha Pasapala", "Dr. T Narasimha Rao", "Dr. T V R K Murthy", 
  "Dr. T V Srinivas", "Dr. Thirumal Yerragunta", "Dr. Vamsi Krishna Kotha", 
  "Dr. Vamsi Krishna Y", "Dr. Vasundhara S Rangan", "Dr. Vijayasaradhi M", "Dr. Vishaka Karpe Patil"
]

export default function CommitteePage() {
  const [selectedMember, setSelectedMember] = useState<number | null>(null)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 1000], [0, -200])

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-orange-50 text-gray-800 overflow-hidden dark:from-gray-900 dark:to-gray-800 dark:text-gray-100">
      <Navigation currentPage="committee" />

      <div className="pt-16 md:pt-20 lg:pt-24">
        {/* Header Section */}
        <section className="relative py-12 md:py-16 lg:py-32 overflow-hidden bg-gradient-to-b from-orange-100 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-4 md:mb-6 lg:mb-8 leading-none px-2 md:px-4">
                <span className="bg-gradient-to-r from-gray-800 via-orange-600 to-red-600 bg-clip-text text-transparent dark:from-white dark:via-orange-400 dark:to-red-400">
                  ORGANIZING
                </span>
                <br />
                <span className="bg-gradient-to-r from-orange-500 via-red-500 to-red-600 bg-clip-text text-transparent">
                  COMMITTEE
                </span>
              </h1>

              <p className="text-base md:text-lg lg:text-xl xl:text-2xl text-gray-700 dark:text-gray-300 mb-6 md:mb-8 lg:mb-12 max-w-4xl mx-auto leading-relaxed px-2 md:px-4">
                Meet the extraordinary minds shaping the future of neurotrauma medicine.
                <br />
                <span className="text-base md:text-lg text-orange-600 dark:text-orange-400">Where innovation meets excellence.</span>
              </p>

              {/* Stats Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 lg:gap-8 max-w-4xl mx-auto mb-8 md:mb-12 lg:mb-16 px-2 md:px-4">
                {[
                  { number: "25,000+", label: "Combined Surgeries", icon: Users },
                  { number: "1,500+", label: "Research Papers", icon: GraduationCap },
                  { number: "150+", label: "Global Awards", icon: Trophy },
                  { number: "50+", label: "Innovations", icon: Sparkles },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    className="text-center p-2 md:p-3 lg:p-6 rounded-lg md:rounded-xl lg:rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-orange-100 dark:border-gray-700 shadow-lg hover:shadow-orange-100/50 dark:hover:shadow-gray-700/50"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <stat.icon className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-orange-500 mx-auto mb-1 md:mb-2 lg:mb-3" />
                    <div className="text-lg md:text-xl lg:text-3xl font-bold bg-gradient-to-r from-gray-800 via-orange-600 to-red-600 bg-clip-text text-transparent dark:from-white dark:via-orange-400 dark:to-red-400">
                      {stat.number}
                    </div>
                    <div className="text-xs md:text-xs lg:text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Key Committee Cards */}
        <section className="py-16 md:py-24 lg:py-32 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-white dark:from-gray-800 dark:to-gray-900"></div>

          <div className="relative z-10 container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12 md:mb-16 lg:mb-20"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 lg:mb-8 bg-gradient-to-r from-gray-800 via-orange-600 to-red-600 bg-clip-text text-transparent dark:from-white dark:via-orange-400 dark:to-red-400 px-2">
                Key Organizers
              </h2>
              <p className="text-base md:text-lg lg:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto px-4">
                Leading the organization with vision and expertise.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
              {committeeMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  className="relative group cursor-pointer"
                  initial={{ opacity: 0, y: 100 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  whileHover={{ y: -10, rotateY: 5 }}
                  onHoverStart={() => setHoveredCard(member.id)}
                  onHoverEnd={() => setHoveredCard(null)}
                  onClick={() => setSelectedMember(selectedMember === member.id ? null : member.id)}
                >
                  {/* Glowing Background */}
                  <div className="absolute inset-0 rounded-2xl md:rounded-3xl blur-2xl opacity-10 group-hover:opacity-20 transition-all duration-500 bg-gradient-to-br from-orange-500/30 to-red-600/20"></div>

                  {/* Main Card */}
                  <div className="relative bg-white dark:bg-gray-800 backdrop-blur-xl border border-orange-100 dark:border-gray-700 rounded-xl md:rounded-2xl lg:rounded-3xl overflow-hidden group-hover:border-orange-200 dark:group-hover:border-gray-600 transition-all duration-500 shadow-lg hover:shadow-xl hover:shadow-orange-100/20 dark:hover:shadow-gray-700/20">
                    {/* Header with Member Image */}
                    <div className="relative h-84 md:h-96 lg:h-102 overflow-hidden">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover object-center"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>

                      {/* Stats Overlay */}
                      {/* <div className="absolute top-3 md:top-4 right-3 md:right-4 flex space-x-1 md:space-x-2">
                        {Object.entries(member.stats).map(([key, value], i) => (
                          <motion.div
                            key={key}
                            className="bg-white/20 backdrop-blur-sm rounded-full px-2 md:px-3 py-1 text-xs text-white font-medium"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 + i * 0.05 }}
                          >
                            {value}
                          </motion.div>
                        ))}
                      </div> */}
                    </div>

                    {/* Content */}
                    <div className="p-3 md:p-4 lg:p-6">
                      <div className="mb-4 md:mb-6">
                        <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 group-hover:text-orange-600 transition-colors">
                          {member.name}
                        </h3>
                        <p className="text-orange-600 font-semibold mb-1 text-sm md:text-base">{member.title}</p>
                        {/* <p className="text-gray-600 dark:text-gray-300 text-xs md:text-sm mb-2">{member.institution}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">{member.specialty}</p> */}
                      </div>

                      {/* Expandable Bio */}
                      <motion.div
                        initial={false}
                        animate={{
                          height: selectedMember === member.id ? "auto" : "0",
                          opacity: selectedMember === member.id ? 1 : 0,
                        }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mb-4 md:mb-6">
                          <p className="text-gray-700 dark:text-gray-200 leading-relaxed mb-3 md:mb-4 text-sm md:text-base">{member.bio}</p>

                          {/* Achievements */}
                          {/* <div className="mb-3 md:mb-4">
                            <h4 className="font-semibold mb-2 md:mb-3 flex items-center text-orange-600 text-sm md:text-base">
                              <Award className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                              Key Achievements
                            </h4>
                            <div className="grid grid-cols-1 gap-2">
                              {member.achievements.map((achievement, idx) => (
                                <motion.div
                                  key={idx}
                                  className="flex items-center text-xs md:text-sm text-gray-700 dark:text-gray-300 bg-orange-50 dark:bg-gray-700/50 rounded-full px-2 md:px-3 py-1"
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.1 }}
                                >
                                  <Star className="w-3 h-3 mr-1 text-orange-500" />
                                  {achievement}
                                </motion.div>
                              ))}
                            </div>
                          </div> */}

                          {/* Contact */}
                          <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-orange-100 dark:border-gray-600">
                            <a
                              href={`mailto:${member.email}`}
                              className="flex items-center text-xs md:text-sm text-orange-600 hover:text-orange-700 transition-colors"
                            >
                              <Mail className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                              Contact
                            </a>
                            <Linkedin className="w-3 h-3 md:w-4 md:h-4 text-gray-500 dark:text-gray-400 hover:text-orange-600 cursor-pointer transition-colors" />
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Additional Committee Members Grid */}
        <section className="py-16 md:py-24 lg:py-32 relative bg-gradient-to-b from-white to-orange-50 dark:from-gray-800 dark:to-gray-900">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12 md:mb-16 lg:mb-20"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 lg:mb-8 bg-gradient-to-r from-gray-800 via-orange-600 to-red-600 bg-clip-text text-transparent dark:from-white dark:via-orange-400 dark:to-red-400 px-2">
                Committee Members
              </h2>
              <p className="text-base md:text-lg lg:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto px-4">
                Distinguished medical professionals contributing their expertise and vision.
              </p>
            </motion.div>

            {/* Glass Morphism Grid for Additional Members */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-white/50 dark:from-gray-800/50 dark:to-gray-900/50 rounded-3xl"></div>
              
              <div className="relative bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl border border-orange-100/50 dark:border-gray-700/50 rounded-3xl p-8 md:p-12 lg:p-16 shadow-xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                  {additionalCommitteeMembers.map((memberName, index) => (
                    <motion.div
                      key={index}
                      className="relative group"
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.02 }}
                      whileHover={{ y: -2, scale: 1.02 }}
                    >
                      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg border border-orange-100/30 dark:border-gray-700/30 rounded-2xl p-4 md:p-5 text-center transition-all duration-300 group-hover:bg-orange-50/50 dark:group-hover:bg-gray-700/50 group-hover:border-orange-200/50 dark:group-hover:border-gray-600/50 group-hover:shadow-lg group-hover:shadow-orange-100/20 dark:group-hover:shadow-gray-700/20 cursor-pointer">
                        <h3 className="text-sm md:text-base font-medium text-gray-800 dark:text-gray-200 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors leading-tight">
                          {memberName}
                        </h3>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Vision Statement */}
        {/* <section className="py-16 md:py-24 lg:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-800 dark:to-gray-900"></div>

          <motion.div
            className="relative z-10 container mx-auto px-4 md:px-6 text-center"
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="max-w-3xl md:max-w-4xl lg:max-w-5xl mx-auto">
              <motion.div
                className="relative p-6 md:p-8 lg:p-12 rounded-2xl md:rounded-3xl bg-white dark:bg-gray-800 backdrop-blur-xl border border-orange-200 dark:border-gray-700 shadow-xl"
                whileHover={{ scale: 1.02, rotateY: 2 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-600/5 rounded-2xl md:rounded-3xl blur-xl"></div>

                <div className="relative z-10">
                  <Sparkles className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 text-orange-500 mx-auto mb-6 md:mb-8" />

                  <blockquote className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-light text-gray-800 dark:text-gray-100 mb-6 md:mb-8 leading-relaxed italic">
                    "We are not just organizing a conference—we are orchestrating the future of human mobility. Every
                    innovation, every breakthrough, every moment of collaboration brings us closer to a world where
                    neurotrauma limitations become obsolete."
                  </blockquote>

                  <div className="flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-4">
                    <div className="hidden md:block w-8 lg:w-16 h-0.5 bg-gradient-to-r from-transparent to-orange-500"></div>
                    <Award className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-orange-500" />
                    <span className="text-sm md:text-base lg:text-lg font-semibold text-orange-600 uppercase tracking-wide text-center">
                      Our Vision Statement
                    </span>
                    <Award className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-orange-500" />
                    <div className="hidden md:block w-8 lg:w-16 h-0.5 bg-gradient-to-l from-transparent to-orange-500"></div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section> */}
      </div>
    </div>
  )
}