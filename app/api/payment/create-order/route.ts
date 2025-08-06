import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 })
    }

    const body = await request.json()
    const { amount, currency, discountCode } = body

    if (!amount || amount <= 0) {
      return NextResponse.json({
        success: false,
        message: 'Invalid amount'
      }, { status: 400 })
    }

    await connectDB()

    const user = await User.findById(session.user.id)
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 })
    }

    // Convert amount to smallest currency unit (paise for INR, cents for USD)
    const amountInSmallestUnit = currency === 'USD' ? Math.round(amount * 100) : Math.round(amount * 100)

    // Create Razorpay order
    const orderOptions = {
      amount: amountInSmallestUnit,
      currency: currency,
      receipt: `receipt_${user.registration.registrationId}_${Date.now()}`,
      notes: {
        registrationId: user.registration.registrationId,
        userId: user._id.toString(),
        discountCode: discountCode || '',
        registrationType: user.registration.type
      }
    }

    const order = await razorpay.orders.create(orderOptions)

    return NextResponse.json({
      success: true,
      data: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      }
    })

  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json({
      success: false,
      message: 'Failed to create payment order'
    }, { status: 500 })
  }
}