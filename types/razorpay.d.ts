// Razorpay TypeScript definitions
declare module 'razorpay' {
  interface RazorpayOptions {
    key_id: string
    key_secret: string
  }

  interface OrderOptions {
    amount: number
    currency: string
    receipt?: string
    notes?: Record<string, string>
    partial_payment?: boolean
  }

  interface Order {
    id: string
    entity: string
    amount: number
    amount_paid: number
    amount_due: number
    currency: string
    receipt: string | null
    offer_id: string | null
    status: string
    attempts: number
    notes: Record<string, string>
    created_at: number
  }

  interface PaymentVerificationOptions {
    razorpay_order_id: string
    razorpay_payment_id: string
    razorpay_signature: string
  }

  interface Payment {
    id: string
    entity: string
    amount: number
    currency: string
    status: string
    order_id: string
    invoice_id: string | null
    international: boolean
    method: string
    amount_refunded: number
    refund_status: string | null
    captured: boolean
    description: string
    card_id: string | null
    bank: string | null
    wallet: string | null
    vpa: string | null
    email: string
    contact: string
    notes: Record<string, string>
    fee: number
    tax: number
    error_code: string | null
    error_description: string | null
    error_source: string | null
    error_step: string | null
    error_reason: string | null
    acquirer_data: Record<string, any>
    created_at: number
  }

  class Razorpay {
    constructor(options: RazorpayOptions)
    
    orders: {
      create(options: OrderOptions): Promise<Order>
      fetch(orderId: string): Promise<Order>
      fetchPayments(orderId: string): Promise<{ items: Payment[] }>
    }
    
    payments: {
      fetch(paymentId: string): Promise<Payment>
      capture(paymentId: string, amount: number, currency?: string): Promise<Payment>
      refund(paymentId: string, options?: { amount?: number; notes?: Record<string, string> }): Promise<any>
    }
    
    utils: {
      verifyPaymentSignature(options: PaymentVerificationOptions): boolean
    }
  }

  export = Razorpay
}

// Global Razorpay for client-side
declare global {
  interface Window {
    Razorpay: any
  }
}