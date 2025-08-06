"use client"

import { useState, useEffect } from "react"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import { Button } from "@/components/ui/button"
import { X, Navigation as NavigationIcon, ExternalLink } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface InteractiveElementsProps {
  children: React.ReactNode
}

interface LocationData {
  name: string
  description: string
  category: string
  rating: string
  time: string
  bestTime: string
  highlights: string[]
  icon: string
  image: string
}

export function InteractiveElements({ children }: InteractiveElementsProps) {
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
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

  const handleLearnMore = (place: LocationData) => {
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
    <>
      {children}
      
      {/* Location Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
              <span className="text-2xl">{selectedLocation?.icon}</span>
              {selectedLocation?.name}
            </DialogTitle>
            <DialogDescription className="text-lg text-gray-600 dark:text-gray-400">
              {selectedLocation?.description}
            </DialogDescription>
          </DialogHeader>
          
          {selectedLocation && (
            <div className="space-y-6">
              {/* Location Image */}
              <div className="w-full h-64 rounded-lg overflow-hidden">
                <img 
                  src={selectedLocation.image} 
                  alt={selectedLocation.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Location Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button 
                  onClick={() => handleGetDirections(selectedLocation.name)}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
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
                  className="flex-1 border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Learn More Online
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

// Export the handlers for use in server components
export { type LocationData }