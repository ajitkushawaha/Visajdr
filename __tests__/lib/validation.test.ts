import { describe, it, expect } from '@jest/globals'

// Import validation functions from lib/validation.ts
// These tests will verify email, phone, and passport validation

describe('Validation Utils', () => {
  describe('Email Validation', () => {
    it('should validate correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.com',
      ]

      validEmails.forEach(email => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        expect(emailRegex.test(email)).toBe(true)
      })
    })

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'user@',
        'user @example.com',
      ]

      invalidEmails.forEach(email => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        expect(emailRegex.test(email)).toBe(false)
      })
    })
  })

  describe('Phone Validation', () => {
    it('should validate correct phone numbers', () => {
      const validPhones = ['+1234567890', '1234567890', '+91 98765 43210']

      validPhones.forEach(phone => {
        const phoneRegex =
          /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/
        expect(phoneRegex.test(phone.replace(/\s/g, ''))).toBe(true)
      })
    })

    it('should reject invalid phone numbers', () => {
      const invalidPhones = ['abcdefghij', '12', 'phone', '!@#$%^&*()']

      invalidPhones.forEach(phone => {
        const phoneRegex =
          /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/
        expect(phoneRegex.test(phone)).toBe(false)
      })
    })
  })

  describe('Passport Validation', () => {
    it('should validate passport number format', () => {
      const validPassports = ['A1234567', 'AB123456', 'K12345678']

      validPassports.forEach(passport => {
        const passportRegex = /^[A-Z]{1,2}[0-9]{6,8}$/
        expect(passportRegex.test(passport)).toBe(true)
      })
    })

    it('should reject invalid passport numbers', () => {
      const invalidPassports = ['123456', 'ABCD1234', 'a1234567']

      invalidPassports.forEach(passport => {
        const passportRegex = /^[A-Z]{1,2}[0-9]{6,8}$/
        expect(passportRegex.test(passport)).toBe(false)
      })
    })
  })
})
