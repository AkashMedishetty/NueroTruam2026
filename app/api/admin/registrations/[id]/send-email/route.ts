import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"

export async function POST(
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
    const { type, subject, message, templateData } = body

    const user = await User.findById(id)
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Registration not found" },
        { status: 404 }
      )
    }

    // Send email (skip for complementary and sponsored users)
    if (user.registration.paymentType === 'complementary' || user.registration.paymentType === 'sponsored') {
      return NextResponse.json({
        success: false,
        message: "Email sending is disabled for complementary and sponsored registrations"
      })
    }

    try {
      const { EmailService } = await import('@/lib/email/service')
      
      const userName = `${user.profile.firstName} ${user.profile.lastName}`
      
      // Handle different email types
      switch (type) {
        case 'paymentReminder':
          await EmailService.sendPaymentReminder({
            email: user.email,
            name: userName,
            registrationId: user.registration.registrationId,
            registrationType: user.registration.type,
            daysOverdue: templateData?.daysOverdue,
            amount: templateData?.amount,
            currency: templateData?.currency || 'INR'
          })
          break
          
        case 'customMessage':
          await EmailService.sendCustomMessage({
            email: user.email,
            recipientName: userName,
            subject: subject || 'Message from NeuroTrauma 2026 Team',
            content: message || '',
            senderName: templateData?.senderName || 'NeuroTrauma 2026 Team'
          })
          break
          
        case 'registrationConfirmation':
          await EmailService.sendRegistrationConfirmation({
            email: user.email,
            name: userName,
            registrationId: user.registration.registrationId,
            registrationType: user.registration.type,
            workshopSelections: user.registration.workshopSelections || [],
            accompanyingPersons: user.registration.accompanyingPersons || 0
          })
          break
          
        default:
          // Use bulk email service for general emails
          await EmailService.sendBulkEmail({
            recipients: [user.email],
            subject: subject || 'NeuroTrauma 2026 - Registration Update',
            content: message || 'Thank you for registering for NeuroTrauma 2026 Conference.',
            senderName: 'NeuroTrauma 2026 Team'
          })
          break
      }

      return NextResponse.json({
        success: true,
        message: "Email sent successfully"
      })

    } catch (emailError) {
      console.error('Email sending error:', emailError)
      return NextResponse.json(
        { success: false, message: "Failed to send email" },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error("Send email error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}