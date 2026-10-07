import mongoose, { Schema, Document } from 'mongoose';

interface PolicySection {
  _id?: string;
  title: string;
  content: string; // Markdown or rich text content
  order: number;
  status: "active" | "inactive";
}

export interface IPrivacyPolicyPage extends Document {
  // Page Meta
  title: string;
  subtitle: string;
  lastUpdated: Date;
  effectiveDate: Date;
  
  // Introduction
  introduction: string;
  
  // Policy Sections
  sections: PolicySection[];
  
  // Contact Information
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  dpoEmail?: string; // Data Protection Officer email
  
  // Additional Info
  noteText?: string;
  
  // Meta
  status: "active" | "inactive";
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const PolicySectionSchema = new Schema<PolicySection>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  order: { type: Number, default: 0 },
  status: { type: String, enum: ["active", "inactive"], default: "active" }
});

const PrivacyPolicyPageSchema = new Schema<IPrivacyPolicyPage>({
  // Page Meta
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  lastUpdated: { type: Date, required: true, default: Date.now },
  effectiveDate: { type: Date, required: true, default: Date.now },
  
  // Introduction
  introduction: { type: String, required: true },
  
  // Policy Sections
  sections: [PolicySectionSchema],
  
  // Contact Information
  contactEmail: { type: String, required: true },
  contactPhone: { type: String, required: true },
  contactAddress: { type: String, required: true },
  dpoEmail: { type: String },
  
  // Additional Info
  noteText: { type: String },
  
  // Meta
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  order: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.PrivacyPolicyPage || mongoose.model<IPrivacyPolicyPage>('PrivacyPolicyPage', PrivacyPolicyPageSchema);
