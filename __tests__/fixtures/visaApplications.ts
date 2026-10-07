import { Document } from 'mongoose'

export interface MockVisaApplication extends Document {
  _id: string
  userId: string
  country: string
  visaType: string
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'completed'
  trackingId: string
  personalDetails: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  documents: {
    passportUrl: string
    photoUrl: string
  }
  payment: {
    status: 'pending' | 'completed' | 'failed'
    amount: number
  }
  createdAt: Date
  updatedAt: Date
}

export const mockVisaApplications: Partial<MockVisaApplication>[] = [
  {
    _id: '507f1f77bcf86cd799439011',
    userId: 'user123',
    country: 'USA',
    visaType: 'Tourist',
    status: 'under_review',
    trackingId: 'TRK123456',
    personalDetails: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
    },
    documents: {
      passportUrl: 'https://cloudinary.com/passport.pdf',
      photoUrl: 'https://cloudinary.com/photo.jpg',
    },
    payment: {
      status: 'completed',
      amount: 150,
    },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-02'),
  },
  {
    _id: '507f1f77bcf86cd799439012',
    userId: 'user456',
    country: 'Canada',
    visaType: 'Business',
    status: 'approved',
    trackingId: 'TRK789012',
    personalDetails: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '+1987654321',
    },
    documents: {
      passportUrl: 'https://cloudinary.com/passport2.pdf',
      photoUrl: 'https://cloudinary.com/photo2.jpg',
    },
    payment: {
      status: 'completed',
      amount: 200,
    },
    createdAt: new Date('2025-01-03'),
    updatedAt: new Date('2025-01-05'),
  },
  {
    _id: '507f1f77bcf86cd799439013',
    userId: 'user789',
    country: 'UK',
    visaType: 'Study',
    status: 'pending',
    trackingId: 'TRK345678',
    personalDetails: {
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice.j@example.com',
      phone: '+1122334455',
    },
    documents: {
      passportUrl: 'https://cloudinary.com/passport3.pdf',
      photoUrl: 'https://cloudinary.com/photo3.jpg',
    },
    payment: {
      status: 'pending',
      amount: 250,
    },
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-01-10'),
  },
]

export const mockVisa = {
  _id: '507f1f77bcf86cd799439020',
  country: 'USA',
  countryCode: 'US',
  flag: '🇺🇸',
  visaTypes: ['Tourist', 'Business', 'Student'],
  processingTime: '5-7 business days',
  price: 150,
  documents: ['Passport', 'Photo'],
  status: 'active',
}

export const mockUser = {
  _id: 'user123',
  name: 'John Doe',
  email: 'john.doe@example.com',
  role: 'user',
  phone: '+1234567890',
  createdAt: new Date('2024-12-01'),
}

export const mockAgent = {
  _id: 'agent123',
  personalDetails: {
    fullName: 'Agent Smith',
    email: 'agent@example.com',
    phone: '+9876543210',
  },
  status: 'active',
  kycStatus: 'approved',
  commissionRate: 10,
  commissionType: 'percentage',
  createdAt: new Date('2024-11-01'),
}
