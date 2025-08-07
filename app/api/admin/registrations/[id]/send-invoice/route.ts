import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"
import Payment from "@/lib/models/Payment"

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

        const user = await User.findById(id)
        if (!user) {
            return NextResponse.json(
                { success: false, message: "Registration not found" },
                { status: 404 }
            )
        }

        // Get payment information
        const payment = await Payment.findOne({
            userId: user._id
        }).sort({ createdAt: -1 })

        if (!payment) {
            return NextResponse.json(
                { success: false, message: "No payment found for this registration" },
                { status: 404 }
            )
        }

        // Send invoice email
        try {
            const { EmailService } = await import('@/lib/email/service')

            await EmailService.sendPaymentConfirmation({
                email: user.email,
                name: `${user.profile.firstName} ${user.profile.lastName}`,
                registrationId: user.registration.registrationId,
                amount: payment.amount.total,
                currency: payment.amount.currency,
                transactionId: payment.razorpayPaymentId,
                paymentDate: payment.transactionDate.toLocaleDateString('en-IN'),
                breakdown: {
                    registration: payment.amount.registration,
                    workshops: payment.amount.workshops,
                    accompanyingPersons: payment.amount.accompanyingPersons,
                    discount: payment.amount.discount
                }
            })

            return NextResponse.json({
                success: true,
                message: "Invoice sent successfully"
            })

        } catch (emailError) {
            console.error('Invoice sending error:', emailError)
            return NextResponse.json(
                { success: false, message: "Failed to send invoice" },
                { status: 500 }
            )
        }

    } catch (error) {
        console.error("Send invoice error:", error)
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        )
    }
}