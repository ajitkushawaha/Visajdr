import mongoose, { Schema, Document } from "mongoose";

export interface ITrustVisaAgentSection extends Document {
  title: string;
  content: string; // The detailed content about choosing visa agents
  highlightedTexts?: Array<{
    text: string;
    color: string;
  }>; // Array of texts to highlight with their colors
  imageUrl?: string;
  imageAlt?: string;
  status: "active" | "inactive";
  order: number;
}

const TrustVisaAgentSectionSchema = new Schema<ITrustVisaAgentSection>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    highlightedTexts: [{
      text: { type: String, required: true },
      color: { type: String, required: true }
    }], // Array of texts to highlight with their colors
    imageUrl: { type: String },
    imageAlt: { type: String },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.models.TrustVisaAgentSection || mongoose.model<ITrustVisaAgentSection>("TrustVisaAgentSection", TrustVisaAgentSectionSchema);
