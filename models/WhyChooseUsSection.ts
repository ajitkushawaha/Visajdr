import mongoose, { Schema, Document } from "mongoose";

export interface IWhyChooseUsFeature extends Document {
  title: string;
  description: string;
  icon: string; // Lucide icon name
  backgroundColor?: string; // For special styling like the dark card
  textColor?: string;
  iconColor?: string;
  status: "active" | "inactive";
  order: number;
}

export interface IWhyChooseUsSection extends Document {
  title: string;
  subtitle?: string;
  description: string;
  backgroundImage?: string;
  features: IWhyChooseUsFeature[];
  status: "active" | "inactive";
  order: number;
}

const WhyChooseUsFeatureSchema = new Schema<IWhyChooseUsFeature>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  backgroundColor: { type: String },
  textColor: { type: String },
  iconColor: { type: String },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  order: { type: Number, default: 0 }
}, { _id: true });

const WhyChooseUsSectionSchema = new Schema<IWhyChooseUsSection>(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    description: { type: String, required: true },
    backgroundImage: { type: String },
    features: [WhyChooseUsFeatureSchema],
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.models.WhyChooseUsSection || mongoose.model<IWhyChooseUsSection>("WhyChooseUsSection", WhyChooseUsSectionSchema);

