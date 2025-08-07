"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, FileText, Award, Users, CheckCircle, CreditCard, Eye, EyeOff, Loader2, AlertCircle, CheckIcon } from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { useToast } from "@/hooks/use-toast"
import { signIn } from "next-auth/react"

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [priceCalculation, setPriceCalculation] = useState<any>(null)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [emailCheckTimeout, setEmailCheckTimeout] = useState<NodeJS.Timeout | null>(null)
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (emailCheckTimeout) {
        clearTimeout(emailCheckTimeout)
      }
    }
  }, [emailCheckTimeout])

  // Load dynamic pricing data and workshops
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingPricing(true)
        
        // Load pricing data
        const pricingResponse = await fetch('/api/payment/pricing')
        if (pricingResponse.ok) {
          const pricingResult = await pricingResponse.json()
          if (pricingResult.success && pricingResult.data.currentTier) {
            setCurrentTier(pricingResult.data.currentTier)
            setNextTier(pricingResult.data.nextTier)
            
            // Update registration types with current pricing
            const updatedTypes = [
              { value: "ntsi-member", label: "NTSI Member", price: 12000, currency: "INR" },
              { value: "non-member", label: "Non Member", price: 17000, currency: "INR" },
              { value: "pg-student", label: "PG Student", price: 10000, currency: "INR" }
            ].map(type => ({
              ...type,
              price: pricingResult.data.currentTier.categories[type.value]?.amount || type.price,
              currency: pricingResult.data.currentTier.categories[type.value]?.currency || type.currency
            }))
            setRegistrationTypes(updatedTypes)
          }
        }

        // Load workshops data
        const workshopsResponse = await fetch('/api/workshops')
        if (workshopsResponse.ok) {
          const workshopsResult = await workshopsResponse.json()
          if (workshopsResult.success && workshopsResult.data) {
            const updatedWorkshops = workshopsResult.data.map((workshop: any) => ({
              id: workshop.id,
              label: workshop.name,
              price: workshop.price,
              maxSeats: workshop.maxSeats,
              availableSeats: workshop.availableSeats,
              canRegister: workshop.canRegister
            }))
            setWorkshops(updatedWorkshops)
          }
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoadingPricing(false)
      }
    }

    loadData()
  }, [])

  const [formData, setFormData] = useState({
    // Personal Information
    title: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    designation: "",
    password: "",
    confirmPassword: "",
    institution: "",
    
    // Address
    address: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    
    // Registration Details
    registrationType: "",
    membershipNumber: "",
    dietaryRequirements: "",
    specialNeeds: "",
    workshopSelection: [] as string[],
    accompanyingPersons: [] as Array<{
      name: string
      age: number
      relationship: string
      dietaryRequirements?: string
    }>,
    discountCode: "",
    
    // Payment
    paymentMethod: "pay-later",
    paymentSubMethod: "",
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    agreeTerms: false,
  })

  // State for dynamic data
  const [registrationTypes, setRegistrationTypes] = useState([
    { value: "ntsi-member", label: "NTSI Member", price: 12000, currency: "INR" },
    { value: "non-member", label: "Non Member", price: 17000, currency: "INR" },
    { value: "pg-student", label: "PG Student", price: 10000, currency: "INR" }
  ])
  const [workshops, setWorkshops] = useState<Array<{
    id: string
    label: string
    price: number
    maxSeats?: number
    availableSeats?: number
    canRegister?: boolean
  }>>([
    { id: "brain-surgery", label: "Advanced Brain Surgery Techniques", price: 2000, canRegister: true },
    { id: "spinal-injury", label: "Spinal Cord Injury Management", price: 2500, canRegister: true },
    { id: "pediatric-neurotrauma", label: "Pediatric Neurotrauma", price: 2000, canRegister: true },
    { id: "minimally-invasive", label: "Minimally Invasive Neurosurgery", price: 1500, canRegister: true },
    { id: "neurotrauma-rehab", label: "Neurotrauma Rehabilitation", price: 1800, canRegister: true },
    { id: "emergency-neurosurgery", label: "Emergency Neurosurgery", price: 2200, canRegister: true }
  ])
  const [currentTier, setCurrentTier] = useState<any>(null)
  const [nextTier, setNextTier] = useState<any>(null)
  const [loadingPricing, setLoadingPricing] = useState(true)

  // Calculate price when registration type, workshops, accompanying persons, or discount code change
  useEffect(() => {
    if (formData.registrationType || formData.workshopSelection.length > 0 || formData.accompanyingPersons.length > 0) {
      calculatePrice()
    }
  }, [formData.registrationType, formData.workshopSelection, formData.accompanyingPersons, formData.discountCode])

  const calculatePrice = async () => {
    if (!formData.registrationType) return

    try {
      const response = await fetch('/api/payment/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationType: formData.registrationType,
          workshopSelections: formData.workshopSelection,
          accompanyingPersons: formData.accompanyingPersons,
          discountCode: formData.discountCode || undefined
        })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setPriceCalculation(result.data)
        }
      }
    } catch (error) {
      console.error('Price calculation error:', error)
    }
  }

  const checkEmailUniqueness = async (email: string) => {
    // Validate email format first
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) return
    
    setIsCheckingEmail(true)
    try {
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      })
      
      if (!response.ok) {
        console.error('Email check failed:', response.status, response.statusText)
        return
      }
      
      const result = await response.json()
      console.log('Email check result:', result)
      
      if (!result.available) {
        console.log('Email not available, showing toast...')
        setEmailAvailable(false)
        toast({
          title: "Email Already Registered",
          description: "This email is already registered. Please use a different email or sign in.",
          variant: "destructive"
        })
      } else {
        console.log('Email is available')
        setEmailAvailable(true)
      }
    } catch (error) {
      console.error('Email check error:', error)
    } finally {
      setIsCheckingEmail(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value }
      
      // Auto-select registration type based on designation
      if (field === 'designation') {
        if (value === 'PG/Student') {
          newData.registrationType = 'pg-student'
        } else if (value === 'Consultant' && prev.registrationType === 'pg-student') {
          // Clear pg-student if consultant is selected
          newData.registrationType = ''
        }
      }
      
      return newData
    })
    
    // Check email uniqueness when email field changes with proper debouncing
    if (field === 'email' && typeof value === 'string') {
      // Reset email availability when email changes
      setEmailAvailable(null)
      
      // Clear existing timeout
      if (emailCheckTimeout) {
        clearTimeout(emailCheckTimeout)
      }
      
      // Only check if email looks valid
      if (value.includes('@') && value.includes('.')) {
        const timeoutId = setTimeout(() => checkEmailUniqueness(value), 1000) // Increased delay
        setEmailCheckTimeout(timeoutId)
      }
    }
  }

  const handleWorkshopToggle = (workshop: string) => {
    setFormData((prev) => {
      const workshops = [...prev.workshopSelection]
      if (workshops.includes(workshop)) {
        return { ...prev, workshopSelection: workshops.filter((w) => w !== workshop) }
      } else {
        return { ...prev, workshopSelection: [...workshops, workshop] }
      }
    })
  }

  const addAccompanyingPerson = () => {
    setFormData((prev) => ({
      ...prev,
      accompanyingPersons: [...prev.accompanyingPersons, {
        name: "",
        age: 18,
        relationship: "",
        dietaryRequirements: ""
      }]
    }))
  }

  const removeAccompanyingPerson = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      accompanyingPersons: prev.accompanyingPersons.filter((_, i) => i !== index)
    }))
  }

  const updateAccompanyingPerson = (index: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      accompanyingPersons: prev.accompanyingPersons.map((person, i) => 
        i === index ? { ...person, [field]: value } : person
      )
    }))
  }

  const validateStep = (currentStep: number) => {
    console.log(`Validating step ${currentStep}...`)
    console.log(`Current form data:`, JSON.stringify(formData, null, 2))
    
    switch (currentStep) {
      case 1:
        // Check all required fields for step 1
        const requiredFields = {
          title: formData.title,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          designation: formData.designation,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          institution: formData.institution
        }
        
        console.log('Checking required fields:', requiredFields)
        
        const missingFields = Object.entries(requiredFields).filter(([key, value]) => {
          const isEmpty = !value || (typeof value === 'string' && value.trim() === '')
          if (isEmpty) {
            console.log(`Missing field: ${key} = "${value}"`)
          }
          return isEmpty
        })
        
        if (missingFields.length > 0) {
          const missingFieldNames = missingFields.map(([key]) => {
            // Convert camelCase to readable format
            return key.replace(/([A-Z])/g, ' $1').toLowerCase().replace(/^./, str => str.toUpperCase())
          }).join(', ')
          
          console.log('Missing fields detected:', missingFieldNames)
          
          toast({
            title: "Missing Required Fields",
            description: `Please fill in the following fields: ${missingFieldNames}`,
            variant: "destructive",
            duration: 5000 // Show for 5 seconds
          })
          
          // Scroll to the first missing field
          const fieldElement = document.querySelector(`[name="${missingFields[0][0]}"], #${missingFields[0][0]}`)
          if (fieldElement) {
            fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
          
          return false
        }
        // Password validation
        if (!formData.password || formData.password.length < 8) {
          console.log('Password validation failed:', formData.password?.length || 0)
          toast({
            title: "Password Requirements",
            description: "Password must be at least 8 characters long.",
            variant: "destructive",
            duration: 5000
          })
          document.querySelector('input[type="password"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          return false
        }
        
        // Confirm password validation
        if (formData.password !== formData.confirmPassword) {
          console.log('Password confirmation failed')
          toast({
            title: "Passwords Don't Match",
            description: "Please ensure both password fields contain the same value.",
            variant: "destructive",
            duration: 5000
          })
          document.querySelector('input[placeholder*="Confirm"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          return false
        }
        
        // Email availability validation
        if (emailAvailable === false) {
          console.log('Email already registered')
          toast({
            title: "Email Already Registered",
            description: "This email is already registered. Please use a different email or sign in with your existing account.",
            variant: "destructive",
            duration: 7000
          })
          document.querySelector('input[type="email"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          return false
        }
        
        // Check if email verification is still pending
        if (emailAvailable === null && formData.email.includes('@') && formData.email.includes('.')) {
          console.log('Email verification still pending')
          // Trigger email check again
          setTimeout(() => checkEmailUniqueness(formData.email), 100)
          toast({
            title: "Email Verification Pending",
            description: "Please wait a moment while we verify your email address is available.",
            variant: "destructive",
            duration: 5000
          })
          return false
        }
        
        console.log('✅ Step 1 validation passed successfully!')
        return true
      case 2:
        console.log('Step 2 validation - checking registration details...')
        console.log('Step 2 form data:', {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          registrationType: formData.registrationType
        })
        
        // Check address fields
        const addressFields = {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        }
        
        const missingAddressFields = Object.entries(addressFields).filter(([key, value]) => {
          return !value || (typeof value === 'string' && value.trim() === '')
        })
        
        if (missingAddressFields.length > 0) {
          const missingNames = missingAddressFields.map(([key]) => 
            key.replace(/([A-Z])/g, ' $1').toLowerCase().replace(/^./, str => str.toUpperCase())
          ).join(', ')
          
          console.log('Missing address fields:', missingNames)
          toast({
            title: "Missing Address Information", 
            description: `Please fill in the following address fields: ${missingNames}`,
            variant: "destructive",
            duration: 5000
          })
          return false
        }
        
        // Check registration type
        if (!formData.registrationType) {
          console.log('Missing registration type')
          toast({
            title: "Registration Type Required",
            description: "Please select your registration type (NTSI Member, Non Member, or PG Student).",
            variant: "destructive",
            duration: 5000
          })
          document.querySelector('input[name="registrationType"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          return false
        }
        
        console.log('✅ Step 2 validation passed!')
        return true
        
      case 3:
        console.log('Step 3 validation - checking payment and terms...')
        console.log('Step 3 form data:', {
          agreeTerms: formData.agreeTerms,
          paymentMethod: formData.paymentMethod
        })
        
        if (!formData.agreeTerms) {
          console.log('Terms not agreed')
          toast({
            title: "Terms and Conditions Required",
            description: "Please read and agree to the terms and conditions before proceeding.",
            variant: "destructive",
            duration: 6000
          })
          document.querySelector('#terms')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          return false
        }
        
        console.log('✅ Step 3 validation passed!')
        return true
      default:
        console.log(`Default validation for step ${currentStep}`)
        return true
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('🔄 Form submitted! Current step:', step)
    console.log('📋 Complete form data:', JSON.stringify(formData, null, 2))
    
    if (step < 3) {
      console.log('➡️ Attempting to move to next step...')
      console.log('📊 Email availability status:', emailAvailable)
      
      const isValid = validateStep(step)
      console.log(`✅ Step ${step} validation result:`, isValid)
      
      if (isValid) {
        console.log(`🎉 Moving from step ${step} to step ${step + 1}`)
        setStep(step + 1)
        
        // Show success toast for step completion
        toast({
          title: "Step Completed",
          description: `Step ${step} completed successfully. Moving to step ${step + 1}.`,
          variant: "default",
          duration: 2000
        })
      } else {
        console.log(`❌ Step ${step} validation failed - staying on current step`)
      }
      return
    }

    // Final submission when on step 3
    if (step === 3) {
      console.log('Final submission - validating step 3...')
      if (!validateStep(3)) {
        console.log('Step 3 validation failed!')
        return
      }

      console.log('Starting registration API call...')
      setLoading(true)
      try {
      console.log('Making API call to /api/auth/register...')
      
      const requestBody = {
        email: formData.email,
        password: formData.password,
        profile: {
          title: formData.title,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          designation: formData.designation,
          institution: formData.institution,
          address: {
            street: formData.address,
            city: formData.city,
            state: formData.state,
            country: formData.country,
            pincode: formData.pincode
          },
          dietaryRequirements: formData.dietaryRequirements,
          specialNeeds: formData.specialNeeds
        },
        registration: {
          type: formData.registrationType,
          membershipNumber: formData.membershipNumber,
          workshopSelections: formData.workshopSelection,
          accompanyingPersons: formData.accompanyingPersons
        }
      }
      
      console.log('Request body being sent:', JSON.stringify(requestBody, null, 2))
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      const result = await response.json()
      console.log('API Response:', result)

      if (result.success) {
        toast({
          title: "Registration Successful!",
          description: "Your account has been created. Please check your email for confirmation."
        })

        console.log('Payment method:', formData.paymentMethod)
        console.log('Price calculation:', priceCalculation)
        console.log('Should redirect to payment:', formData.paymentMethod === 'pay-now' && priceCalculation)

        if (formData.paymentMethod === 'pay-now' && priceCalculation) {
          // Automatically log in the user and redirect to payment
          toast({
            title: "Logging you in...",
            description: "Automatically signing you in to complete payment."
          })
          
          try {
            // Add a small delay to ensure the user is properly saved
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            const loginResult = await signIn("credentials", {
              email: formData.email,
              password: formData.password,
              redirect: false
            })

            console.log('Auto-login result:', loginResult)

            if (loginResult?.ok && !loginResult?.error) {
              toast({
                title: "Redirecting to Payment",
                description: "Taking you to the payment page to complete your registration."
              })
              // Add another small delay to ensure session is established
              await new Promise(resolve => setTimeout(resolve, 500))
              // Use window.location to ensure proper navigation with session
              window.location.href = `/dashboard/payment?registrationId=${result.data.registrationId}`
            } else {
              console.error('Auto-login failed:', loginResult?.error)
              toast({
                title: "Auto-login Failed",
                description: "Please log in manually to complete payment.",
                variant: "destructive"
              })
              window.location.href = `/auth/login?callbackUrl=${encodeURIComponent(`/dashboard/payment?registrationId=${result.data.registrationId}`)}`
            }
          } catch (loginError) {
            console.error('Auto-login error:', loginError)
            toast({
              title: "Auto-login Failed",
              description: "Please log in manually to complete payment.",
              variant: "destructive"
            })
            window.location.href = `/auth/login?callbackUrl=${encodeURIComponent(`/dashboard/payment?registrationId=${result.data.registrationId}`)}`
          }
        } else {
          // Show success and redirect to login
          setStep(4)
          setTimeout(() => {
            window.location.href = '/auth/login?message=Registration successful. Please log in.'
          }, 3000)
        }
      } else {
        toast({
          title: "Registration Failed",
          description: result.message || "Please try again.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Registration error:', error)
      toast({
        title: "Error",
        description: "An error occurred during registration. Please check the console for details.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === "USD") {
      return `$${amount.toFixed(2)}`
    }
    return `₹${amount.toLocaleString()}`
  }
  
  // Validation helper component
  const ValidationSummary = ({ currentStep }: { currentStep: number }) => {
    let missingFields: string[] = []
    
    if (currentStep === 1) {
      const requiredFields = {
        title: formData.title,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        designation: formData.designation,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        institution: formData.institution
      }
      
      missingFields = Object.entries(requiredFields)
        .filter(([key, value]) => !value || (typeof value === 'string' && value.trim() === ''))
        .map(([key]) => key.replace(/([A-Z])/g, ' $1').toLowerCase().replace(/^./, str => str.toUpperCase()))
    }
    
    if (missingFields.length === 0) return null
    
    return (
      <Alert className="mb-4 border-orange-200 bg-orange-50">
        <AlertCircle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <strong>Please complete the following required fields:</strong>
          <ul className="mt-2 list-disc list-inside space-y-1">
            {missingFields.map(field => (
              <li key={field} className="text-sm">{field}</li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>
    )
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-800">Personal Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <Select value={formData.title} onValueChange={(value) => handleInputChange("title", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select title" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dr.">Dr.</SelectItem>
                    <SelectItem value="Prof.">Prof.</SelectItem>
                    <SelectItem value="Mr.">Mr.</SelectItem>
                    <SelectItem value="Mrs.">Mrs.</SelectItem>
                    <SelectItem value="Ms.">Ms.</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  placeholder="Enter your first name"
                  className={!formData.firstName ? "border-red-200 focus:border-red-400" : "border-green-200 focus:border-green-400"}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  placeholder="Enter your last name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                  {isCheckingEmail && <span className="text-blue-500 text-xs ml-2">(Checking availability...)</span>}
                  {emailAvailable === true && <span className="text-green-500 text-xs ml-2">✓ Available</span>}
                  {emailAvailable === false && <span className="text-red-500 text-xs ml-2">✗ Already registered</span>}
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  className={
                    isCheckingEmail ? "border-blue-300" :
                    emailAvailable === true ? "border-green-300" :
                    emailAvailable === false ? "border-red-300" : ""
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+91 9876543210"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Designation *</label>
                <Select value={formData.designation} onValueChange={(value) => handleInputChange("designation", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your designation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Consultant">Consultant</SelectItem>
                    <SelectItem value="PG/Student">PG/Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Institution/Hospital *</label>
                <Input
                  value={formData.institution}
                  onChange={(e) => handleInputChange("institution", e.target.value)}
                  placeholder="Enter your institution name"
                  required
                />
              </div>
            </div>
            
            {/* Password Fields */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Create a password (min 8 characters)"
                    className="pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    placeholder="Confirm your password"
                    className="pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <Textarea
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Enter your address"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <Input
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="Enter your city"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
                <Input
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  placeholder="Enter your state"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <Input
                  value={formData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  placeholder="Enter your country"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Postal/ZIP Code</label>
                <Input
                  value={formData.pincode}
                  onChange={(e) => handleInputChange("pincode", e.target.value)}
                  placeholder="Enter your postal code"
                />
              </div>
            </div>
            
            {/* Validation Summary */}
            <ValidationSummary currentStep={1} />
            
            <div className="flex justify-end">
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                Next Step
              </Button>
            </div>
          </motion.div>
        )
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-800">Registration Details</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Registration Type *</label>
              {/* Special Offer Banner */}
              {currentTier && (
                <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 rounded-lg mb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{currentTier.name}</h3>
                      <p className="text-sm opacity-90">{currentTier.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm opacity-90">Valid until</p>
                      <p className="font-semibold">{new Date(currentTier.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                  {nextTier && (
                    <div className="mt-2 pt-2 border-t border-white/20">
                      <p className="text-xs opacity-75">
                        Next: {nextTier.tier.name} starts in {nextTier.daysUntil} days
                      </p>
                    </div>
                  )}
                </div>
              )}

              <RadioGroup
                value={formData.registrationType}
                onValueChange={(value) => handleInputChange("registrationType", value)}
                className="space-y-4"
              >
                {registrationTypes
                  .filter(type => {
                    // If designation is PG/Student, only show pg-student option
                    if (formData.designation === 'PG/Student') {
                      return type.value === 'pg-student'
                    }
                    // If designation is Consultant, show all except pg-student
                    if (formData.designation === 'Consultant') {
                      return type.value !== 'pg-student'
                    }
                    // If no designation selected yet, show all
                    return true
                  })
                  .map((type) => (
                  <div key={type.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={type.value} id={type.value} />
                    <Label htmlFor={type.value}>
                      {type.label} ({type.currency === 'USD' ? '$' : '₹'}{type.price.toLocaleString()})
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">NSI Membership Number (if applicable)</label>
              <Input
                value={formData.membershipNumber}
                onChange={(e) => handleInputChange("membershipNumber", e.target.value)}
                placeholder="Enter your membership number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Workshop Selection (Optional)</label>
              <div className="space-y-3">
                {workshops.map((workshop) => (
                  <div key={workshop.id} className={`flex items-center justify-between p-3 border rounded-lg ${
                    !workshop.canRegister ? 'opacity-60 bg-gray-50' : 'hover:bg-gray-50'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id={workshop.id}
                        checked={formData.workshopSelection.includes(workshop.id)}
                        onCheckedChange={() => handleWorkshopToggle(workshop.id)}
                        disabled={!workshop.canRegister}
                      />
                      <div>
                        <label
                          htmlFor={workshop.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {workshop.label}
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          ₹{workshop.price.toLocaleString()}
                          {workshop.availableSeats !== undefined && (
                            <span className={`ml-2 ${
                              workshop.availableSeats > 10 ? 'text-green-600' : 
                              workshop.availableSeats > 0 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              • {workshop.availableSeats > 0 ? `${workshop.availableSeats} seats left` : 'Fully Booked'}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Requirements</label>
              <Select
                value={formData.dietaryRequirements}
                onValueChange={(value) => handleInputChange("dietaryRequirements", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select if applicable" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Special Requirements</SelectItem>
                  <SelectItem value="vegetarian">Vegetarian</SelectItem>
                  <SelectItem value="vegan">Vegan</SelectItem>
                  <SelectItem value="gluten-free">Gluten Free</SelectItem>
                  <SelectItem value="halal">Halal</SelectItem>
                  <SelectItem value="other">Other (Please specify)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Needs/Accessibility Requirements
              </label>
              <Textarea
                value={formData.specialNeeds}
                onChange={(e) => handleInputChange("specialNeeds", e.target.value)}
                placeholder="Please let us know if you have any special needs or accessibility requirements"
              />
            </div>

            {/* Accompanying Persons Section */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Accompanying Persons (Optional)</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAccompanyingPerson}
                  className="flex items-center space-x-2"
                >
                  <Users className="h-4 w-4" />
                  <span>Add Person</span>
                </Button>
              </div>

              {formData.accompanyingPersons.length === 0 ? (
                <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No accompanying persons added yet.</p>
                  <p className="text-xs">Click "Add Person" to include family or colleagues.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.accompanyingPersons.map((person, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-800">Person {index + 1}</h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeAccompanyingPerson(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                          <Input
                            value={person.name}
                            onChange={(e) => updateAccompanyingPerson(index, 'name', e.target.value)}
                            placeholder="Full name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
                          <Input
                            type="number"
                            value={person.age}
                            onChange={(e) => updateAccompanyingPerson(index, 'age', parseInt(e.target.value) || 18)}
                            min="1"
                            max="120"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Relationship *</label>
                          <Select
                            value={person.relationship}
                            onValueChange={(value) => updateAccompanyingPerson(index, 'relationship', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select relationship" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="spouse">Spouse</SelectItem>
                              <SelectItem value="parent">Parent</SelectItem>
                              <SelectItem value="child">Child</SelectItem>
                              <SelectItem value="sibling">Sibling</SelectItem>
                              <SelectItem value="friend">Friend</SelectItem>
                              <SelectItem value="colleague">Colleague</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dietary Requirements</label>
                        <Input
                          value={person.dietaryRequirements || ''}
                          onChange={(e) => updateAccompanyingPerson(index, 'dietaryRequirements', e.target.value)}
                          placeholder="Any dietary requirements (optional)"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Discount Code Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Discount Code (Optional)</h3>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    value={formData.discountCode}
                    onChange={(e) => handleInputChange("discountCode", e.target.value)}
                    placeholder="Enter discount code (e.g., EARLY2025, STUDENT10)"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={calculatePrice}
                  disabled={!formData.discountCode}
                >
                  Apply
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Available discounts: Early Bird, Student discounts, Independence Day offers
              </p>
            </div>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                Previous
              </Button>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                Next Step
              </Button>
            </div>
          </motion.div>
        )
      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-800">Payment Information</h2>
            
            {/* Price Summary */}
            {priceCalculation && (
              <div className="bg-orange-50 p-6 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Registration Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Registration Fee:</span>
                    <span className="font-medium">
                      {formatCurrency(priceCalculation.registrationFee, priceCalculation.currency)}
                    </span>
                  </div>
                  {priceCalculation.workshopFees > 0 && (
                    <div className="flex justify-between">
                      <span>Workshop Fees ({formData.workshopSelection.length} workshops):</span>
                      <span className="font-medium">
                        {formatCurrency(priceCalculation.workshopFees, priceCalculation.currency)}
                      </span>
                    </div>
                  )}
                  {priceCalculation.accompanyingPersonFees > 0 && (
                    <div className="flex justify-between">
                      <span>Accompanying Persons ({formData.accompanyingPersons.length} persons):</span>
                      <span className="font-medium">
                        {formatCurrency(priceCalculation.accompanyingPersonFees, priceCalculation.currency)}
                      </span>
                    </div>
                  )}
                  {priceCalculation.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount Applied{formData.discountCode ? ` (${formData.discountCode})` : ''}:</span>
                      <span className="font-medium">
                        -{formatCurrency(priceCalculation.discount, priceCalculation.currency)}
                      </span>
                    </div>
                  )}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total Amount:</span>
                      <span className="text-orange-600">
                        {formatCurrency(priceCalculation.total, priceCalculation.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Option *</label>
              <RadioGroup
                value={formData.paymentMethod}
                onValueChange={(value) => handleInputChange("paymentMethod", value)}
                className="space-y-4"
              >
                <div className="flex items-center space-x-2 p-3 border rounded-lg dark:border-gray-600">
                  <RadioGroupItem value="pay-later" id="pay-later" />
                  <Label htmlFor="pay-later" className="flex items-center space-x-2 cursor-pointer">
                    <CreditCard className="w-4 h-4 text-orange-500" />
                    <span className="text-gray-700 dark:text-gray-300">Register Now, Pay Later (Recommended)</span>
                  </Label>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 ml-6 -mt-2">
                  Complete your registration now and pay from your dashboard later
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg dark:border-gray-600">
                  <RadioGroupItem value="pay-now" id="pay-now" />
                  <Label htmlFor="pay-now" className="flex items-center space-x-2 cursor-pointer">
                    <CreditCard className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">Pay Now</span>
                  </Label>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 ml-6 -mt-2">
                  Complete payment immediately after registration
                </div>
              </RadioGroup>
            </div>
            
            <div className="flex items-start space-x-2 mt-6">
              <Checkbox
                id="terms"
                checked={formData.agreeTerms}
                onCheckedChange={(checked) => handleInputChange("agreeTerms", checked === true)}
              />
              <label htmlFor="terms" className="text-sm text-gray-700">
                I agree to the{" "}
                <Link href="#" className="text-orange-600 hover:underline">
                  Terms and Conditions
                </Link>{" "}
                and{" "}
                <Link href="#" className="text-orange-600 hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>
            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setStep(2)}>
                Previous
              </Button>
              <Button
                type="submit"
                className="bg-orange-600 hover:bg-orange-700"
                disabled={!formData.agreeTerms || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Complete Registration"
                )}
              </Button>
            </div>
          </motion.div>
        )
      case 4:
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center p-12"
          >
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Registration Successful!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for registering for NeuroTrauma Conference 2026. Your account has been created successfully.
            </p>
            <p className="text-gray-600 mb-8">
              A confirmation email has been sent to <span className="font-semibold">{formData.email}</span> with your
              registration details and login instructions.
            </p>
            <div className="bg-orange-50 p-6 rounded-lg mb-6 text-left">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">What's Next?</h3>
              <div className="space-y-2 text-sm">
                <p>• Check your email for confirmation and login instructions</p>
                <p>• Sign in to your dashboard to complete payment</p>
                <p>• Access your registration details and conference materials</p>
                <p>• Update your profile and preferences</p>
              </div>
            </div>
            <div className="space-x-4">
              <Link href="/auth/login">
                <Button className="bg-orange-600 hover:bg-orange-700">
                  Sign In Now
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline">Return to Home</Button>
              </Link>
            </div>
          </motion.div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navigation currentPage="register" />

      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <section className="py-12 sm:py-16 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg mx-4 sm:mx-6 lg:mx-8">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">Conference Registration</h1>
              <p className="text-lg sm:text-xl max-w-3xl mx-auto px-4">
                Join us for the premier neurotrauma conference - August 7-9, 2026 in Hyderabad, India
              </p>
            </motion.div>
          </div>
        </section>

        {/* Independence Day Special Offer */}
        {new Date() <= new Date('2025-08-15') && (
          <section className="py-8 mx-4 sm:mx-6 lg:mx-8">
            <div className="container mx-auto px-4 sm:px-6">
              <motion.div 
                initial={{ opacity: 0, y: 30 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.6, delay: 0.2 }}
                className="max-w-2xl mx-auto"
              >
                {/* Independence Day Special */}
                  <div className="relative overflow-hidden rounded-xl shadow-lg">
                    {/* Slanted Waving Indian Flag Background */}
                    <div className="absolute inset-0">
                      {/* Orange Stripe with Wave */}
                      <div 
                        className="absolute top-0 left-0 w-full h-1/3 transform -skew-y-2 origin-top-left"
                        style={{
                          background: 'linear-gradient(135deg, #ff9933 0%, #ff6b35 50%, #ff9933 100%)',
                          backgroundSize: '200% 200%',
                          animation: 'gradientShift 4s ease-in-out infinite, wave 3s ease-in-out infinite'
                        }}
                      ></div>
                      
                      {/* White Stripe with Wave */}
                      <div 
                        className="absolute top-1/3 left-0 w-full h-1/3 transform -skew-y-2 origin-center"
                        style={{
                          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #ffffff 100%)',
                          backgroundSize: '200% 200%',
                          animation: 'gradientShift 4s ease-in-out infinite 0.5s, wave 3s ease-in-out infinite 0.5s'
                        }}
                      ></div>
                      
                      {/* Green Stripe with Wave */}
                      <div 
                        className="absolute top-2/3 left-0 w-full h-1/3 transform -skew-y-2 origin-bottom-left"
                        style={{
                          background: 'linear-gradient(135deg, #138808 0%, #16a085 50%, #138808 100%)',
                          backgroundSize: '200% 200%',
                          animation: 'gradientShift 4s ease-in-out infinite 1s, wave 3s ease-in-out infinite 1s'
                        }}
                      ></div>
                      
                      {/* Flowing Wave Overlay */}
                      <div 
                        className="absolute inset-0 opacity-30"
                        style={{
                          background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
                          animation: 'flowingWave 3s linear infinite'
                        }}
                      ></div>
                    </div>
                    
                    {/* Content Overlay */}
                    <div className="relative bg-black/40 backdrop-blur-sm p-6 text-white">
                      <div className="text-center mb-4">
                        <div className="text-center mb-3">
                          <h3 className="text-2xl font-bold text-white drop-shadow-lg">Independence Day Special</h3>
                          <p className="text-sm text-white/90 drop-shadow">Celebrate freedom with exclusive pricing!</p>
                        </div>
                        <div className="text-center">
                          <div className="text-6xl font-black mb-2 text-white drop-shadow-lg">₹5,000</div>
                          <div className="bg-white/30 backdrop-blur-sm px-6 py-3 rounded-full text-lg font-semibold inline-block text-white border border-white/30">
                            Registration Fee
                          </div>
                        </div>
                      </div>
                      <div className="text-center space-y-3">
                        <p className="text-base text-white/95 drop-shadow">Special Independence Day pricing for conference registration</p>
                        <p className="text-sm text-white/90 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full inline-block border border-white/30">
                          Valid until August 15, 2025 • Limited time offer
                        </p>
                      </div>
                    </div>
                    
                    {/* Required CSS Styles */}
                    <style jsx>{`
                      @keyframes gradientShift {
                        0%, 100% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                      }
                      
                      @keyframes wave {
                        0%, 100% { transform: translateY(0px) skewY(-2deg); }
                        25% { transform: translateY(-2px) skewY(-1deg); }
                        50% { transform: translateY(-4px) skewY(0deg); }
                        75% { transform: translateY(-2px) skewY(-1deg); }
                      }
                      
                      @keyframes flowingWave {
                        0% { transform: translateX(-100%) rotate(-45deg); }
                        100% { transform: translateX(200%) rotate(-45deg); }
                      }
                    `}</style>
                  </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* Sign In Link */}
        <div className="text-center py-4">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-orange-600 hover:text-orange-700 font-medium hover:underline">
              Sign in here
            </Link>
          </p>
        </div>

        {/* Progress Indicator */}
        {step < 4 && (
          <section className="py-6 sm:py-8">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="flex items-center justify-center space-x-2 sm:space-x-4 lg:space-x-8 overflow-x-auto">
                {[1, 2, 3].map((stepNumber) => (
                  <div key={stepNumber} className="flex items-center flex-shrink-0">
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base ${
                        step >= stepNumber ? "bg-orange-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                      }`}
                    >
                      {stepNumber}
                    </div>
                    <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
                      {stepNumber === 1 && "Personal Info"}
                      {stepNumber === 2 && "Registration"}
                      {stepNumber === 3 && "Payment"}
                    </span>
                    {stepNumber < 3 && (
                      <div className={`w-8 sm:w-16 h-1 mx-2 sm:mx-4 ${step > stepNumber ? "bg-orange-600" : "bg-gray-200 dark:bg-gray-700"}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Registration Form */}
        <section className="py-8 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
              <Card className="shadow-xl dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-4 sm:p-6 lg:p-8">
                  <form onSubmit={handleSubmit}>{renderStepContent()}</form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Registration Benefits */}
        {step < 4 && (
          <section className="py-12 sm:py-16 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-800 dark:to-gray-700 mx-4 sm:mx-6 lg:mx-8 rounded-lg">
            <div className="container mx-auto px-4 sm:px-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-gray-800 dark:text-white">Registration Benefits</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                {[
                  { icon: Calendar, title: "Full Access", desc: "Access to all sessions and workshops" },
                  { icon: FileText, title: "Conference Materials", desc: "Digital proceedings and certificates" },
                  { icon: Award, title: "CME Credits", desc: "Continuing medical education credits" },
                  { icon: Users, title: "Networking", desc: "Connect with leading professionals" },
                ].map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="text-center p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border dark:border-gray-600"
                  >
                    <benefit.icon className="w-10 h-10 sm:w-12 sm:h-12 text-orange-500 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white mb-2">{benefit.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">{benefit.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}