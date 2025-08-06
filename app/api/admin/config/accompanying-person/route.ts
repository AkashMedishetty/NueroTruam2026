import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Configuration from '@/lib/models/Configuration'
import User from '@/lib/models/User'

export async function GET() {
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

    const config = await Configuration.findOne({
      type: 'pricing',
      key: 'accompanying_person',
      isActive: true
    })

    return NextResponse.json({
      success: true,
      data: config?.value || {
        basePrice: 3000,
        currency: 'INR',
        tierPricing: {
          'independence-day-2025': 2500,
          'earlyBird': 3000,
          'regular': 3500,
          'onsite': 4000
        },
        description: 'Pricing for accompanying persons by tier'
      }
    })

  } catch (error) {
    console.error('Error fetching accompanying person config:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
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

    // Validate the structure
    if (!body.basePrice || !body.currency || !body.tierPricing) {
      return NextResponse.json({
        success: false,
        message: 'Invalid configuration structure'
      }, { status: 400 })
    }

    // Validate tier pricing structure
    const requiredTiers = ['independence-day-2025', 'earlyBird', 'regular', 'onsite']
    for (const tier of requiredTiers) {
      if (!body.tierPricing[tier]) {
        return NextResponse.json({
          success: false,
          message: `Missing pricing for tier: ${tier}`
        }, { status: 400 })
      }
    }

    const configData = {
      type: 'pricing',
      key: 'accompanying_person',
      value: {
        basePrice: parseInt(body.basePrice),
        currency: body.currency,
        tierPricing: Object.fromEntries(
          Object.entries(body.tierPricing).map(([tier, price]) => [
            tier,
            parseInt(price as string)
          ])
        ),
        description: body.description || 'Pricing for accompanying persons by tier'
      },
      isActive: true,
      updatedBy: adminUser._id,
      updatedAt: new Date()
    }

    await Configuration.findOneAndUpdate(
      { type: 'pricing', key: 'accompanying_person' },
      configData,
      { upsert: true, new: true }
    )

    return NextResponse.json({
      success: true,
      message: 'Accompanying person pricing updated successfully'
    })

  } catch (error) {
    console.error('Error updating accompanying person config:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}