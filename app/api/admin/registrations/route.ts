import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is admin
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

    // Get all user registrations
    const registrations = await User.find({ role: 'user' })
      .select('email profile registration adminRemarks isComplimentary isSponsored sponsorName createdAt')
      .sort({ 'registration.registrationDate': -1 })
      .lean()

    const formattedRegistrations = registrations.map(user => ({
      _id: String(user._id),
      registrationId: user.registration.registrationId,
      profile: user.profile,
      email: user.email,
      registration: user.registration,
      adminRemarks: user.adminRemarks || '',
      isComplimentary: user.isComplimentary || false,
      isSponsored: user.isSponsored || false,
      sponsorName: user.sponsorName || '',
      role: 'user',
      createdAt: user.createdAt
    }))

    return NextResponse.json({
      success: true,
      data: formattedRegistrations
    })

  } catch (error) {
    console.error('Error fetching registrations:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}