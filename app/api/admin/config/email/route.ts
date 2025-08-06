import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import Configuration from '@/lib/models/Configuration'

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

    // Get email configuration
    const emailConfig = await Configuration.findOne({ 
      type: 'email', 
      key: 'settings' 
    })

    // Default email configuration
    const defaultEmailConfig = {
      fromName: process.env.APP_NAME || 'NeuroTrauma 2026',
      fromEmail: process.env.SMTP_USER || 'noreply@neurotrauma2026.com',
      replyTo: process.env.SMTP_USER || 'support@neurotrauma2026.com',
      templates: {
        registration: {
          enabled: true,
          subject: 'Registration Confirmation - NeuroTrauma 2026'
        },
        payment: {
          enabled: true,
          subject: 'Payment Confirmation & Invoice - NeuroTrauma 2026'
        },
        passwordReset: {
          enabled: true,
          subject: 'Password Reset - NeuroTrauma 2026'
        },
        bulkEmail: {
          enabled: true,
          subject: 'Conference Update - NeuroTrauma 2026'
        }
      },
      rateLimiting: {
        batchSize: 10,
        delayBetweenBatches: 1000
      }
    }

    const result = emailConfig?.value || defaultEmailConfig

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Email config fetch error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()

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

    // Update email configuration
    await Configuration.findOneAndUpdate(
      { type: 'email', key: 'settings' },
      {
        type: 'email',
        key: 'settings',
        value: body,
        isActive: true,
        createdBy: adminUser._id,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    )

    return NextResponse.json({
      success: true,
      message: 'Email configuration updated successfully'
    })

  } catch (error) {
    console.error('Email config update error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}