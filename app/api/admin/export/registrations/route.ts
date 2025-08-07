import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
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

    // Fetch all user registrations
    const users = await User.find({ role: 'user' })
      .select('email profile registration createdAt')
      .lean()

    // Generate CSV content
    const csvHeaders = [
      'Registration ID',
      'Name',
      'Email',
      'Phone',
      'Institution',
      'Registration Type',
      'Status',
      'Payment Type',
      'Sponsor Name',
      'Sponsor Category',
      'Payment Remarks',
      'Workshop Selections',
      'Accompanying Persons',
      'Registration Date',
      'Payment Date',
      'Address',
      'Dietary Requirements',
      'Special Needs'
    ]

    const csvRows = users.map(user => [
      user.registration.registrationId,
      `${user.profile.title || ''} ${user.profile.firstName} ${user.profile.lastName}`.trim(),
      user.email,
      user.profile.phone || '',
      user.profile.institution || '',
      user.registration.type,
      user.registration.status,
      user.registration.paymentType || 'regular',
      user.registration.sponsorName || '',
      user.registration.sponsorCategory || '',
      user.registration.paymentRemarks || '',
      user.registration.workshopSelections?.join('; ') || '',
      user.registration.accompanyingPersons?.length || 0,
      new Date(user.registration.registrationDate).toLocaleDateString(),
      user.registration.paymentDate ? new Date(user.registration.paymentDate).toLocaleDateString() : '',
      user.profile.address ? 
        `${user.profile.address.street || ''}, ${user.profile.address.city || ''}, ${user.profile.address.state || ''}, ${user.profile.address.country || ''}`.replace(/^,+|,+$/g, '') : '',
      user.profile.dietaryRequirements || '',
      user.profile.specialNeeds || ''
    ])

    // Create CSV content
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => 
        row.map(field => 
          typeof field === 'string' && (field.includes(',') || field.includes('"') || field.includes('\n'))
            ? `"${field.replace(/"/g, '""')}"` // Escape quotes and wrap in quotes
            : field
        ).join(',')
      )
    ].join('\n')

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="registrations-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })

  } catch (error) {
    console.error('Registration export error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}