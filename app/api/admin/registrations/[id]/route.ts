import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import Payment from '@/lib/models/Payment'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { adminRemarks, isComplimentary, isSponsored, sponsorName, status } = body

    const updateData: any = {
      adminRemarks,
      isComplimentary: !!isComplimentary,
      isSponsored: !!isSponsored,
      sponsorName: isSponsored ? sponsorName : '',
    }

    // If marking as complimentary or sponsored, update registration status and type
    if (isComplimentary || isSponsored) {
      updateData['registration.status'] = 'confirmed'
      updateData['registration.type'] = isComplimentary ? 'complimentary' : 'sponsored'
      updateData['registration.paymentStatus'] = isComplimentary ? 'complimentary' : 'sponsored'
    }

    const updatedUser = await User.findByIdAndUpdate(
      params.id,
      { $set: updateData },
      { new: true }
    )

    if (!updatedUser) {
      return NextResponse.json({
        success: false,
        message: 'Registration not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Registration updated successfully',
      data: updatedUser
    })

  } catch (error) {
    console.error('Error updating registration:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Find the user to get their registration ID
    const userToDelete = await User.findById(params.id)
    if (!userToDelete) {
      return NextResponse.json({
        success: false,
        message: 'Registration not found'
      }, { status: 404 })
    }

    // Delete associated payments
    await Payment.deleteMany({ userId: params.id })

    // Delete the user registration
    await User.findByIdAndDelete(params.id)

    return NextResponse.json({
      success: true,
      message: 'Registration deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting registration:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}