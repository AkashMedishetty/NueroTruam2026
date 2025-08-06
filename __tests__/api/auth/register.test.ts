/**
 * API Route Tests - User Registration
 */

// @ts-ignore - No types available for node-mocks-http
import { createMocks } from 'node-mocks-http'
import { POST } from '@/app/api/auth/register/route'
import bcrypt from 'bcryptjs'

// Mock dependencies
jest.mock('bcryptjs')
jest.mock('@/lib/mongodb')
jest.mock('@/lib/models/User')
jest.mock('@/lib/email/service')

const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>

describe('/api/auth/register', () => {
  const validUserData = {
    email: 'test@example.com',
    password: 'Password123',
    confirmPassword: 'Password123',
    profile: {
      title: 'Dr.',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      institution: 'Test Hospital'
    },
    registration: {
      type: 'regular'
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockBcrypt.hash.mockResolvedValue('hashed-password' as never)
  })

  it('should register a new user successfully', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: validUserData
    })

    // Mock successful database operations
    const mockUser = {
      _id: 'user-id',
      email: validUserData.email,
      registration: { registrationId: 'REG123' }
    }

    // Mock User model
    const MockUser = require('@/lib/models/User').default
    MockUser.findOne.mockResolvedValue(null) // No existing user
    MockUser.create.mockResolvedValue(mockUser)

    const response = await POST(req as any)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.success).toBe(true)
    expect(data.data.email).toBe(validUserData.email)
    expect(MockUser.create).toHaveBeenCalled()
  })

  it('should reject registration with missing required fields', async () => {
    const invalidData = {
      email: 'test@example.com'
      // Missing password and profile
    }

    const { req } = createMocks({
      method: 'POST',
      body: invalidData
    })

    const response = await POST(req as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toContain('Missing required fields')
  })

  it('should reject registration with invalid email format', async () => {
    const invalidData = {
      ...validUserData,
      email: 'invalid-email'
    }

    const { req } = createMocks({
      method: 'POST',
      body: invalidData
    })

    const response = await POST(req as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toBe('Invalid email format')
  })

  it('should reject registration with weak password', async () => {
    const invalidData = {
      ...validUserData,
      password: '123',
      confirmPassword: '123'
    }

    const { req } = createMocks({
      method: 'POST',
      body: invalidData
    })

    const response = await POST(req as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toBe('Password must be at least 6 characters long')
  })

  it('should reject registration with existing email', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: validUserData
    })

    // Mock existing user
    const MockUser = require('@/lib/models/User').default
    MockUser.findOne.mockResolvedValue({ email: validUserData.email })

    const response = await POST(req as any)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.success).toBe(false)
    expect(data.message).toBe('User with this email already exists')
  })

  it('should hash password before saving', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: validUserData
    })

    const MockUser = require('@/lib/models/User').default
    MockUser.findOne.mockResolvedValue(null)
    MockUser.create.mockResolvedValue({
      _id: 'user-id',
      email: validUserData.email,
      registration: { registrationId: 'REG123' }
    })

    await POST(req as any)

    expect(mockBcrypt.hash).toHaveBeenCalledWith(validUserData.password, 12)
    expect(MockUser.create).toHaveBeenCalledWith(
      expect.objectContaining({
        password: 'hashed-password'
      })
    )
  })

  it('should generate unique registration ID', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: validUserData
    })

    const MockUser = require('@/lib/models/User').default
    MockUser.findOne
      .mockResolvedValueOnce(null) // No existing user with email
      .mockResolvedValueOnce(null) // No existing registration ID

    MockUser.create.mockResolvedValue({
      _id: 'user-id',
      email: validUserData.email,
      registration: { registrationId: 'REG123' }
    })

    const response = await POST(req as any)
    const data = await response.json()

    expect(data.data.registrationId).toBeDefined()
    expect(typeof data.data.registrationId).toBe('string')
  })

  it('should send registration confirmation email', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: validUserData
    })

    const MockUser = require('@/lib/models/User').default
    MockUser.findOne.mockResolvedValue(null)
    MockUser.create.mockResolvedValue({
      _id: 'user-id',
      email: validUserData.email,
      registration: { registrationId: 'REG123' }
    })

    const { EmailService } = require('@/lib/email/service')
    EmailService.sendRegistrationConfirmation.mockResolvedValue({
      success: true
    })

    await POST(req as any)

    expect(EmailService.sendRegistrationConfirmation).toHaveBeenCalledWith({
      email: validUserData.email,
      name: `${validUserData.profile.firstName} ${validUserData.profile.lastName}`,
      registrationId: 'REG123',
      registrationType: validUserData.registration.type,
      workshopSelections: [],
      accompanyingPersons: 0
    })
  })

  it('should handle email sending failure gracefully', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: validUserData
    })

    const MockUser = require('@/lib/models/User').default
    MockUser.findOne.mockResolvedValue(null)
    MockUser.create.mockResolvedValue({
      _id: 'user-id',
      email: validUserData.email,
      registration: { registrationId: 'REG123' }
    })

    const { EmailService } = require('@/lib/email/service')
    EmailService.sendRegistrationConfirmation.mockRejectedValue(new Error('Email failed'))

    const response = await POST(req as any)
    const data = await response.json()

    // Registration should still succeed even if email fails
    expect(response.status).toBe(201)
    expect(data.success).toBe(true)
  })

  it('should handle database errors', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: validUserData
    })

    const MockUser = require('@/lib/models/User').default
    MockUser.findOne.mockRejectedValue(new Error('Database error'))

    const response = await POST(req as any)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.message).toBe('Internal server error')
  })

  it('should sanitize user input', async () => {
    const maliciousData = {
      ...validUserData,
      profile: {
        ...validUserData.profile,
        firstName: '<script>alert("xss")</script>John',
        lastName: 'Doe<img src=x onerror=alert(1)>',
        institution: 'Hospital & <script>attack</script>'
      }
    }

    const { req } = createMocks({
      method: 'POST',
      body: maliciousData
    })

    const MockUser = require('@/lib/models/User').default
    MockUser.findOne.mockResolvedValue(null)
    MockUser.create.mockResolvedValue({
      _id: 'user-id',
      email: validUserData.email,
      registration: { registrationId: 'REG123' }
    })

    await POST(req as any)

    const createCall = MockUser.create.mock.calls[0][0]
    expect(createCall.profile.firstName).not.toContain('<script>')
    expect(createCall.profile.lastName).not.toContain('<img')
    expect(createCall.profile.institution).not.toContain('<script>')
  })
})