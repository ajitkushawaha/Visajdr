import mongoose, { Schema, Document } from "mongoose";

export interface IVisaCoupon extends Document {
  code: string;
  name: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minAmount?: number;
  maxDiscount?: number;
  applicableVisas: string[];
  applicableCountries: string[];
  startDate: Date;
  endDate: Date;
  usageLimit?: number;
  usedCount: number;
  status: 'active' | 'inactive' | 'expired';
  createdAt: Date;
  updatedAt: Date;
}

const VisaCouponSchema = new Schema<IVisaCoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    discountType: {
      type: String,
      required: true,
      enum: ['percentage', 'fixed']
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0
    },
    minAmount: {
      type: Number,
      min: 0
    },
    maxDiscount: {
      type: Number,
      min: 0
    },
    applicableVisas: [{
      type: String,
      trim: true
    }],
    applicableCountries: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    usageLimit: {
      type: Number,
      min: 1
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'inactive', 'expired'],
      default: 'active'
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better performance
// Note: code index is already created by unique: true in schema
VisaCouponSchema.index({ status: 1 });
VisaCouponSchema.index({ startDate: 1, endDate: 1 });
VisaCouponSchema.index({ applicableCountries: 1 });
VisaCouponSchema.index({ applicableVisas: 1 });

// Virtual for checking if coupon is expired
VisaCouponSchema.virtual('isExpired').get(function() {
  return new Date() > this.endDate;
});

// Virtual for checking if coupon is active
VisaCouponSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.status === 'active' && 
         now >= this.startDate && 
         now <= this.endDate &&
         (!this.usageLimit || this.usedCount < this.usageLimit);
});

// Pre-save middleware to update status based on dates
VisaCouponSchema.pre('save', function(next) {
  const now = new Date();
  
  if (this.status === 'active' && now > this.endDate) {
    this.status = 'expired';
  }
  
  next();
});

// Static method to find active coupons
VisaCouponSchema.statics.findActive = function() {
  const now = new Date();
  return this.find({
    status: 'active',
    startDate: { $lte: now },
    endDate: { $gte: now }
  });
};

// Static method to find applicable coupons
VisaCouponSchema.statics.findApplicable = function(country: string, visaType: string) {
  const now = new Date();
  return this.find({
    status: 'active',
    startDate: { $lte: now },
    endDate: { $gte: now },
    $and: [
      {
        $or: [
          { applicableCountries: { $in: [country.toLowerCase()] } },
          { applicableCountries: { $size: 0 } } // No country restriction
        ]
      },
      {
        $or: [
          { applicableVisas: { $in: [visaType] } },
          { applicableVisas: { $size: 0 } } // No visa type restriction
        ]
      }
    ]
  });
};

export default mongoose.models.VisaCoupon || mongoose.model<IVisaCoupon>("VisaCoupon", VisaCouponSchema);
