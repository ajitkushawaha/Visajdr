import mongoose, { Schema, Document } from 'mongoose';

export interface CTAStatCard {
  _id?: string;
  title: string;
  value: string;
  description: string;
  backgroundColor: string;
  textColor?: string;
  order: number;
  status: "active" | "inactive";
}

export interface CTASection extends Document {
  // Header Section
  iconPath: string;
  badgeText: string;
  title: string;
  subtitle?: string;
  
  // Background
  backgroundImagePath: string;
  backgroundColor?: string;
  
  // Stats Cards
  stats: CTAStatCard[];
  
  // Section Settings
  status: "active" | "inactive";
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const CTAStatCardSchema = new Schema<CTAStatCard>({
  title: { type: String, required: true, trim: true },
  value: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  backgroundColor: { type: String, required: true, trim: true },
  textColor: { type: String, trim: true },
  order: { type: Number, default: 0 },
  status: { type: String, enum: ["active", "inactive"], default: "active" }
});

const CTASectionSchema = new Schema<CTASection>({
  // Header Section
  iconPath: { type: String, required: true, trim: true },
  badgeText: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  subtitle: { type: String, trim: true },
  
  // Background
  backgroundImagePath: { type: String, required: true, trim: true },
  backgroundColor: { type: String, trim: true },
  
  // Stats Cards
  stats: [CTAStatCardSchema],
  
  // Section Settings
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  order: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.CTASection || mongoose.model<CTASection>('CTASection', CTASectionSchema);
