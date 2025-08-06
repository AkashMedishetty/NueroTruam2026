import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Configuration from '@/lib/models/Configuration'
import Workshop from '@/lib/models/Workshop'
import { getCurrentPricingTier } from '@/lib/utils/pricingTiers'

interface CalculatePaymentRequest {
  registrationType: string
  workshopSelections: string[]
  accompanyingPersons: Array<{
    name: string
    age: number
    relationship: string
  }>
  discountCode?: string
}

export async function POST(request: NextRequest) {
  try {
    // Allow price calculation without authentication for registration flow
    const session = await getServerSession(authOptions)

    const body: CalculatePaymentRequest = await request.json()
    const { registrationType, workshopSelections, accompanyingPersons, discountCode } = body

    await connectDB()

    // Get current pricing tier based on date
    const currentTier = await getCurrentPricingTier()
    
    if (!currentTier) {
      return NextResponse.json({
        success: false,
        message: 'Pricing configuration not available'
      }, { status: 500 })
    }

    // Use current tier pricing
    const registrationCategories = currentTier.categories

    // Fetch active workshops from Workshop model
    const workshops = await Workshop.find({ isActive: true }).lean()

    const discountConfigs = await Configuration.find({
      type: 'discounts',
      isActive: true
    }).lean()

    // Calculate base registration fee
    let registrationFee = 0
    let currency = 'INR'

    // Handle complimentary and sponsored registrations
    if (registrationType === 'complimentary' || registrationType === 'sponsored') {
      registrationFee = 0
      currency = 'INR'
    } else {
      const registrationCategory = registrationCategories[registrationType]
      if (!registrationCategory) {
        return NextResponse.json({
          success: false,
          message: 'Invalid registration type'
        }, { status: 400 })
      }
      registrationFee = registrationCategory.amount
      currency = registrationCategory.currency
    }

    // Calculate workshop fees
    let workshopFees = 0
    const selectedWorkshopDetails: Array<{ name: string; amount: number; id?: string }> = []

    workshopSelections.forEach(workshopIdentifier => {
      // Try to find workshop by id, name, or _id
      const workshop = workshops.find(w => 
        w.id === workshopIdentifier || 
        w.name === workshopIdentifier ||
        (w._id && w._id.toString() === workshopIdentifier)
      )
      if (workshop) {
        const workshopPrice = workshop.price || workshop.amount || 0
        workshopFees += workshopPrice
        selectedWorkshopDetails.push({
          name: workshop.name,
          amount: workshopPrice,
          id: workshop.id
        })
        console.log(`Found workshop: ${workshop.name} - ₹${workshopPrice}`)
      } else {
        console.warn(`Workshop not found: ${workshopIdentifier}`)
        console.log(`Available workshops:`, workshops.map(w => ({id: w.id, name: w.name, price: w.price})))
      }
    })

    // Calculate accompanying person fees based on current tier
    let accompanyingPersonRate = 3000 // Default rate
    
    // Fetch accompanying person pricing configuration
    const accompanyingPersonConfig = await Configuration.findOne({
      type: 'pricing',
      key: 'accompanying_person',
      isActive: true
    })
    
    if (accompanyingPersonConfig?.value) {
      const tierId = currentTier.id || 'regular'
      accompanyingPersonRate = accompanyingPersonConfig.value.tierPricing?.[tierId] || accompanyingPersonConfig.value.basePrice || 3000
    }
    
    const accompanyingPersonFees = accompanyingPersons.length * accompanyingPersonRate

    // Calculate subtotal
    const subtotal = registrationFee + workshopFees + accompanyingPersonFees

    // Apply discounts
    let totalDiscount = 0
    const appliedDiscounts: Array<{
      type: string
      code?: string
      percentage: number
      amount: number
    }> = []

    // Check for time-based discounts (Independence Day, Early Bird)
    const currentDate = new Date()
    
    discountConfigs.forEach(config => {
      if (config.key === 'active_discounts' && Array.isArray(config.value)) {
        config.value.forEach((discount: any) => {
          if (discount.type === 'time-based') {
            const startDate = discount.startDate ? new Date(discount.startDate) : null
            const endDate = discount.endDate ? new Date(discount.endDate) : null
            
            const isInDateRange = (!startDate || currentDate >= startDate) && 
                                 (!endDate || currentDate <= endDate)
            
            const isApplicableCategory = discount.applicableCategories.includes('all') || 
                                       discount.applicableCategories.includes(registrationType)
            
            if (isInDateRange && isApplicableCategory) {
              const discountAmount = Math.floor(subtotal * discount.percentage / 100)
              totalDiscount += discountAmount
              appliedDiscounts.push({
                type: discount.id,
                percentage: discount.percentage,
                amount: discountAmount
              })
            }
          }
        })
      }
    })

    // Apply discount code if provided
    if (discountCode) {
      discountConfigs.forEach(config => {
        if (config.key === 'active_discounts' && Array.isArray(config.value)) {
          config.value.forEach((discount: any) => {
            if (discount.type === 'code-based' && discount.code === discountCode) {
              const isApplicableCategory = discount.applicableCategories.includes('all') || 
                                         discount.applicableCategories.includes(registrationType)
              
              if (isApplicableCategory) {
                const discountAmount = Math.floor(subtotal * discount.percentage / 100)
                totalDiscount += discountAmount
                appliedDiscounts.push({
                  type: 'code',
                  code: discountCode,
                  percentage: discount.percentage,
                  amount: discountAmount
                })
              }
            }
          })
        }
      })
    }

    const total = Math.max(0, subtotal - totalDiscount)

    const calculation = {
      registrationFee,
      workshopFees,
      accompanyingPersonFees,
      subtotal,
      discount: totalDiscount,
      total,
      currency,
      currentTier: {
        id: currentTier.id,
        name: currentTier.name,
        description: currentTier.description,
        endDate: currentTier.endDate
      },
      breakdown: {
        registrationType,
        baseAmount: registrationFee,
        workshopFees: selectedWorkshopDetails,
        accompanyingPersonFees,
        discountsApplied: appliedDiscounts
      }
    }

    return NextResponse.json({
      success: true,
      data: calculation
    })

  } catch (error) {
    console.error('Payment calculation error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}