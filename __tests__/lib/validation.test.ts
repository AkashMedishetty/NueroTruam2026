import { 
  validateData, 
  userRegistrationSchema, 
  loginSchema, 
  paymentSchema,
  sanitizeInput 
} from '@/lib/validation/schemas'

describe('Validation Schemas', () => {
  describe('userRegistrationSchema', () => {
    const validUserData = {
      email: 'test@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
      profile: {
        title: 'Dr.',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        institution: 'Test Hospital',
        address: {
          city: 'Test City',
          state: 'Test State',
          country: 'Test Country'
        }
      },
      registration: {
        type: 'regular',
        membershipNumber: 'MEM123',
        workshopSelections: ['workshop1'],
        accompanyingPersons: []
      }
    }

    it('should validate correct user registration data', () => {
      const result = validateData(userRegistrationSchema, validUserData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const invalidData = { ...validUserData, email: 'invalid-email' }
      const result = validateData(userRegistrationSchema, invalidData)
      expect(result.success).toBe(false)
      expect(result.errors).toContain('Please enter a valid email address')
    })

    it('should reject weak password', () => {
      const invalidData = { 
        ...validUserData, 
        password: '123',
        confirmPassword: '123'
      }
      const result = validateData(userRegistrationSchema, invalidData)
      expect(result.success).toBe(false)
      expect(result.errors).toContain('Password must be at least 8 characters long')
    })

    it('should reject mismatched passwords', () => {
      const invalidData = { 
        ...validUserData, 
        confirmPassword: 'DifferentPassword123'
      }
      const result = validateData(userRegistrationSchema, invalidData)
      expect(result.success).toBe(false)
      expect(result.errors).toContain("Passwords don't match")
    })

    it('should reject invalid phone number', () => {
      const invalidData = {
        ...validUserData,
        profile: {
          ...validUserData.profile,
          phone: 'abc123'
        }
      }
      const result = validateData(userRegistrationSchema, invalidData)
      expect(result.success).toBe(false)
      expect(result.errors).toContain('Please enter a valid phone number')
    })

    it('should reject too many accompanying persons', () => {
      const invalidData = {
        ...validUserData,
        registration: {
          ...validUserData.registration,
          accompanyingPersons: Array(6).fill({
            name: 'Test Person',
            age: 30,
            relationship: 'Spouse'
          })
        }
      }
      const result = validateData(userRegistrationSchema, invalidData)
      expect(result.success).toBe(false)
      expect(result.errors).toContain('Cannot register more than 5 accompanying persons')
    })
  })

  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validLogin = {
        email: 'test@example.com',
        password: 'password123'
      }
      const result = validateData(loginSchema, validLogin)
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const invalidLogin = {
        email: 'invalid-email',
        password: 'password123'
      }
      const result = validateData(loginSchema, invalidLogin)
      expect(result.success).toBe(false)
      expect(result.errors).toContain('Please enter a valid email address')
    })

    it('should reject empty password', () => {
      const invalidLogin = {
        email: 'test@example.com',
        password: ''
      }
      const result = validateData(loginSchema, invalidLogin)
      expect(result.success).toBe(false)
      expect(result.errors).toContain('Password is required')
    })
  })

  describe('paymentSchema', () => {
    const validPayment = {
      registrationType: 'regular',
      workshopSelections: ['workshop1', 'workshop2'],
      accompanyingPersons: 2,
      discountCode: 'SAVE10',
      amount: 15000,
      currency: 'INR'
    }

    it('should validate correct payment data', () => {
      const result = validateData(paymentSchema, validPayment)
      expect(result.success).toBe(true)
    })

    it('should reject invalid registration type', () => {
      const invalidPayment = {
        ...validPayment,
        registrationType: 'invalid'
      }
      const result = validateData(paymentSchema, invalidPayment)
      expect(result.success).toBe(false)
    })

    it('should reject negative amount', () => {
      const invalidPayment = {
        ...validPayment,
        amount: -100
      }
      const result = validateData(paymentSchema, invalidPayment)
      expect(result.success).toBe(false)
      expect(result.errors).toContain('Amount must be positive')
    })

    it('should reject too many workshops', () => {
      const invalidPayment = {
        ...validPayment,
        workshopSelections: Array(15).fill('workshop')
      }
      const result = validateData(paymentSchema, invalidPayment)
      expect(result.success).toBe(false)
      expect(result.errors).toContain('Cannot select more than 10 workshops')
    })
  })

  describe('sanitizeInput', () => {
    it('should sanitize HTML content', () => {
      const dirty = '<script>alert("xss")</script>Hello World'
      const clean = sanitizeInput.html(dirty)
      expect(clean).not.toContain('<script>')
      expect(clean).not.toContain('alert')
      expect(clean).toContain('Hello World')
    })

    it('should sanitize email addresses', () => {
      const dirty = '  TEST@EXAMPLE.COM  '
      const clean = sanitizeInput.email(dirty)
      expect(clean).toBe('test@example.com')
    })

    it('should sanitize phone numbers', () => {
      const dirty = '+1 (234) 567-8900 ext 123'
      const clean = sanitizeInput.phone(dirty)
      expect(clean).toMatch(/^[\d+\s\-()]+$/)
    })

    it('should remove XSS attempts', () => {
      const dirty = 'javascript:alert("xss")'
      const clean = sanitizeInput.html(dirty)
      expect(clean).not.toContain('javascript:')
      expect(clean).not.toContain('alert')
    })
  })
})