import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Payment from '@/lib/models/Payment'
import User from '@/lib/models/User'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 })
    }

    await connectDB()

    // Get user data
    const user = await User.findById(session.user.id).lean()
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 })
    }

    // Get payment data with fresh query
    const payments = await Payment.find({ 
      userId: session.user.id 
    })
    .sort({ transactionDate: -1 })
    .lean()

    return NextResponse.json({
      success: true,
      data: {
        user: user,
        payments: payments
      }
    })

  } catch (error) {
    console.error('Error refreshing payment data:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}