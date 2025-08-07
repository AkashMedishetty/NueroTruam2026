import { Suspense } from "react"
import Image from "next/image"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, Award, Sparkles, ArrowRight, Mail } from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { CountdownTimer } from "@/components/home/CountdownTimer"
import { InteractiveElements } from "@/components/home/InteractiveElements"

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

// Static data that can be pre-rendered
const organizers = [
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
]

const committeeMembers = [
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
]

const hyderabadPlaces = [
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
]

export default function HomePage() {
  return (
    <InteractiveElements>
      <div className="min-h-screen bg-gradient-to-b from-white to-orange-50 text-gray-800 overflow-hidden dark:from-gray-900 dark:to-gray-900 dark:text-gray-100">
        <Navigation currentPage="home" />

        {/* Revolutionary Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 dark:bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <div className="absolute inset-0 bg-white dark:bg-gray-900"></div>

          <div className="container mx-auto px-6 relative z-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center min-h-[80vh]">
              {/* Left Column - Content */}
              <div className="space-y-8">
                {/* Conference Details Badge */}
                <div className="inline-block">
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
                </div>

                {/* Main Title */}
                <div>
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
                </div>

                {/* Subtitle */}
                <div>
                  <p className="text-xl lg:text-2xl text-gray-700 dark:text-gray-300 font-light leading-relaxed">
                    Annual Conference of Neurotrauma Society of India
                    <br />
                    <span className="text-lg text-orange-600">Science, Sports & Spiritually</span>
                  </p>
                </div>

                {/* CTA Buttons */}
                <div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                    <Link href="/register">
                      <Button className="px-8 py-4 text-lg bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-full shadow-lg hover:shadow-orange-200/50 transition-all duration-300 border-0">
                        <Sparkles className="mr-2 h-5 w-5" />
                        Register Now
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Organized By Section */}
                <div className="text-center max-w-4xl mx-auto">
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8">
                    Organized by
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center justify-items-center">
                    {organizers.map((org, index) => (
                      <div
                        key={index}
                        className="flex flex-col items-center space-y-4 p-6 rounded-xl bg-white/80 backdrop-blur-xl border border-orange-100 hover:bg-white hover:shadow-lg transition-all duration-300 dark:bg-gray-800/80 dark:border-gray-700 dark:hover:bg-gray-800 w-full max-w-xs"
                      >
                        <Image
                          src={org.src}
                          alt={org.alt}
                          width={80}
                          height={64}
                          className="object-contain filter hover:brightness-110 transition-all duration-300"
                          priority={index === 0}
                        />
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">
                          {org.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - 3D Model */}
              <div className="relative h-[500px] md:h-[800px] lg:h-[900px] three-canvas-container mobile-3d-model">
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-orange-100/60 via-orange-50/40 to-red-100/30 rounded-3xl">
                      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500"></div>
                    </div>
                  }
                >
                  <BrainModel />
                </Suspense>
              </div>
            </div>
          </div>
        </section>

        {/* Countdown Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900"></div>
          <div className="relative z-10">
            <div className="container mx-auto px-6 text-center">
              <h2 className="text-5xl font-bold mb-16 bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                Conference Countdown
              </h2>
              <CountdownTimer />
            </div>
          </div>
        </section>

        {/* Rest of the page content... */}
        {/* I'll continue with the remaining sections in the next part */}
      </div>
    </InteractiveElements>
  )
}