import { sendEmail, sendBulkEmails } from './smtp'
import { 
  getRegistrationConfirmationTemplate, 
  getPaymentConfirmationTemplate, 
  getPasswordResetTemplate,
  getBulkEmailTemplate,
  getPaymentReminderTemplate,
  getCustomMessageTemplate
} from './templates'
import { getEmailConfig } from '@/lib/config'

export class EmailService {
  /**
   * Send registration confirmation email
   */
  static async sendRegistrationConfirmation(userData: {
    email: string
    name: string
    registrationId: string
    registrationType: string
    workshopSelections?: string[]
    accompanyingPersons?: number
  }) {
    try {
      const emailConfig = await getEmailConfig()
      const template = emailConfig?.templates?.registration
      
      if (!template?.enabled) {
        console.log('Registration email template is disabled')
        return { success: false, message: 'Email template disabled' }
      }

      const html = getRegistrationConfirmationTemplate(userData)
      
      return await sendEmail({
        to: userData.email,
        subject: template.subject || 'Registration Confirmation - NeuroTrauma 2026',
        html,
        text: `Registration confirmation for ${userData.name}. Registration ID: ${userData.registrationId}`
      })
    } catch (error) {
      console.error('Error sending registration confirmation:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  /**
   * Send payment confirmation and invoice email
   */
  static async sendPaymentConfirmation(paymentData: {
    email: string
    name: string
    registrationId: string
    amount: number
    currency: string
    transactionId: string
    paymentDate: string
    breakdown: any
  }) {
    try {
      const emailConfig = await getEmailConfig()
      const template = emailConfig?.templates?.payment
      
      if (!template?.enabled) {
        console.log('Payment email template is disabled')
        return { success: false, message: 'Email template disabled' }
      }

      const html = getPaymentConfirmationTemplate(paymentData)
      
      return await sendEmail({
        to: paymentData.email,
        subject: template.subject || 'Payment Confirmation & Invoice - NeuroTrauma 2026',
        html,
        text: `Payment confirmation for ${paymentData.name}. Amount: ${paymentData.currency} ${paymentData.amount}`
      })
    } catch (error) {
      console.error('Error sending payment confirmation:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  /**
   * Send password reset email
   */
  static async sendPasswordReset(resetData: {
    email: string
    name: string
    resetLink: string
    expiryTime: string
  }) {
    try {
      const emailConfig = await getEmailConfig()
      const template = emailConfig?.templates?.passwordReset
      
      if (!template?.enabled) {
        console.log('Password reset email template is disabled')
        return { success: false, message: 'Email template disabled' }
      }

      const html = getPasswordResetTemplate(resetData)
      
      return await sendEmail({
        to: resetData.email,
        subject: template.subject || 'Password Reset - NeuroTrauma 2026',
        html,
        text: `Password reset request for ${resetData.name}. Reset link: ${resetData.resetLink}`
      })
    } catch (error) {
      console.error('Error sending password reset email:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  /**
   * Send bulk email to multiple recipients
   */
  static async sendBulkEmail(emailData: {
    recipients: string[]
    subject: string
    content: string
    senderName?: string
  }) {
    try {
      const emailConfig = await getEmailConfig()
      const template = emailConfig?.templates?.bulkEmail
      
      if (!template?.enabled) {
        console.log('Bulk email template is disabled')
        return { success: false, message: 'Email template disabled' }
      }

      const html = getBulkEmailTemplate(emailData)
      const rateLimiting = emailConfig?.rateLimiting || {}
      
      return await sendBulkEmails({
        recipients: emailData.recipients,
        subject: emailData.subject,
        html,
        text: emailData.content,
        batchSize: rateLimiting.batchSize || 10,
        delay: rateLimiting.delayBetweenBatches || 1000
      })
    } catch (error) {
      console.error('Error sending bulk email:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  /**
   * Send payment reminder email
   */
  static async sendPaymentReminder(userData: {
    email: string
    name: string
    registrationId: string
    registrationType: string
    daysOverdue?: number
    amount?: number
    currency?: string
  }) {
    try {
      const emailConfig = await getEmailConfig()
      const template = emailConfig?.templates?.paymentReminder
      
      if (!template?.enabled) {
        console.log('Payment reminder email template is disabled')
        return { success: false, message: 'Email template disabled' }
      }

      const html = getPaymentReminderTemplate(userData)
      
      return await sendEmail({
        to: userData.email,
        subject: template.subject || 'Payment Reminder - NeuroTrauma 2026',
        html,
        text: `Payment reminder for ${userData.name}. Registration ID: ${userData.registrationId}`
      })
    } catch (error) {
      console.error('Error sending payment reminder:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  /**
   * Send custom message email
   */
  static async sendCustomMessage(messageData: {
    email: string
    recipientName: string
    subject: string
    content: string
    senderName?: string
  }) {
    try {
      const emailConfig = await getEmailConfig()
      const template = emailConfig?.templates?.customMessage
      
      if (!template?.enabled) {
        console.log('Custom message email template is disabled')
        return { success: false, message: 'Email template disabled' }
      }

      const html = getCustomMessageTemplate(messageData)
      
      return await sendEmail({
        to: messageData.email,
        subject: messageData.subject,
        html,
        text: messageData.content
      })
    } catch (error) {
      console.error('Error sending custom message:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  /**
   * Send conference reminder email
   */
  static async sendConferenceReminder(userData: {
    email: string
    name: string
    registrationId: string
    daysUntilConference: number
  }) {
    try {
      const emailConfig = await getEmailConfig()
      const template = emailConfig?.templates?.reminder
      
      if (!template?.enabled) {
        console.log('Reminder email template is disabled')
        return { success: false, message: 'Email template disabled' }
      }

      const content = `
        <h2>Conference Reminder</h2>
        <p>Dear ${userData.name},</p>
        
        <p>This is a friendly reminder that <strong>NeuroTrauma 2026</strong> is just ${userData.daysUntilConference} days away!</p>
        
        <div class="highlight">
          <h3>Your Registration Details:</h3>
          <p><strong>Registration ID:</strong> ${userData.registrationId}</p>
          <p><strong>Conference Dates:</strong> August 7-9, 2026</p>
          <p><strong>Venue:</strong> The Park Hotel, Somajiguda, Hyderabad</p>
        </div>
        
        <p><strong>What to expect:</strong></p>
        <ul>
          <li>Cutting-edge presentations on neurotrauma care</li>
          <li>Hands-on workshops and training sessions</li>
          <li>Networking opportunities with leading experts</li>
          <li>Latest research and clinical innovations</li>
        </ul>
        
        <p style="text-align: center;">
          <a href="${process.env.APP_URL}/dashboard" class="button">View Conference Details</a>
        </p>
        
        <p>We look forward to seeing you at the conference!</p>
        
        <p>Best regards,<br>
        <strong>NeuroTrauma 2026 Organizing Committee</strong></p>
      `

      const html = getBulkEmailTemplate({
        subject: 'Conference Reminder',
        content,
        senderName: 'NeuroTrauma 2026 Team'
      })
      
      return await sendEmail({
        to: userData.email,
        subject: template.subject || 'Conference Reminder - NeuroTrauma 2026',
        html,
        text: `Conference reminder for ${userData.name}. ${userData.daysUntilConference} days until NeuroTrauma 2026!`
      })
    } catch (error) {
      console.error('Error sending conference reminder:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}