import mongoose, { Schema, Document } from "mongoose";

export interface IHeroSection extends Document {
  title: string;
  description?: string;
  highlightedText?: string;
  highlightedTextColor?: string;
  backgroundImage?: string;
  mainImage?: string;
  mainImageAlt?: string;
  bottomLabel?: string;
  searchPlaceholder?: string;
  floatingCountries: Array<{
    country: string;
    flag: string;
    position: string;
  }>;
  status: "active" | "inactive";
  order: number;
}

const HeroSectionSchema = new Schema<IHeroSection>(
  {
    title: { type: String, required: true },
    description: { type: String },
    highlightedText: { type: String, default: "Visa4" },
    highlightedTextColor: { type: String, default: "text-red-500" },
    backgroundImage: { type: String },
    mainImage: { type: String },
    mainImageAlt: { type: String },
    bottomLabel: { type: String },
    searchPlaceholder: { type: String },
    floatingCountries: [{
      country: { type: String, required: true },
      flag: { type: String, required: true },
      position: { 
        type: String, 
        enum: ["top-left", "top-right", "center-left", "center-right", "bottom-left", "bottom-right"],
        required: true 
      }
    }],
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.models.HeroSection || mongoose.model<IHeroSection>("HeroSection", HeroSectionSchema);
