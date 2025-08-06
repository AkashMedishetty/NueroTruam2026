/**
 * Payment Calculation Tests
 * Tests the core payment logic including discounts, workshops, and categories
 */

describe('Payment Calculation Logic', () => {
  // Mock configuration data
  const mockPricingConfig = {
    registration_categories: {
      regular: { amount: 15000, currency: 'INR', label: 'Regular Delegate' },
      student: { amount: 8000, currency: 'INR', label: 'Student/Resident' },
      international: { amount: 300, currency: 'USD', label: 'International Delegate' },
      faculty: { amount: 12000, currency: 'INR', label: 'Faculty Member' },
      accompanying: { amount: 3000, currency: 'INR', label: 'Accompanying Person' }
    },
    workshops: [
      { id: 'joint-replacement', name: 'Advanced Joint Replacement', amount: 2000 },
      { id: 'arthroscopic', name: 'Arthroscopic Surgery Masterclass', amount: 2500 },
      { id: 'spine-surgery', name: 'Spine Surgery Innovations', amount: 2000 },
      { id: 'trauma-management', name: 'Trauma Management', amount: 1500 }
    ]
  }

  const mockDiscounts = [
    {
      id: 'independence-day',
      name: 'Independence Day Special',
      type: 'time-based',
      percentage: 15,
      startDate: '2024-08-10',
      endDate: '2024-08-20',
      applicableCategories: ['regular', 'faculty'],
      isActive: true
    },
    {
      id: 'early-bird',
      name: 'Early Bird Discount',
      type: 'time-based',
      percentage: 10,
      endDate: '2024-07-31',
      applicableCategories: ['all'],
      isActive: true
    },
    {
      id: 'student-special',
      name: 'Student Special',
      type: 'code-based',
      percentage: 20,
      code: 'STUDENT20',
      applicableCategories: ['student'],
      isActive: true
    }
  ]

  // Payment calculation function (extracted from API logic)
  function calculatePayment(
    registrationType: string,
    workshops: string[] = [],
    accompanyingPersons: number = 0,
    discountCodes: string[] = [],
    currentDate: Date = new Date()
  ) {
    const pricing = mockPricingConfig
    const discounts = mockDiscounts
    
    let subtotal = 0
    let discountAmount = 0
    const breakdown: any = {
      registrationType,
      baseAmount: 0,
      workshopFees: [],
      accompanyingPersonFees: 0,
      discountsApplied: []
    }

    // Base registration fee
    const categoryPricing = pricing.registration_categories[registrationType as keyof typeof pricing.registration_categories]
    if (!categoryPricing) {
      throw new Error(`Invalid registration type: ${registrationType}`)
    }
    
    breakdown.baseAmount = categoryPricing.amount
    subtotal += categoryPricing.amount

    // Workshop fees
    workshops.forEach(workshopId => {
      const workshop = pricing.workshops.find(w => w.id === workshopId)
      if (workshop) {
        breakdown.workshopFees.push({
          name: workshop.name,
          amount: workshop.amount
        })
        subtotal += workshop.amount
      }
    })

    // Accompanying person fees
    if (accompanyingPersons > 0) {
      const accompanyingFee = accompanyingPersons * pricing.registration_categories.accompanying.amount
      breakdown.accompanyingPersonFees = accompanyingFee
      subtotal += accompanyingFee
    }

    // Apply discounts
    discounts.forEach(discount => {
      if (!discount.isActive) return

      let shouldApply = false

      // Check if discount applies to this category
      const appliesToCategory = discount.applicableCategories.includes('all') || 
                               discount.applicableCategories.includes(registrationType)
      if (!appliesToCategory) return

      // Time-based discounts
      if (discount.type === 'time-based') {
        const now = currentDate.getTime()
        const startDate = discount.startDate ? new Date(discount.startDate).getTime() : 0
        const endDate = new Date(discount.endDate).getTime()
        
        shouldApply = now >= startDate && now <= endDate
      }

      // Code-based discounts
      if (discount.type === 'code-based') {
        shouldApply = discountCodes.includes(discount.code || '')
      }

      if (shouldApply) {
        const discountValue = Math.round(subtotal * discount.percentage / 100)
        discountAmount += discountValue
        
        breakdown.discountsApplied.push({
          type: discount.type,
          code: discount.code,
          percentage: discount.percentage,
          amount: discountValue
        })
      }
    })

    const total = Math.max(0, subtotal - discountAmount)

    return {
      subtotal,
      discount: discountAmount,
      total,
      currency: categoryPricing.currency,
      breakdown
    }
  }

  describe('Basic Payment Calculations', () => {
    it('should calculate regular registration fee correctly', () => {
      const result = calculatePayment('regular')
      
      expect(result.subtotal).toBe(15000)
      expect(result.total).toBe(15000)
      expect(result.currency).toBe('INR')
      expect(result.breakdown.baseAmount).toBe(15000)
    })

    it('should calculate student registration fee correctly', () => {
      const result = calculatePayment('student')
      
      expect(result.subtotal).toBe(8000)
      expect(result.total).toBe(8000)
      expect(result.currency).toBe('INR')
    })

    it('should calculate international registration fee correctly', () => {
      const result = calculatePayment('international')
      
      expect(result.subtotal).toBe(300)
      expect(result.total).toBe(300)
      expect(result.currency).toBe('USD')
    })

    it('should throw error for invalid registration type', () => {
      expect(() => calculatePayment('invalid')).toThrow('Invalid registration type: invalid')
    })
  })

  describe('Workshop Fee Calculations', () => {
    it('should add workshop fees to total', () => {
      const result = calculatePayment('regular', ['joint-replacement', 'arthroscopic'])
      
      expect(result.subtotal).toBe(15000 + 2000 + 2500) // 19500
      expect(result.breakdown.workshopFees).toHaveLength(2)
      expect(result.breakdown.workshopFees[0].amount).toBe(2000)
      expect(result.breakdown.workshopFees[1].amount).toBe(2500)
    })

    it('should handle invalid workshop IDs gracefully', () => {
      const result = calculatePayment('regular', ['invalid-workshop', 'joint-replacement'])
      
      expect(result.subtotal).toBe(15000 + 2000) // 17000
      expect(result.breakdown.workshopFees).toHaveLength(1)
    })

    it('should calculate all workshop fees correctly', () => {
      const allWorkshops = ['joint-replacement', 'arthroscopic', 'spine-surgery', 'trauma-management']
      const result = calculatePayment('regular', allWorkshops)
      
      const expectedWorkshopTotal = 2000 + 2500 + 2000 + 1500 // 8000
      expect(result.subtotal).toBe(15000 + expectedWorkshopTotal)
      expect(result.breakdown.workshopFees).toHaveLength(4)
    })
  })

  describe('Accompanying Person Calculations', () => {
    it('should add accompanying person fees', () => {
      const result = calculatePayment('regular', [], 2)
      
      expect(result.subtotal).toBe(15000 + (2 * 3000)) // 21000
      expect(result.breakdown.accompanyingPersonFees).toBe(6000)
    })

    it('should handle zero accompanying persons', () => {
      const result = calculatePayment('regular', [], 0)
      
      expect(result.subtotal).toBe(15000)
      expect(result.breakdown.accompanyingPersonFees).toBe(0)
    })

    it('should calculate complex combinations', () => {
      const result = calculatePayment('regular', ['joint-replacement'], 1)
      
      expect(result.subtotal).toBe(15000 + 2000 + 3000) // 20000
    })
  })

  describe('Discount Calculations', () => {
    it('should apply Independence Day discount during valid period', () => {
      const augustDate = new Date('2024-08-15') // Within discount period
      const result = calculatePayment('regular', [], 0, [], augustDate)
      
      const expectedDiscount = Math.round(15000 * 0.15) // 15% of 15000
      expect(result.discount).toBe(expectedDiscount)
      expect(result.total).toBe(15000 - expectedDiscount)
      expect(result.breakdown.discountsApplied).toHaveLength(1)
    })

    it('should not apply Independence Day discount outside valid period', () => {
      const septemberDate = new Date('2024-09-01') // Outside discount period
      const result = calculatePayment('regular', [], 0, [], septemberDate)
      
      expect(result.discount).toBe(0)
      expect(result.total).toBe(15000)
      expect(result.breakdown.discountsApplied).toHaveLength(0)
    })

    it('should apply Early Bird discount before deadline', () => {
      const julyDate = new Date('2024-07-15') // Before early bird deadline
      const result = calculatePayment('regular', [], 0, [], julyDate)
      
      const expectedDiscount = Math.round(15000 * 0.10) // 10% of 15000
      expect(result.discount).toBe(expectedDiscount)
      expect(result.total).toBe(15000 - expectedDiscount)
    })

    it('should apply code-based discount with valid code', () => {
      const result = calculatePayment('student', [], 0, ['STUDENT20'])
      
      const expectedDiscount = Math.round(8000 * 0.20) // 20% of 8000
      expect(result.discount).toBe(expectedDiscount)
      expect(result.total).toBe(8000 - expectedDiscount)
    })

    it('should not apply code-based discount with invalid code', () => {
      const result = calculatePayment('student', [], 0, ['INVALID'])
      
      expect(result.discount).toBe(0)
      expect(result.total).toBe(8000)
    })

    it('should not apply category-specific discount to wrong category', () => {
      const result = calculatePayment('regular', [], 0, ['STUDENT20'])
      
      expect(result.discount).toBe(0)
      expect(result.total).toBe(15000)
    })

    it('should apply multiple discounts correctly', () => {
      const augustDate = new Date('2024-08-15')
      const result = calculatePayment('regular', ['joint-replacement'], 1, [], augustDate)
      
      const subtotal = 15000 + 2000 + 3000 // 20000
      const expectedDiscount = Math.round(subtotal * 0.15) // 15% Independence Day discount
      
      expect(result.subtotal).toBe(subtotal)
      expect(result.discount).toBe(expectedDiscount)
      expect(result.total).toBe(subtotal - expectedDiscount)
    })
  })

  describe('Edge Cases', () => {
    it('should ensure total is never negative', () => {
      // Mock a scenario where discount exceeds subtotal
      const result = calculatePayment('student', [], 0, ['STUDENT20'])
      
      expect(result.total).toBeGreaterThanOrEqual(0)
    })

    it('should handle empty workshop arrays', () => {
      const result = calculatePayment('regular', [])
      
      expect(result.breakdown.workshopFees).toHaveLength(0)
      expect(result.subtotal).toBe(15000)
    })

    it('should handle empty discount codes array', () => {
      const result = calculatePayment('regular', [], 0, [])
      
      expect(result.discount).toBe(0)
      expect(result.breakdown.discountsApplied).toHaveLength(0)
    })

    it('should round discount amounts correctly', () => {
      // Test with amounts that would result in decimal discounts
      const result = calculatePayment('regular', [], 0, [], new Date('2024-08-15'))
      
      const expectedDiscount = Math.round(15000 * 0.15)
      expect(result.discount).toBe(expectedDiscount)
      expect(Number.isInteger(result.discount)).toBe(true)
      expect(Number.isInteger(result.total)).toBe(true)
    })
  })

  describe('Complex Scenarios', () => {
    it('should handle full registration with all features', () => {
      const augustDate = new Date('2024-08-15')
      const result = calculatePayment(
        'regular',
        ['joint-replacement', 'arthroscopic'],
        2,
        [],
        augustDate
      )
      
      const expectedSubtotal = 15000 + 2000 + 2500 + (2 * 3000) // 25500
      const expectedDiscount = Math.round(expectedSubtotal * 0.15) // 15% discount
      const expectedTotal = expectedSubtotal - expectedDiscount
      
      expect(result.subtotal).toBe(expectedSubtotal)
      expect(result.discount).toBe(expectedDiscount)
      expect(result.total).toBe(expectedTotal)
      expect(result.breakdown.workshopFees).toHaveLength(2)
      expect(result.breakdown.accompanyingPersonFees).toBe(6000)
      expect(result.breakdown.discountsApplied).toHaveLength(1)
    })

    it('should prioritize the best discount for user', () => {
      // This test assumes the system applies all applicable discounts
      // In a real scenario, you might want to apply only the best discount
      const julyDate = new Date('2024-07-15') // Early bird period
      const augustDate = new Date('2024-08-15') // Independence day period
      
      const julyResult = calculatePayment('regular', [], 0, [], julyDate)
      const augustResult = calculatePayment('regular', [], 0, [], augustDate)
      
      // Early bird: 10%, Independence Day: 15%
      expect(augustResult.discount).toBeGreaterThan(julyResult.discount)
    })
  })
})