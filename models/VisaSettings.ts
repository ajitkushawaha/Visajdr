import mongoose, { Schema, Document } from "mongoose";

interface IVisaSettings extends Document {
  category: string;
  name: string;
  description: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  isActive: boolean;
  order: number;
  validation?: {
    min?: number;
    max?: number;
    required?: boolean;
    pattern?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const VisaSettingsSchema = new Schema<IVisaSettings>(
  {
    category: {
      type: String,
      required: true,
      enum: ['general', 'processing', 'pricing', 'notifications', 'security', 'email', 'database', 'api'],
      index: true
    },
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    value: {
      type: Schema.Types.Mixed,
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ['string', 'number', 'boolean', 'array', 'object'],
      default: 'string'
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    order: {
      type: Number,
      default: 0,
      index: true
    },
    validation: {
      min: Number,
      max: Number,
      required: Boolean,
      pattern: String
    }
  },
  { 
    timestamps: true,
    collection: 'visasettings'
  }
);

// Indexes for better performance
VisaSettingsSchema.index({ category: 1, order: 1 });
VisaSettingsSchema.index({ isActive: 1, category: 1 });

// Pre-save middleware to validate value based on type
VisaSettingsSchema.pre('save', function(next) {
  if (this.isModified('value')) {
    switch (this.type) {
      case 'number':
        if (typeof this.value !== 'number' && !isNaN(Number(this.value))) {
          this.value = Number(this.value);
        } else if (typeof this.value !== 'number') {
          return next(new Error(`Value must be a number for setting: ${this.name}`));
        }
        break;
      case 'boolean':
        if (typeof this.value !== 'boolean') {
          this.value = Boolean(this.value);
        }
        break;
      case 'array':
        if (!Array.isArray(this.value)) {
          return next(new Error(`Value must be an array for setting: ${this.name}`));
        }
        break;
      case 'object':
        if (typeof this.value !== 'object' || Array.isArray(this.value)) {
          return next(new Error(`Value must be an object for setting: ${this.name}`));
        }
        break;
      default: // string
        this.value = String(this.value);
    }
  }
  next();
});

export default mongoose.models.VisaSettings || mongoose.model<IVisaSettings>("VisaSettings", VisaSettingsSchema);
