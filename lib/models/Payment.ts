import mongoose, { Document, Schema } from 'mongoose'

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId
  registrationId: string
  razorpayOrderId: string
  razorpayPaymentId?: string
  razorpaySignature?: string
  amount: {
    registration: number
    workshops: number
    accompanyingPersons: number
    discount: number
    total: number
    currency: string
  }
  breakdown: {
    registrationType: string
    baseAmount: number
    workshopFees: Array<{
      name: string
      amount: number
    }>
    accompanyingPersonFees: number
    discountsApplied: Array<{
      type: string
      code?: string
      percentage: number
      amount: number
    }>
  }
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  paymentMethod?: string
  transactionDate: Date
  invoiceGenerated: boolean
  invoicePath?: string
  createdAt: Date
  updatedAt: Date
}

const PaymentSchema = new Schema<IPayment>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  registrationId: {
    type: String,
    required: true
  },
  razorpayOrderId: {
    type: String,
    required: true,
    unique: true
  },
  razorpayPaymentId: String,
  razorpaySignature: String,
  amount: {
    registration: { type: Number, required: true },
    workshops: { type: Number, default: 0 },
    accompanyingPersons: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    currency: { type: String, required: true, default: 'INR' }
  },
  breakdown: {
    registrationType: { type: String, required: true },
    baseAmount: { type: Number, required: true },
    workshopFees: [{
      name: { type: String, required: true },
      amount: { type: Number, required: true }
    }],
    accompanyingPersonFees: { type: Number, default: 0 },
    discountsApplied: [{
      type: { type: String, required: true },
      code: String,
      percentage: { type: Number, required: true },
      amount: { type: Number, required: true }
    }]
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: String,
  transactionDate: {
    type: Date,
    default: Date.now
  },
  invoiceGenerated: {
    type: Boolean,
    default: false
  },
  invoicePath: String
}, {
  timestamps: true
})

// Create indexes for better performance
PaymentSchema.index({ userId: 1 })
PaymentSchema.index({ registrationId: 1 })
// razorpayOrderId index is automatically created due to unique: true
PaymentSchema.index({ status: 1 })
PaymentSchema.index({ transactionDate: -1 })

export default mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema)