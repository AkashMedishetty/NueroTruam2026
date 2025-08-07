// Email template configuration
export const emailTemplateConfig = {
  // Enable/disable specific email templates
  templates: {
    registration: {
      enabled: true,
      subject: "Welcome to NeuroTrauma 2026 - Registration Confirmed"
    },
    payment: {
      enabled: true,
      subject: "Payment Confirmation - NeuroTrauma 2026"
    },
    paymentReminder: {
      enabled: true,
      subject: "Payment Reminder - NeuroTrauma 2026"
    },
    customMessage: {
      enabled: true,
      subject: "Message from NeuroTrauma 2026 Team"
    },
    test: {
      enabled: true, 
      subject: "Test Email - NeuroTrauma 2026"
    },
    passwordReset: {
      enabled: true,
      subject: "Password Reset - NeuroTrauma 2026"
    },
    bulkEmail: {
      enabled: true,
      subject: "Important Update - NeuroTrauma 2026"
    }
  },

  // Global email settings
  settings: {
    fromName: "NeuroTrauma 2026 Conference",
    fromEmail: "hello@violetvoyage.in", // This should match your SMTP username
    replyTo: "info@neurotraumacon2026.com",
    enableTracking: true,
    enableAutoResponder: true
  }
}

export function isTemplateEnabled(templateType: string): boolean {
  return emailTemplateConfig.templates[templateType as keyof typeof emailTemplateConfig.templates]?.enabled || false
}

export function getTemplateSubject(templateType: string): string {
  return emailTemplateConfig.templates[templateType as keyof typeof emailTemplateConfig.templates]?.subject || "NeuroTrauma 2026"
}