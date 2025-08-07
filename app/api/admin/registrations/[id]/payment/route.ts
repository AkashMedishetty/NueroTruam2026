import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import  connectDB  from "@/lib/mongodb"
import User from "@/lib/models/User"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    await connectDB()

    const { id } = params
    const body = await request.json()
    const { 
      status, 
      paymentType, 
      sponsorName, 
      sponsorCategory, 
      paymentRemarks, 
      amount 
    } = body

    const updateData: any = {
      'registration.status': status,
      'registration.paymentType': paymentType,
      'registration.paymentRemarks': paymentRemarks
    }

    if (status === 'paid') {
      updateData['registration.paymentDate'] = new Date().toISOString()
    }

    if (paymentType === 'sponsored') {
      updateData['registration.sponsorName'] = sponsorName
      updateData['registration.sponsorCategory'] = sponsorCategory
      // Set amount to zero for sponsored registrations
      updateData['paymentInfo'] = {
        amount: 0,
        currency: 'INR',
        transactionId: `ADMIN-SPONSORED-${Date.now()}`,
        status: 'paid'
      }
    } else if (paymentType === 'complementary') {
      // Set amount to zero for complementary registrations
      updateData['paymentInfo'] = {
        amount: 0,
        currency: 'INR',
        transactionId: `ADMIN-COMPLEMENTARY-${Date.now()}`,
        status: 'paid'
      }
    } else if (amount > 0) {
      updateData['paymentInfo'] = {
        amount,
        currency: 'INR',
        transactionId: `ADMIN-${Date.now()}`,
        status: 'paid'
      }
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    )

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Registration not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Payment status updated successfully",
      data: user
    })

  } catch (error) {
    console.error("Update payment error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}