import mongoose, { Schema, Document } from 'mongoose';

interface TermSection {
  _id?: string;
  title: string;
  content: string; // Markdown or rich text content
  order: number;
  status: "active" | "inactive";
}

export interface ITermsOfServicePage extends Document {
  // Page Meta
  title: string;
  subtitle: string;
  lastUpdated: Date;
  effectiveDate: Date;
  
  // Introduction
  introduction: string;
  
  // Terms Sections
  sections: TermSection[];
  
  // Contact Information
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  legalDepartmentEmail?: string;
  
  // Additional Info
  noteText?: string;
  
  // Meta
  status: "active" | "inactive";
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const TermSectionSchema = new Schema<TermSection>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  order: { type: Number, default: 0 },
  status: { type: String, enum: ["active", "inactive"], default: "active" }
});

const TermsOfServicePageSchema = new Schema<ITermsOfServicePage>({
  // Page Meta
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  lastUpdated: { type: Date, required: true, default: Date.now },
  effectiveDate: { type: Date, required: true, default: Date.now },
  
  // Introduction
  introduction: { type: String, required: true },
  
  // Terms Sections
  sections: [TermSectionSchema],
  
  // Contact Information
  contactEmail: { type: String, required: true },
  contactPhone: { type: String, required: true },
  contactAddress: { type: String, required: true },
  legalDepartmentEmail: { type: String },
  
  // Additional Info
  noteText: { type: String },
  
  // Meta
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  order: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.TermsOfServicePage || mongoose.model<ITermsOfServicePage>('TermsOfServicePage', TermsOfServicePageSchema);
