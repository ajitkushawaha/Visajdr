import { renderHook, act } from '@testing-library/react'
import { useReceipt } from '@/hooks/useReceipt'

jest.mock('@/lib/receiptGenerator', () => ({
  downloadReceipt: jest.fn().mockResolvedValue(undefined),
}))

// Some builds instrument console calls with a helper; provide a no-op if present
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(global as any).oo_tx = (...args: any[]) => args

describe('useReceipt', () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(global as any).fetch = jest.fn()
    jest.clearAllMocks()
  })

  it('downloads receipt successfully', async () => {
    const payload = {
      success: true,
      receipt: { trackingId: 'TRK123', applicationId: 'APP456' },
    }

    // @ts-expect-error jest mock
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => payload })

    const { result } = renderHook(() => useReceipt())

    await act(async () => {
      await expect(
        result.current.downloadApplicationReceipt('TRK123')
      ).resolves.toBeUndefined()
    })

    expect(result.current.error).toBeNull()
    expect(result.current.loading).toBe(false)

    const { downloadReceipt } = require('@/lib/receiptGenerator')
    expect(downloadReceipt).toHaveBeenCalledWith(payload.receipt)
  })

  it('handles server error response', async () => {
    // @ts-expect-error jest mock
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Failed to fetch receipt data' }),
    })

    const { result } = renderHook(() => useReceipt())

    await act(async () => {
      await expect(
        result.current.downloadApplicationReceipt('TRKFAIL')
      ).rejects.toBeDefined()
    })

    expect(result.current.error).toContain('Failed')
    expect(result.current.loading).toBe(false)
  })
})
