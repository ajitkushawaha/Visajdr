import mongoose, { Document, Schema } from 'mongoose';

export interface ISupplier extends Document {
  name: string;
  email: string;
  mobile: string;
  service: string;
  country: string;
  city?: string;
  address?: string;
  status: 'active' | 'inactive';
  commission?: number;
  notes?: string;
  contactPerson?: string;
  website?: string;
  rating?: number;
  totalApplications?: number;
  successRate?: number;
  lastContactDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SupplierSchema = new Schema<ISupplier>({
  name: {
    type: String,
    required: [true, 'Supplier name is required'],
    trim: true,
    maxlength: [100, 'Supplier name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    trim: true,
    maxlength: [20, 'Mobile number cannot exceed 20 characters']
  },
  service: {
    type: String,
    required: [true, 'Service type is required'],
    trim: true,
    enum: [
      'visa-processing',
      'documentation',
      'translation',
      'medical-examination',
      'embassy-liaison',
      'courier-service',
      'consultation',
      'other'
    ]
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  commission: {
    type: Number,
    min: [0, 'Commission cannot be negative'],
    max: [100, 'Commission cannot exceed 100%']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  contactPerson: {
    type: String,
    trim: true,
    maxlength: [100, 'Contact person name cannot exceed 100 characters']
  },
  website: {
    type: String,
    trim: true
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    default: 5
  },
  totalApplications: {
    type: Number,
    default: 0,
    min: [0, 'Total applications cannot be negative']
  },
  successRate: {
    type: Number,
    min: [0, 'Success rate cannot be negative'],
    max: [100, 'Success rate cannot exceed 100%'],
    default: 100
  },
  lastContactDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
SupplierSchema.index({ email: 1 });
SupplierSchema.index({ service: 1, country: 1 });
SupplierSchema.index({ status: 1 });
SupplierSchema.index({ createdAt: -1 });

// Prevent model overwrite issue in dev
const Supplier = mongoose.models.Supplier || mongoose.model<ISupplier>('Supplier', SupplierSchema);
export default Supplier;
