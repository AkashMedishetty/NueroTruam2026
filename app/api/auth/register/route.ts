import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'
import { generateRegistrationId } from '@/lib/utils/generateId'
import { EmailService } from '@/lib/email/service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email,
      password,
      profile,
      registration
    } = body

    // Validate required fields
    if (!email || !password || !profile?.firstName || !profile?.lastName) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields'
      }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid email format'
      }, { status: 400 })
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json({
        success: false,
        message: 'Password must be at least 8 characters long'
      }, { status: 400 })
    }

    await connectDB()
    console.log('Database connected successfully')

    // Check if user already exists
    const existingUser = await User.findOne({ 
      email: email.toLowerCase() 
    })

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'User with this email already exists'
      }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate unique registration ID
    let registrationId = await generateRegistrationId()
    let isUnique = false
    let attempts = 0

    while (!isUnique && attempts < 10) {
      const existingReg = await User.findOne({ 
        'registration.registrationId': registrationId 
      })
      if (!existingReg) {
        isUnique = true
      } else {
        registrationId = await generateRegistrationId()
        attempts++
      }
    }

    if (!isUnique) {
      return NextResponse.json({
        success: false,
        message: 'Failed to generate unique registration ID'
      }, { status: 500 })
    }

    // Create new user
    console.log('Creating user with data:', {
      email: email.toLowerCase(),
      profile: profile,
      registration: registration
    })
    
    const newUser = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      profile: {
        title: profile.title,
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        designation: profile.designation,
        institution: profile.institution,
        address: {
          street: profile.address?.street || '',
          city: profile.address?.city || '',
          state: profile.address?.state || '',
          country: profile.address?.country || '',
          pincode: profile.address?.pincode || ''
        },
        dietaryRequirements: profile.dietaryRequirements || '',
        specialNeeds: profile.specialNeeds || ''
      },
      registration: {
        registrationId,
        type: registration?.type || 'ntsi-member',
        status: 'pending',
        membershipNumber: registration?.membershipNumber || '',
        workshopSelections: registration?.workshopSelections || [],
        accompanyingPersons: registration?.accompanyingPersons || [],
        registrationDate: new Date()
      },
      role: 'user',
      isActive: true
    })
    
    console.log('User created successfully:', {
      id: newUser._id,
      email: newUser.email,
      registrationId: newUser.registration.registrationId
    })

    // Send registration confirmation email (skip for complementary and sponsored users)
    if (newUser.registration.paymentType !== 'complementary' && newUser.registration.paymentType !== 'sponsored') {
      try {
        await EmailService.sendRegistrationConfirmation({
          email: newUser.email,
          name: `${newUser.profile.firstName} ${newUser.profile.lastName}`,
          registrationId: newUser.registration.registrationId,
          registrationType: newUser.registration.type,
          workshopSelections: registration?.workshopSelections || [],
          accompanyingPersons: registration?.accompanyingPersons?.length || 0
        })
      } catch (emailError) {
        console.error('Failed to send registration email:', emailError)
        // Don't fail the registration if email fails
      }
    } else {
      console.log('Skipping confirmation email for complementary/sponsored user:', newUser.email)
    }

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      data: {
        id: newUser._id,
        email: newUser.email,
        registrationId: newUser.registration.registrationId,
        name: `${newUser.profile.firstName} ${newUser.profile.lastName}`
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    
    // More specific error handling
    if (error instanceof Error) {
      if (error.message.includes('duplicate key') || error.message.includes('E11000')) {
        return NextResponse.json({
          success: false,
          message: 'Email address is already registered'
        }, { status: 409 })
      }
      
      if (error.message.includes('validation')) {
        return NextResponse.json({
          success: false,
          message: 'Validation error: ' + error.message
        }, { status: 400 })
      }
    }
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}