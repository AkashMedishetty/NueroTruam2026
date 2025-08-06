import connectDB from '../mongodb'
import User from '../models/User'

/**
 * Generate a unique registration ID
 * Format: NTSI-001, NTSI-002, etc.
 */
export async function generateRegistrationId(): Promise<string> {
  const prefix = 'NTSI'
  
  try {
    await connectDB()
    
    // Find the highest existing registration number
    const lastUser = await User.findOne(
      { 
        role: 'user',
        'registration.registrationId': { $regex: `^${prefix}-\\d{3}$` }
      },
      {},
      { sort: { 'registration.registrationId': -1 } }
    )
    
    let nextNumber = 1
    
    if (lastUser && lastUser.registration.registrationId) {
      // Extract the number from the last registration ID
      const lastIdMatch = lastUser.registration.registrationId.match(/(\d{3})$/)
      if (lastIdMatch) {
        nextNumber = parseInt(lastIdMatch[1]) + 1
      }
    }
    
    // Format with leading zeros (3 digits)
    const formattedNumber = nextNumber.toString().padStart(3, '0')
    
    return `${prefix}-${formattedNumber}`
  } catch (error) {
    console.error('Error generating registration ID:', error)
    // Fallback to timestamp-based ID if database query fails
    const timestamp = Date.now().toString().slice(-3)
    return `${prefix}-${timestamp.padStart(3, '0')}`
  }
}

/**
 * Generate a simple registration ID synchronously (fallback)
 * Format: NTSI-XXX (where XXX is random 3-digit number)
 */
export function generateSimpleRegistrationId(): string {
  const prefix = 'NTSI'
  const number = Math.floor(Math.random() * 900) + 100 // 100-999
  
  return `${prefix}-${number.toString().padStart(3, '0')}`
}

/**
 * Generate a unique order ID for Razorpay
 * Format: ORDER_XXXXXXXXXX
 */
export function generateOrderId(): string {
  const prefix = 'ORDER'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  
  return `${prefix}_${timestamp}${random}`
}