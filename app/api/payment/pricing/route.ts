import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Configuration from '@/lib/models/Configuration'
import { getCurrentPricingTier, getNextPricingTier } from '@/lib/utils/pricingTiers'

export async function GET() {
  try {
    await connectDB()

    // Get current pricing tier
    const currentTier = await getCurrentPricingTier()
    const nextTier = await getNextPricingTier()

    // Fetch workshop configuration
    const workshopConfig = await Configuration.findOne({
      type: 'pricing',
      key: 'workshops',
      isActive: true
    })

    let workshops: any[] = []
    if (workshopConfig) {
      workshops = workshopConfig.value
    }

    if (workshops.length === 0) {
      workshops = [
        { id: 'brain-surgery', name: 'Advanced Brain Surgery Techniques', amount: 2000 },
        { id: 'spinal-injury', name: 'Spinal Cord Injury Management', amount: 2500 },
        { id: 'pediatric-neurotrauma', name: 'Pediatric Neurotrauma', amount: 2000 },
        { id: 'minimally-invasive', name: 'Minimally Invasive Neurosurgery', amount: 1500 },
        { id: 'neurotrauma-rehab', name: 'Neurotrauma Rehabilitation', amount: 1800 },
        { id: 'emergency-neurosurgery', name: 'Emergency Neurosurgery', amount: 2200 }
      ]
    }

    return NextResponse.json({
      success: true,
      data: {
        currentTier: currentTier ? {
          id: currentTier.id,
          name: currentTier.name,
          description: currentTier.description,
          startDate: currentTier.startDate,
          endDate: currentTier.endDate,
          categories: currentTier.categories
        } : null,
        nextTier: nextTier ? {
          tier: {
            id: nextTier.tier.id,
            name: nextTier.tier.name,
            description: nextTier.tier.description,
            startDate: nextTier.tier.startDate,
            endDate: nextTier.tier.endDate
          },
          daysUntil: nextTier.daysUntil
        } : null,
        workshops,
        // Legacy format for backward compatibility
        registration_categories: currentTier?.categories || {},
      }
    })

  } catch (error) {
    console.error('Pricing fetch error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}