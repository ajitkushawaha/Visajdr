import mongoose, { Schema, Document } from 'mongoose';

export interface BrandLogo {
  _id?: string;
  name: string;
  imagePath: string; // Stores PNG file path
  website?: string;
  status: "active" | "inactive";
  order: number;
}

export interface BrandCollaborationSection extends Document {
  title: string;
  subtitle?: string;
  description?: string;
  logos: BrandLogo[];
  status: "active" | "inactive";
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const BrandLogoSchema = new Schema<BrandLogo>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  imagePath: {
    type: String,
    required: true
  },
  website: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  },
  order: {
    type: Number,
    default: 0
  }
});

const BrandCollaborationSchema = new Schema<BrandCollaborationSection>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  subtitle: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  logos: [BrandLogoSchema],
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.models.BrandCollaboration || mongoose.model<BrandCollaborationSection>('BrandCollaboration', BrandCollaborationSchema);
