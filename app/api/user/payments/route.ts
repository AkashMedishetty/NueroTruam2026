import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Payment from '@/lib/models/Payment'

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

    const payments = await Payment.find({
      userId: session.user.id
    }).sort({ createdAt: -1 })

    return NextResponse.json({
      success: true,
      payments: payments.map(payment => ({
        _id: String(payment._id),
        amount: payment.amount,
        status: payment.status,
        razorpayOrderId: payment.razorpayOrderId,
        razorpayPaymentId: payment.razorpayPaymentId,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
        workshopSelections: payment.workshopSelections,
        discountApplied: payment.discountApplied
      }))
    })

  } catch (error) {
    console.error('Error fetching user payments:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}