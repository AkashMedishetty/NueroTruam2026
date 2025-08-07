import { getConferenceConfig } from '@/lib/config'

// Base email template with conference branding
export function getBaseTemplate(content: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>NeuroTrauma 2026</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .container {
          background-color: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 3px solid #ff6b35;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          background: linear-gradient(45deg, #ff6b35, #e55a2b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 10px;
        }
        .subtitle {
          color: #666;
          font-size: 14px;
        }
        .content {
          margin: 20px 0;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background: linear-gradient(45deg, #ff6b35, #e55a2b);
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
          margin: 10px 0;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          text-align: center;
          color: #666;
          font-size: 12px;
        }
        .highlight {
          background-color: #fff3e0;
          padding: 15px;
          border-left: 4px solid #ff6b35;
          margin: 15px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }
        th, td {
          padding: 10px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        th {
          background-color: #f8f9fa;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">NEUROTRAUMA 2026</div>
          <div class="subtitle">Annual Conference of Neurotrauma Society of India</div>
          <div class="subtitle">August 7-9, 2026 | Hyderabad, Telangana</div>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>
            <strong>NeuroTrauma 2026</strong><br>
            The Park Hotel, Somajiguda<br>
            Hyderabad, Telangana, India<br>
            Email: info@neurotrauma2026.com | Phone: +91-9676541985
          </p>
          <p>
            This is an automated email. Please do not reply to this email address.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Registration confirmation email template
export function getRegistrationConfirmationTemplate(userData: {
  name: string
  registrationId: string
  registrationType: string
  email: string
  workshopSelections?: string[]
  accompanyingPersons?: number
}) {
  const content = `
    <h2>Registration Confirmation</h2>
    <p>Dear ${userData.name},</p>
    
    <p>Thank you for registering for <strong>NeuroTrauma 2026</strong>! We are excited to have you join us for this premier conference on neurotrauma care and research.</p>
    
    <div class="highlight">
      <h3>Your Registration Details:</h3>
      <table>
        <tr><th>Registration ID</th><td><strong>${userData.registrationId}</strong></td></tr>
        <tr><th>Registration Type</th><td>${userData.registrationType}</td></tr>
        <tr><th>Email</th><td>${userData.email}</td></tr>
        ${userData.workshopSelections && userData.workshopSelections.length > 0 ? 
          `<tr><th>Workshops</th><td>${userData.workshopSelections.join(', ')}</td></tr>` : ''}
        ${userData.accompanyingPersons && userData.accompanyingPersons > 0 ? 
          `<tr><th>Accompanying Persons</th><td>${userData.accompanyingPersons}</td></tr>` : ''}
      </table>
    </div>
    
    <p><strong>Next Steps:</strong></p>
    <ol>
      <li>Complete your payment to confirm your registration</li>
      <li>You will receive an invoice and payment confirmation once payment is processed</li>
      <li>Keep this email for your records</li>
    </ol>
    
    <p style="text-align: center;">
      <a href="${process.env.APP_URL}/dashboard" class="button">Access Your Dashboard</a>
    </p>
    
    <p>If you have any questions, please don't hesitate to contact us.</p>
    
    <p>Looking forward to seeing you at the conference!</p>
    
    <p>Best regards,<br>
    <strong>NeuroTrauma 2026 Organizing Committee</strong></p>
  `
  
  return getBaseTemplate(content)
}

// Payment confirmation and invoice email template
export function getPaymentConfirmationTemplate(paymentData: {
  name: string
  registrationId: string
  amount: number
  currency: string
  transactionId: string
  paymentDate: string
  breakdown: any
}) {
  const content = `
    <h2>Payment Confirmation & Invoice</h2>
    <p>Dear ${paymentData.name},</p>
    
    <p>Thank you for your payment! Your registration for <strong>NeuroTrauma 2026</strong> is now confirmed.</p>
    
    <div class="highlight">
      <h3>Payment Details:</h3>
      <table>
        <tr><th>Registration ID</th><td><strong>${paymentData.registrationId}</strong></td></tr>
        <tr><th>Transaction ID</th><td>${paymentData.transactionId}</td></tr>
        <tr><th>Amount Paid</th><td><strong>${paymentData.currency} ${paymentData.amount}</strong></td></tr>
        <tr><th>Payment Date</th><td>${paymentData.paymentDate}</td></tr>
        <tr><th>Status</th><td><span style="color: green; font-weight: bold;">PAID</span></td></tr>
      </table>
    </div>
    
    <div class="highlight">
      <h3>Payment Breakdown:</h3>
      <table>
        <tr><th>Registration Fee</th><td>${paymentData.currency} ${paymentData.breakdown.registration || 0}</td></tr>
        ${paymentData.breakdown.workshops > 0 ? 
          `<tr><th>Workshop Fees</th><td>${paymentData.currency} ${paymentData.breakdown.workshops}</td></tr>` : ''}
        ${paymentData.breakdown.accompanyingPersons > 0 ? 
          `<tr><th>Accompanying Person Fees</th><td>${paymentData.currency} ${paymentData.breakdown.accompanyingPersons}</td></tr>` : ''}
        ${paymentData.breakdown.discount > 0 ? 
          `<tr><th>Discount Applied</th><td style="color: green;">-${paymentData.currency} ${paymentData.breakdown.discount}</td></tr>` : ''}
        <tr style="border-top: 2px solid #ff6b35; font-weight: bold;">
          <th>Total Amount</th><td>${paymentData.currency} ${paymentData.amount}</td>
        </tr>
      </table>
    </div>
    
    <p><strong>What's Next:</strong></p>
    <ul>
      <li>Save this email as your payment receipt</li>
      <li>You will receive conference updates and program details closer to the event</li>
      <li>Access your dashboard for registration details and updates</li>
    </ul>
    
    <p style="text-align: center;">
      <a href="${process.env.APP_URL}/dashboard" class="button">View Your Dashboard</a>
    </p>
    
    <p>We look forward to welcoming you to NeuroTrauma 2026!</p>
    
    <p>Best regards,<br>
    <strong>NeuroTrauma 2026 Organizing Committee</strong></p>
  `
  
  return getBaseTemplate(content)
}

// Password reset email template
export function getPasswordResetTemplate(resetData: {
  name: string
  resetLink: string
  expiryTime: string
}) {
  const content = `
    <h2>Password Reset Request</h2>
    <p>Dear ${resetData.name},</p>
    
    <p>We received a request to reset your password for your NeuroTrauma 2026 account.</p>
    
    <div class="highlight">
      <p><strong>Important:</strong> This link will expire in ${resetData.expiryTime}.</p>
    </div>
    
    <p style="text-align: center;">
      <a href="${resetData.resetLink}" class="button">Reset Your Password</a>
    </p>
    
    <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
    
    <p>For security reasons, please do not share this link with anyone.</p>
    
    <p>If you're having trouble clicking the button, copy and paste the following link into your browser:</p>
    <p style="word-break: break-all; color: #666; font-size: 12px;">${resetData.resetLink}</p>
    
    <p>Best regards,<br>
    <strong>NeuroTrauma 2026 Support Team</strong></p>
  `
  
  return getBaseTemplate(content)
}

// Payment reminder email template
export function getPaymentReminderTemplate(userData: {
  name: string
  registrationId: string
  registrationType: string
  email: string
  daysOverdue?: number
  amount?: number
  currency?: string
}) {
  const content = `
    <h2>Payment Reminder</h2>
    <p>Dear ${userData.name},</p>
    
    <p>This is a friendly reminder regarding your registration payment for <strong>NeuroTrauma 2026</strong>.</p>
    
    <div class="highlight">
      <h3>Your Registration Details:</h3>
      <table>
        <tr><th>Registration ID</th><td><strong>${userData.registrationId}</strong></td></tr>
        <tr><th>Registration Type</th><td>${userData.registrationType}</td></tr>
        <tr><th>Email</th><td>${userData.email}</td></tr>
        ${userData.amount && userData.currency ? 
          `<tr><th>Amount Due</th><td><strong>${userData.currency} ${userData.amount}</strong></td></tr>` : ''}
        ${userData.daysOverdue ? 
          `<tr><th>Days Overdue</th><td><span style="color: #dc2626;">${userData.daysOverdue} days</span></td></tr>` : ''}
      </table>
    </div>
    
    <p><strong>Payment Options:</strong></p>
    <ul>
      <li>Online payment through our secure portal</li>
      <li>Bank transfer (details provided upon request)</li>
      <li>Payment at the conference venue</li>
    </ul>
    
    <p>Please complete your payment at your earliest convenience to secure your spot at the conference.</p>
    
    <p>If you have already made the payment, please ignore this reminder or contact us with your payment details.</p>
    
    <p><strong>Conference Details:</strong></p>
    <ul>
      <li><strong>Dates:</strong> August 7-9, 2026</li>
      <li><strong>Venue:</strong> The Park Hotel, Somajiguda, Hyderabad</li>
    </ul>
    
    <p>For any payment-related queries, please contact us at <a href="mailto:payments@neurotraumacon2026.com">payments@neurotraumacon2026.com</a></p>
    
    <p>Thank you for your understanding.</p>
    
    <p>Best regards,<br>
    <strong>NeuroTrauma 2026 Finance Team</strong></p>
  `
  
  return getBaseTemplate(content)
}

// Custom message template for admin communications
export function getCustomMessageTemplate(messageData: {
  subject: string
  content: string
  recipientName: string
  senderName?: string
}) {
  const content = `
    <h2>${messageData.subject}</h2>
    <p>Dear ${messageData.recipientName},</p>
    
    <div style="margin: 20px 0; line-height: 1.6;">
      ${messageData.content.replace(/\n/g, '<br>')}
    </div>
    
    <p>Best regards,<br>
    <strong>${messageData.senderName || 'NeuroTrauma 2026 Team'}</strong></p>
  `
  
  return getBaseTemplate(content)
}

// Bulk email template for admin communications
export function getBulkEmailTemplate(emailData: {
  subject: string
  content: string
  senderName?: string
}) {
  const content = `
    <h2>${emailData.subject}</h2>
    
    <div style="margin: 20px 0;">
      ${emailData.content}
    </div>
    
    <p>Best regards,<br>
    <strong>${emailData.senderName || 'NeuroTrauma 2026 Team'}</strong></p>
  `
  
  return getBaseTemplate(content)
}