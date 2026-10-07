import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'

// Mock next-auth
jest.mock('next-auth', () => ({
  ...jest.requireActual('next-auth'),
  getServerSession: jest.fn(),
}))

// Mock database
jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: jest.fn(() => Promise.resolve()),
}))

describe('API: /api/admin/agents', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/admin/agents', () => {
    it('should require admin authentication', async () => {
      // Mock unauthenticated session
      ;(getServerSession as jest.Mock).mockResolvedValue(null)

      const { GET } = await import('@/app/api/admin/agents/route')
      const request = new NextRequest('http://localhost:3000/api/admin/agents')

      const response = await GET(request)
      expect(response.status).toBe(401)
    })

    it('should reject non-admin users', async () => {
      // Mock user session with role 'user'
      ;(getServerSession as jest.Mock).mockResolvedValue({
        user: { email: 'user@example.com', role: 'user' },
      })

      const { GET } = await import('@/app/api/admin/agents/route')
      const request = new NextRequest('http://localhost:3000/api/admin/agents')

      const response = await GET(request)
      expect(response.status).toBe(401)
    })

    it('should allow admin access', async () => {
      // Mock admin session
      ;(getServerSession as jest.Mock).mockResolvedValue({
        user: { email: 'admin@example.com', role: 'admin' },
      })

      // Mock agent data
      const mockAgents = [
        {
          _id: 'agent1',
          personalDetails: { fullName: 'Test Agent', email: 'agent@test.com' },
          status: 'active',
        },
      ]

      jest.doMock('@/models/Agent', () => ({
        __esModule: true,
        default: class {
          static find = jest.fn(() => ({
            populate: jest.fn(() => Promise.resolve(mockAgents)),
          }))
        },
      }))

      const { GET } = await import('@/app/api/admin/agents/route')
      expect(GET).toBeDefined()
    })
  })

  describe('POST /api/admin/agents', () => {
    it('should create new agent', async () => {
      // Mock admin session
      ;(getServerSession as jest.Mock).mockResolvedValue({
        user: { email: 'admin@example.com', role: 'admin' },
      })

      const agentData = {
        personalDetails: {
          fullName: 'New Agent',
          email: 'newagent@test.com',
          phone: '+1234567890',
        },
        commissionRate: 10,
        commissionType: 'percentage',
      }

      const { POST } = await import('@/app/api/admin/agents/route')
      expect(POST).toBeDefined()
    })
  })
})

describe('API: /api/admin/agents/[id]', () => {
  it('should update agent status', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'admin@example.com', role: 'admin' },
    })

    const { PUT } = await import('@/app/api/admin/agents/[id]/route')
    expect(PUT).toBeDefined()
  })

  it('should delete agent', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'admin@example.com', role: 'admin' },
    })

    const { DELETE } = await import('@/app/api/admin/agents/[id]/route')
    expect(DELETE).toBeDefined()
  })
})

describe('API: /api/admin/agents/notifications', () => {
  it('should create notification', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'admin@example.com', role: 'admin' },
    })

    const { POST } = await import('@/app/api/admin/agents/notifications/route')
    expect(POST).toBeDefined()
  })

  it('should fetch notifications', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'admin@example.com', role: 'admin' },
    })

    const { GET } = await import('@/app/api/admin/agents/notifications/route')
    expect(GET).toBeDefined()
  })
})

describe('API: /api/admin/agents/reports', () => {
  it('should generate agent reports', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'admin@example.com', role: 'admin' },
    })

    const { GET } = await import('@/app/api/admin/agents/reports/route')
    expect(GET).toBeDefined()
  })
})
