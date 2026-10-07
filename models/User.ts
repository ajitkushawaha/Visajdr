import mongoose, { Document, Schema, models, model } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  mobile?: string // Mobile number for OTP
  gender?: 'male' | 'female' | 'other'
  nationality?: string
  occupation?: string
  passportDetails?: {
    passportNumber: string
    passportExpiry: Date
  }
  documents?: {
    passportFront?: {
      url: string
      publicId: string
      originalName: string
    }
    passportBack?: {
      url: string
      publicId: string
      originalName: string
    }
    photo?: {
      url: string
      publicId: string
      originalName: string
    }
  }
  password?: string // Optional if using Google OAuth
  role: 'user' | 'agent' | 'admin' // Added admin role
  avatar?: string // Corrected spelling
  googleId?: string // Google OAuth ID
  isEmailVerified?: boolean // Email verification status
  isMobileVerified?: boolean // Mobile verification status
  status?: {
    isActive: boolean
  }
  address?: {
    street: string
    city: string
    state: string
    zip: string
    country: string
  }
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },
    mobile: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple nulls
      required: false, // Make mobile optional
      match: [
        /^\+?[1-9]\d{9,14}$/,
        'Please enter a valid mobile number (10-15 digits)',
      ],
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'male',
    },
    nationality: { type: String },
    occupation: { type: String },
    passportDetails: {
      passportNumber: { type: String },
      passportExpiry: { type: Date },
    },
    documents: {
      passportFront: {
        url: String,
        publicId: String,
        originalName: String,
      },
      passportBack: {
        url: String,
        publicId: String,
        originalName: String,
      },
      photo: {
        url: String,
        publicId: String,
        originalName: String,
      },
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
      // Only required for local authentication
      required: function () {
        return !this.googleId // Require password if not Google-authenticated
      },
    },
    role: {
      type: String,
      enum: ['user', 'agent', 'admin'],
      default: 'user', // Set default role
      required: true,
    },
    avatar: {
      type: String,
    },
    // Add Google ID for OAuth users
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple nulls
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isMobileVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      isActive: { type: Boolean, default: true },
    },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zip: { type: String },
      country: { type: String },
    },
  },
  {
    timestamps: true,
  }
)

// Prevent model overwrite issue in dev
const User = models.User || model<IUser>('User', UserSchema)
export default User
