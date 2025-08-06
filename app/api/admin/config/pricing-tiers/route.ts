import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Configuration from '@/lib/models/Configuration'
import User from '@/lib/models/User'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 })
    }

    await connectDB()

    const adminUser = await User.findById(session.user.id)
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({
        success: false,
        message: 'Admin access required'
      }, { status: 403 })
    }

    // Fetch pricing tiers configuration
    const pricingTiersConfig = await Configuration.findOne({
      type: 'pricing',
      key: 'pricing_tiers',
      isActive: true
    })

    if (!pricingTiersConfig) {
      // Return default structure if not found
      const defaultPricingTiers = {
        specialOffers: [],
        earlyBird: {
          name: 'Early Bird Registration',
          description: 'Early registration discount',
          startDate: '2025-08-16',
          endDate: '2026-06-30',
          isActive: true,
          categories: {
            'ntsi-member': { amount: 10000, currency: 'INR', label: 'NTSI Member' },
            'non-member': { amount: 14000, currency: 'INR', label: 'Non Member' },
            'pg-student': { amount: 8000, currency: 'INR', label: 'PG Student' },
            'accompanying': { amount: 2500, currency: 'INR', label: 'Accompanying Person' }
          }
        },
        regular: {
          name: 'Regular Registration',
          description: 'Standard registration pricing',
          startDate: '2026-07-01',
          endDate: '2026-08-05',
          isActive: true,
          categories: {
            'ntsi-member': { amount: 12000, currency: 'INR', label: 'NTSI Member' },
            'non-member': { amount: 17000, currency: 'INR', label: 'Non Member' },
            'pg-student': { amount: 10000, currency: 'INR', label: 'PG Student' },
            'accompanying': { amount: 3000, currency: 'INR', label: 'Accompanying Person' }
          }
        },
        onsite: {
          name: 'Onsite Registration',
          description: 'Registration at the venue',
          startDate: '2026-08-06',
          endDate: '2026-08-09',
          isActive: true,
          categories: {
            'ntsi-member': { amount: 15000, currency: 'INR', label: 'NTSI Member' },
            'non-member': { amount: 20000, currency: 'INR', label: 'Non Member' },
            'pg-student': { amount: 12000, currency: 'INR', label: 'PG Student' },
            'accompanying': { amount: 4000, currency: 'INR', label: 'Accompanying Person' }
          }
        }
      }

      return NextResponse.json({
        success: true,
        data: defaultPricingTiers
      })
    }

    return NextResponse.json({
      success: true,
      data: pricingTiersConfig.value
    })

  } catch (error) {
    console.error('Pricing tiers config fetch error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 })
    }

    await connectDB()

    const adminUser = await User.findById(session.user.id)
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({
        success: false,
        message: 'Admin access required'
      }, { status: 403 })
    }

    const body = await request.json()
    const { specialOffers, earlyBird, regular, onsite } = body

    // Validate the data structure
    if (!earlyBird || !regular || !onsite) {
      return NextResponse.json({
        success: false,
        message: 'Missing required pricing tier data'
      }, { status: 400 })
    }

    // Validate each tier has required fields
    const tiers = [earlyBird, regular, onsite, ...(specialOffers || [])]
    for (const tier of tiers) {
      if (!tier.name || !tier.startDate || !tier.endDate || !tier.categories) {
        return NextResponse.json({
          success: false,
          message: 'Invalid tier data: missing required fields'
        }, { status: 400 })
      }

      // Validate categories
      const requiredCategories = ['ntsi-member', 'non-member', 'pg-student', 'accompanying']
      for (const category of requiredCategories) {
        if (!tier.categories[category] || 
            typeof tier.categories[category].amount !== 'number' ||
            !tier.categories[category].currency ||
            !tier.categories[category].label) {
          return NextResponse.json({
            success: false,
            message: `Invalid category data for ${category} in tier ${tier.name}`
          }, { status: 400 })
        }
      }
    }

    // Update pricing tiers configuration
    await Configuration.findOneAndUpdate(
      { type: 'pricing', key: 'pricing_tiers' },
      {
        type: 'pricing',
        key: 'pricing_tiers',
        value: {
          specialOffers: specialOffers || [],
          earlyBird,
          regular,
          onsite
        },
        isActive: true,
        createdBy: adminUser._id,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    )

    return NextResponse.json({
      success: true,
      message: 'Pricing tiers configuration updated successfully'
    })

  } catch (error) {
    console.error('Pricing tiers config update error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}