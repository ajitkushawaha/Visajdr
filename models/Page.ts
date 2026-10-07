// models/Page.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IPage extends Document {
  title: string;
  slug: string;
  description: string;
  content: string;
  status: "active" | "inactive" | "draft";
  order: number;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  featuredImage: string;
  category: string;
  tags: string[];
  author: string;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PageSchema = new Schema<IPage>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    content: { type: String },
    status: { 
      type: String, 
      enum: ["active", "inactive", "draft"], 
      default: "draft" 
    },
    order: { type: Number, default: 0 },
    metaTitle: { type: String },
    metaDescription: { type: String },
    metaKeywords: { type: String },
    featuredImage: { type: String },
    category: { type: String, default: "general" },
    tags: [{ type: String }],
    author: { type: String },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

// Create index for ordering
PageSchema.index({ order: 1, status: 1 });

export default mongoose.models.Page || mongoose.model<IPage>("Page", PageSchema);
