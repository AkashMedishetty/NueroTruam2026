import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import Payment from '@/lib/models/Payment'

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

    // Get all statistics in parallel for better performance
    const [
      totalRegistrations,
      paidRegistrations,
      pendingRegistrations,
      payments,
      users
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'user', 'registration.status': 'paid' }),
      User.countDocuments({ role: 'user', 'registration.status': 'pending' }),
      Payment.find({ status: 'completed' }).lean(),
      User.find({ role: 'user' })
        .select('profile registration')
        .lean()
    ])

    // Calculate revenue
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount.total, 0)
    const currency = payments.length > 0 ? payments[0].amount.currency : 'INR'

    // Registration breakdown by type
    const registrationsByType = {
      regular: 0,
      student: 0,
      international: 0,
      faculty: 0
    }

    users.forEach(user => {
      if (registrationsByType.hasOwnProperty(user.registration.type)) {
        registrationsByType[user.registration.type as keyof typeof registrationsByType]++
      }
    })

    // Workshop statistics
    const workshopSelections: { [key: string]: number } = {}
    let totalWorkshopParticipants = 0

    users.forEach(user => {
      if (user.registration.workshopSelections && user.registration.workshopSelections.length > 0) {
        user.registration.workshopSelections.forEach((workshop: string) => {
          workshopSelections[workshop] = (workshopSelections[workshop] || 0) + 1
          totalWorkshopParticipants++
        })
      }
    })

    const popularWorkshops = Object.entries(workshopSelections)
      .map(([name, participants]) => ({ name, participants }))
      .sort((a, b) => b.participants - a.participants)
      .slice(0, 5)

    // Count accompanying persons
    const totalAccompanyingPersons = users.reduce((sum, user) => {
      return sum + (user.registration.accompanyingPersons?.length || 0)
    }, 0)

    // Recent registrations (last 10)
    const recentRegistrations = await User.find({ role: 'user' })
      .select('profile registration email')
      .sort({ 'registration.registrationDate': -1 })
      .limit(10)
      .lean()

    const recentRegistrationsFormatted = recentRegistrations.map(user => ({
      _id: String(user._id),
      registrationId: user.registration.registrationId,
      name: `${user.profile.title || ''} ${user.profile.firstName} ${user.profile.lastName}`.trim(),
      email: user.email,
      type: user.registration.type,
      status: user.registration.status,
      registrationDate: user.registration.registrationDate
    }))

    const dashboardStats = {
      totalRegistrations,
      paidRegistrations,
      pendingPayments: pendingRegistrations,
      totalRevenue,
      currency,
      registrationsByType,
      recentRegistrations: recentRegistrationsFormatted,
      workshopStats: {
        totalWorkshops: Object.keys(workshopSelections).length,
        totalParticipants: totalWorkshopParticipants,
        popularWorkshops
      },
      accompanyingPersons: totalAccompanyingPersons
    }

    return NextResponse.json({
      success: true,
      data: dashboardStats
    })

  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}