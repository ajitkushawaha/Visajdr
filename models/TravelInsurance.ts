import mongoose from 'mongoose';

const travelInsuranceSchema = new mongoose.Schema({
  country: {
    type: String,
    required: true,
    index: true
  },
  planType: {
    type: String,
    enum: ['basic', 'standard', 'premium', 'family'],
    required: true
  },
  coverage: {
    medicalExpenses: {
      type: Number,
      required: true
    },
    tripCancellation: {
      type: Number,
      required: true
    },
    baggageLoss: {
      type: Number,
      required: true
    },
    flightDelay: {
      type: Number,
      required: true
    },
    personalAccident: {
      type: Number,
      required: true
    }
  },
  duration: {
    minDays: {
      type: Number,
      required: true
    },
    maxDays: {
      type: Number,
      required: true
    }
  },
  price: {
    perDay: {
      type: Number,
      required: true
    },
    basePrice: {
      type: Number,
      required: true
    }
  },
  features: [{
    name: String,
    description: String,
    included: Boolean
  }],
  exclusions: [String],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  metaTitle: String,
  metaDescription: String,
  metaKeywords: String
}, {
  timestamps: true
});

export default mongoose.models.TravelInsurance || mongoose.model('TravelInsurance', travelInsuranceSchema);
