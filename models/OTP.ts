import mongoose, { Document, Schema } from 'mongoose';

export interface IOTP extends Document {
  identifier: string; // email or mobile number
  email?: string;
  mobile?: string;
  otp: string;
  type: 'email' | 'mobile';
  purpose: 'registration' | 'login' | 'password_reset';
  expiresAt: Date;
  isUsed: boolean;
  attempts: number;
  createdAt: Date;
}

const OTPSchema = new Schema<IOTP>({
  identifier: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: false, // Made optional since we use identifier
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  mobile: {
    type: String,
    required: false, // Made optional since we use identifier
    match: [
      /^\+?[1-9]\d{9,14}$/,
      'Please enter a valid mobile number (10-15 digits)'
    ]
  },
  otp: {
    type: String,
    required: true,
    length: 6
  },
  type: {
    type: String,
    enum: ['email', 'mobile'],
    required: true
  },
  purpose: {
    type: String,
    enum: ['registration', 'login', 'password_reset'],
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
OTPSchema.index({ identifier: 1, type: 1, purpose: 1 });
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired OTPs

export default mongoose.models.OTP || mongoose.model<IOTP>('OTP', OTPSchema);
