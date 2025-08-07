import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import Payment from '@/lib/models/Payment'
import Configuration from '@/lib/models/Configuration'
import crypto from 'crypto'
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!
})

// Function to recalculate payment breakdown based on user data
async function recalculatePaymentBreakdown(user: any, totalAmount: number, currency: string) {
  try {
    // Fetch pricing configuration
    const pricingConfigs = await Configuration.find({
      type: 'pricing',
      isActive: true
    })

    const discountConfigs = await Configuration.find({
      type: 'discounts',
      isActive: true
    })

    // Build pricing data with defaults
    let registrationCategories: any = {
      regular: { amount: 15000, currency: 'INR', label: 'Regular Delegate' },
      student: { amount: 8000, currency: 'INR', label: 'Student/Resident' },
      international: { amount: 300, currency: 'USD', label: 'International Delegate' },
      faculty: { amount: 12000, currency: 'INR', label: 'Faculty Member' },
      accompanying: { amount: 3000, currency: 'INR', label: 'Accompanying Person' }
    }

    let workshops = [
      { id: 'brain-surgery', name: 'Advanced Brain Surgery Techniques', amount: 2000 },
      { id: 'spinal-injury', name: 'Spinal Cord Injury Management', amount: 2500 },
      { id: 'pediatric-neurotrauma', name: 'Pediatric Neurotrauma', amount: 2000 },
      { id: 'minimally-invasive', name: 'Minimally Invasive Neurosurgery', amount: 1500 },
      { id: 'neurotrauma-rehab', name: 'Neurotrauma Rehabilitation', amount: 1800 },
      { id: 'emergency-neurosurgery', name: 'Emergency Neurosurgery', amount: 2200 }
    ]

    // Override with configured values if available
    pricingConfigs.forEach(config => {
      if (config.key === 'registration_categories') {
        registrationCategories = { ...registrationCategories, ...config.value }
      } else if (config.key === 'workshops') {
        workshops = config.value
      }
    })

    // Calculate base registration fee
    const registrationType = user.registration.type || 'regular'
    const registrationCategory = registrationCategories[registrationType]
    const baseAmount = registrationCategory ? registrationCategory.amount : 15000

    // Calculate workshop fees
    let workshopFees: Array<{ name: string; amount: number }> = []
    let totalWorkshopFees = 0

    if (user.registration.workshopSelections && user.registration.workshopSelections.length > 0) {
      user.registration.workshopSelections.forEach((workshopName: string) => {
        const workshop = workshops.find(w => w.name === workshopName)
        if (workshop) {
          workshopFees.push({
            name: workshop.name,
            amount: workshop.amount
          })
          totalWorkshopFees += workshop.amount
        }
      })
    }

    // Calculate accompanying person fees
    const accompanyingPersonCount = user.registration.accompanyingPersons ? user.registration.accompanyingPersons.length : 0
    const accompanyingPersonFees = accompanyingPersonCount * (registrationCategories.accompanying.amount || 3000)

    // Calculate discounts
    let totalDiscount = 0
    const appliedDiscounts: Array<{
      type: string
      code?: string
      percentage: number
      amount: number
    }> = []

    // Apply time-based discounts
    const currentDate = new Date()
    discountConfigs.forEach(config => {
      if (config.key === 'active_discounts' && Array.isArray(config.value)) {
        config.value.forEach((discount: any) => {
          if (discount.type === 'time-based') {
            const startDate = discount.startDate ? new Date(discount.startDate) : null
            const endDate = discount.endDate ? new Date(discount.endDate) : null
            
            const isInDateRange = (!startDate || currentDate >= startDate) && 
                                 (!endDate || currentDate <= endDate)
            
            const isApplicableCategory = discount.applicableCategories.includes('all') || 
                                       discount.applicableCategories.includes(registrationType)
            
            if (isInDateRange && isApplicableCategory) {
              const subtotal = baseAmount + totalWorkshopFees + accompanyingPersonFees
              const discountAmount = Math.floor(subtotal * discount.percentage / 100)
              totalDiscount += discountAmount
              appliedDiscounts.push({
                type: discount.id,
                percentage: discount.percentage,
                amount: discountAmount
              })
            }
          }
        })
      }
    })

    return {
      amount: {
        total: totalAmount,
        currency: currency,
        registration: baseAmount,
        workshops: totalWorkshopFees,
        accompanyingPersons: accompanyingPersonFees,
        discount: totalDiscount
      },
      breakdown: {
        registrationType: registrationType,
        baseAmount: baseAmount,
        workshopFees: workshopFees,
        accompanyingPersonFees: accompanyingPersonFees,
        discountsApplied: appliedDiscounts
      }
    }
  } catch (error) {
    console.error('Error recalculating payment breakdown:', error)
    // Return basic breakdown if calculation fails
    return {
      amount: {
        total: totalAmount,
        currency: currency,
        registration: totalAmount,
        workshops: 0,
        accompanyingPersons: 0,
        discount: 0
      },
      breakdown: {
        registrationType: user.registration.type || 'regular',
        baseAmount: totalAmount,
        workshopFees: [],
        accompanyingPersonFees: 0,
        discountsApplied: []
      }
    }
  }
}

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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({
        success: false,
        message: 'Missing payment details'
      }, { status: 400 })
    }

    await connectDB()

    // Verify signature
    const body_string = razorpay_order_id + '|' + razorpay_payment_id
    const expected_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body_string)
      .digest('hex')

    if (expected_signature !== razorpay_signature) {
      return NextResponse.json({
        success: false,
        message: 'Invalid payment signature'
      }, { status: 400 })
    }

    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id)
    const order = await razorpay.orders.fetch(razorpay_order_id)

    if (payment.status !== 'captured' && payment.status !== 'authorized') {
      return NextResponse.json({
        success: false,
        message: 'Payment not successful'
      }, { status: 400 })
    }

    const user = await User.findById(session.user.id)
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 })
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ razorpayPaymentId: razorpay_payment_id })
    if (existingPayment) {
      return NextResponse.json({
        success: false,
        message: 'Payment already processed'
      }, { status: 400 })
    }

    // Calculate payment breakdown (re-calculate to ensure accuracy)
    const amount = payment.amount / 100 // Convert from smallest unit
    const currency = payment.currency.toUpperCase()

    // Recalculate the proper breakdown based on user's registration data
    const calculationData = await recalculatePaymentBreakdown(user, amount, currency)

    // Create payment record
    const paymentRecord = new Payment({
      userId: user._id,
      registrationId: user.registration.registrationId,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      amount: calculationData.amount,
      breakdown: calculationData.breakdown,
      status: 'completed',
      paymentMethod: payment.method,
      transactionDate: new Date(payment.created_at * 1000),
      invoiceGenerated: true
    })

    await paymentRecord.save()

    // Update workshop seats - confirm the bookings
    if (user.registration.workshopSelections && user.registration.workshopSelections.length > 0) {
      const Workshop = (await import('@/lib/models/Workshop')).default
      
      for (const workshopId of user.registration.workshopSelections) {
        const workshop = await Workshop.findOne({ id: workshopId })
        if (workshop && workshop.bookedSeats < workshop.maxSeats) {
          await Workshop.findByIdAndUpdate(
            workshop._id,
            { $inc: { bookedSeats: 1 } }
          )
        }
      }
    }

    // Update user registration status
    user.registration.status = 'paid'
    user.registration.paymentDate = new Date()
    await user.save()

    // Send payment confirmation email (skip for complementary and sponsored users)
    if (user.registration.paymentType !== 'complementary' && user.registration.paymentType !== 'sponsored') {
      try {
        const { EmailService } = await import('@/lib/email/service')
        await EmailService.sendPaymentConfirmation({
          email: user.email,
          name: `${user.profile.firstName} ${user.profile.lastName}`,
          registrationId: user.registration.registrationId,
          amount: calculationData.amount.total,
          currency: calculationData.amount.currency,
          transactionId: razorpay_payment_id,
          paymentDate: new Date().toLocaleDateString('en-IN'),
          breakdown: {
            registration: calculationData.amount.registration,
            workshops: calculationData.amount.workshops,
            accompanyingPersons: calculationData.amount.accompanyingPersons,
            discount: calculationData.amount.discount
          }
        })
        console.log('Payment confirmation email sent successfully to:', user.email)
      } catch (emailError) {
        console.error('Failed to send payment confirmation email:', emailError)
        // Don't fail the payment verification if email fails
      }
    } else {
      console.log('Skipping email for complementary/sponsored user:', user.email)
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        paymentId: paymentRecord._id,
        registrationId: user.registration.registrationId,
        amount: amount,
        currency: currency,
        status: 'completed'
      }
    })

  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json({
      success: false,
      message: 'Payment verification failed'
    }, { status: 500 })
  }
}