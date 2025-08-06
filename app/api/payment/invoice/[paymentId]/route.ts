import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Payment from '@/lib/models/Payment'
import User from '@/lib/models/User'

export async function GET(
  request: NextRequest,
  { params }: { params: { paymentId: string } }
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

    // Get payment details
    const payment = await Payment.findById(params.paymentId)
    if (!payment) {
      return NextResponse.json({
        success: false,
        message: 'Payment not found'
      }, { status: 404 })
    }

    // Get user details
    const user = await User.findById(payment.userId)
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 })
    }

    // Check if user owns this payment or is admin
    if (payment.userId.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({
        success: false,
        message: 'Access denied'
      }, { status: 403 })
    }

    // Generate HTML invoice that can be printed as PDF
    const invoiceHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Invoice - ${payment.registrationId}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                line-height: 1.6;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #333;
                padding-bottom: 20px;
            }
            .header h1 {
                color: #333;
                margin: 0;
                font-size: 24px;
            }
            .header p {
                margin: 5px 0;
                color: #666;
            }
            .invoice-details {
                display: flex;
                justify-content: space-between;
                margin: 20px 0;
            }
            .invoice-details div {
                flex: 1;
            }
            .bill-to {
                margin: 20px 0;
            }
            .bill-to h3 {
                margin-bottom: 10px;
                color: #333;
            }
            .payment-table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
            }
            .payment-table th,
            .payment-table td {
                border: 1px solid #ddd;
                padding: 12px;
                text-align: left;
            }
            .payment-table th {
                background-color: #f5f5f5;
                font-weight: bold;
            }
            .payment-table .amount {
                text-align: right;
            }
            .total-row {
                background-color: #f9f9f9;
                font-weight: bold;
            }
            .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                color: #666;
                font-size: 14px;
            }
            .status {
                display: inline-block;
                padding: 4px 12px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
                color: white;
                background-color: #22c55e;
            }
            @media print {
                body { margin: 0; }
                .no-print { display: none; }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>NeuroTrauma 2026 Conference</h1>
            <p>Annual Conference of the Neurotrauma Society of India</p>
            <p>August 7-9, 2026 | Hyderabad, Telangana</p>
            <h2 style="margin-top: 20px; color: #333;">INVOICE</h2>
        </div>

        <div class="invoice-details">
            <div>
                <strong>Invoice Number:</strong> ${payment.registrationId}<br>
                <strong>Invoice Date:</strong> ${new Date(payment.transactionDate).toLocaleDateString()}<br>
                <strong>Status:</strong> <span class="status">Completed</span>
            </div>
            <div style="text-align: right;">
                <strong>Payment ID:</strong> ${payment.razorpayPaymentId || 'N/A'}<br>
                <strong>Order ID:</strong> ${payment.razorpayOrderId}<br>
                <strong>Transaction ID:</strong> ${payment.razorpayPaymentId || 'N/A'}
            </div>
        </div>

        <div class="bill-to">
            <h3>Bill To:</h3>
            <p>
                <strong>${user.profile.title || ''} ${user.profile.firstName} ${user.profile.lastName}</strong><br>
                ${user.email}<br>
                ${user.profile.phone}<br>
                ${user.profile.institution}<br>
                ${user.profile.address ? `${user.profile.address.street}, ${user.profile.address.city}, ${user.profile.address.state} - ${user.profile.address.pincode}` : ''}
            </p>
        </div>

        <table class="payment-table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Registration Type</th>
                    <th class="amount">Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Registration Fee</td>
                    <td>${payment.breakdown?.registrationType?.replace('-', ' ').toUpperCase() || 'N/A'}</td>
                    <td class="amount">${payment.amount.currency} ${payment.amount.registration.toLocaleString()}</td>
                </tr>
                ${payment.amount.workshops > 0 ? `
                <tr>
                    <td>Workshop Fees</td>
                    <td>Additional Workshops</td>
                    <td class="amount">${payment.amount.currency} ${payment.amount.workshops.toLocaleString()}</td>
                </tr>
                ` : ''}
                ${payment.amount.accompanyingPersons > 0 ? `
                <tr>
                    <td>Accompanying Persons</td>
                    <td>Additional Persons</td>
                    <td class="amount">${payment.amount.currency} ${payment.amount.accompanyingPersons.toLocaleString()}</td>
                </tr>
                ` : ''}
                ${payment.amount.discount > 0 ? `
                <tr>
                    <td>Discount Applied</td>
                    <td>Early Bird / Special Discount</td>
                    <td class="amount">-${payment.amount.currency} ${payment.amount.discount.toLocaleString()}</td>
                </tr>
                ` : ''}
                <tr class="total-row">
                    <td colspan="2"><strong>Total Amount Paid</strong></td>
                    <td class="amount"><strong>${payment.amount.currency} ${payment.amount.total.toLocaleString()}</strong></td>
                </tr>
            </tbody>
        </table>

        <div class="footer">
            <p><strong>Thank you for your registration!</strong></p>
            <p>For any queries, please contact us at hello@violetvoyage.in</p>
            <p>This is a computer-generated invoice and does not require a signature.</p>
        </div>

        <div class="no-print" style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Print Invoice</button>
            <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">Close</button>
        </div>
    </body>
    </html>
    `

    return new NextResponse(invoiceHtml, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="NeuroTrauma2026-Invoice-${payment.registrationId}.html"`,
      },
    })

  } catch (error) {
    console.error('Error generating invoice:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}