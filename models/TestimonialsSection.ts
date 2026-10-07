import mongoose, { Schema, Document } from 'mongoose';

export interface Testimonial {
  _id?: string;
  text: string;
  name: string;
  date: string;
  rating?: number;
  avatar?: string;
  order: number;
  status: "active" | "inactive";
}

export interface TestimonialsSection extends Document {
  // Header Section
  badgeText: string;
  title: string;
  description: string;
  
  // Background
  backgroundImagePath: string;
  backgroundColor?: string;
  
  // Stats Cards
  stats: {
    title: string;
    value: string;
    description: string;
    backgroundColor: string;
    textColor?: string;
    position: "left" | "right" | "center";
    order: number;
    status: "active" | "inactive";
  }[];
  
  // Testimonials
  testimonials: Testimonial[];
  
  // Section Settings
  status: "active" | "inactive";
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema = new Schema<Testimonial>({
  text: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  date: { type: String, required: true, trim: true },
  rating: { type: Number, min: 1, max: 5 },
  avatar: { type: String, trim: true },
  order: { type: Number, default: 0 },
  status: { type: String, enum: ["active", "inactive"], default: "active" }
});

const TestimonialsSectionSchema = new Schema<TestimonialsSection>({
  // Header Section
  badgeText: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  
  // Background
  backgroundImagePath: { type: String, required: true, trim: true },
  backgroundColor: { type: String, trim: true },
  
  // Stats Cards
  stats: [{
    title: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    backgroundColor: { type: String, required: true, trim: true },
    textColor: { type: String, trim: true },
    position: { type: String, enum: ["left", "right", "center"], default: "left" },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" }
  }],
  
  // Testimonials
  testimonials: [TestimonialSchema],
  
  // Section Settings
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  order: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.TestimonialsSection || mongoose.model<TestimonialsSection>('TestimonialsSection', TestimonialsSectionSchema);
