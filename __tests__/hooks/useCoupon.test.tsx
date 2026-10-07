import { renderHook, act } from '@testing-library/react'
import { useCoupon } from '@/hooks/useCoupon'

describe('useCoupon', () => {
  beforeEach(() => {
    // Reset and stub fetch by default
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(global as any).fetch = jest.fn()
    jest.clearAllMocks()
  })

  it('validates and applies a valid coupon', async () => {
    const mockResponse = {
      valid: true,
      coupon: {
        id: '1',
        code: 'SAVE10',
        name: 'Save 10%',
        description: 'Ten percent off',
        discountType: 'percentage' as const,
        discountValue: 10,
        discountAmount: 100,
        finalAmount: 900,
        maxDiscount: 200,
        minAmount: 500,
      },
    }

    // @ts-expect-error jest mock
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const { result } = renderHook(() => useCoupon())

    await act(async () => {
      const resp = await result.current.validateCoupon(
        'SAVE10',
        'india',
        'tourist',
        1000
      )
      expect(resp.valid).toBe(true)
    })

    expect(result.current.appliedCoupon?.code).toBe('SAVE10')
    const { discountAmount, finalAmount } =
      result.current.calculateDiscount(1000)
    expect(discountAmount).toBe(100)
    expect(finalAmount).toBe(900)
    expect(result.current.error).toBeNull()
    expect(result.current.loading).toBe(false)
  })

  it('handles invalid coupon response gracefully', async () => {
    const mockResponse = {
      valid: false,
      error: 'Invalid coupon code',
    }

    // @ts-expect-error jest mock
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const { result } = renderHook(() => useCoupon())

    await act(async () => {
      const resp = await result.current.validateCoupon('BADCODE')
      expect(resp.valid).toBe(false)
      expect(resp.error).toBe('Invalid coupon code')
    })

    expect(result.current.appliedCoupon).toBeNull()
    expect(result.current.error).toBe('Invalid coupon code')
    expect(result.current.loading).toBe(false)
  })

  it('surfaces network errors', async () => {
    // @ts-expect-error jest mock
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Server error' }),
    })

    const { result } = renderHook(() => useCoupon())

    await act(async () => {
      const resp = await result.current.validateCoupon('ANY')
      expect(resp.valid).toBe(false)
      expect(resp.error).toContain('Server error')
    })

    expect(result.current.error).toContain('Server error')
    expect(result.current.loading).toBe(false)
  })

  it('removes coupon and clears error', async () => {
    // First, set a valid coupon
    const mockResponse = {
      valid: true,
      coupon: {
        id: '1',
        code: 'SAVE10',
        name: 'Save 10%',
        description: 'Ten percent off',
        discountType: 'fixed' as const,
        discountValue: 50,
        discountAmount: 50,
        finalAmount: 950,
      },
    }

    // @ts-expect-error jest mock
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const { result } = renderHook(() => useCoupon())

    await act(async () => {
      await result.current.validateCoupon('SAVE10')
    })

    expect(result.current.appliedCoupon?.code).toBe('SAVE10')

    act(() => {
      result.current.removeCoupon()
    })

    expect(result.current.appliedCoupon).toBeNull()
    expect(result.current.error).toBeNull()
  })
})
