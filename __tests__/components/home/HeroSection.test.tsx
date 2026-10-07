import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import HeroSection from '@/components/home/HeroSection'

// Mock fetch
global.fetch = jest.fn()

describe('HeroSection Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    ;(global.fetch as jest.Mock).mockClear()
  })

  it('should render hero section with default content', async () => {
    // Mock API response
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        heroSection: {
          title:
            'Apply for Your Visa Online with Visa4 - Fast, Secure & Hassle-Free',
          description: 'Professional visa and travel services',
          highlightedText: 'Visa4',
          highlightedTextColor: 'text-red-500',
          mainImage: '/visa/Rectangle.png',
          searchPlaceholder: 'Enter Destination',
        },
      }),
    })

    render(<HeroSection />)

    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByText(/Visa4/i)).toBeInTheDocument()
    })
  })

  it('should render search input', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ heroSection: {} }),
    })

    render(<HeroSection />)

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/destination/i)
      expect(searchInput).toBeInTheDocument()
    })
  })

  it('should handle search input changes', async () => {
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ heroSection: {} }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ visas: [] }),
      })

    render(<HeroSection />)

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/destination/i)
      fireEvent.change(searchInput, { target: { value: 'Canada' } })
      expect(searchInput).toHaveValue('Canada')
    })
  })

  it('should display admin data when provided', () => {
    const adminData = {
      title: 'Custom Title for Testing',
      description: 'Custom description',
      highlightedText: 'Testing',
      highlightedTextColor: 'text-blue-500',
      mainImage: '/custom-image.png',
    }

    render(<HeroSection adminData={adminData} />)

    expect(screen.getByText(/Testing/i)).toBeInTheDocument()
  })

  it('should render main image', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        heroSection: {
          mainImage: '/visa/Rectangle.png',
          mainImageAlt: 'Dubai City',
        },
      }),
    })

    render(<HeroSection />)

    await waitFor(() => {
      const image = screen.getByAltText(/Dubai City/i)
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute('src', '/visa/Rectangle.png')
    })
  })

  it('should handle API fetch errors gracefully', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'))

    render(<HeroSection />)

    // Component should still render with default content
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/destination/i)
      expect(searchInput).toBeInTheDocument()
    })
  })
})
