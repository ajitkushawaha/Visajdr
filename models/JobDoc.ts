import { Schema, model, models, Document } from "mongoose";

export interface IJobDoc extends Document {
  title: string;
  categories: string;
  location: string;
  type: string;
  experience: string;
  salary?: string;
  description: string;
  requirements: string;
  status: "active" | "inactive";
}

const JobDocSchema = new Schema<IJobDoc>(
  {
    title: { type: String, required: true, trim: true },
    categories: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    experience: { type: String, required: true, trim: true },
    salary: { type: String, trim: true },
    description: { type: String, required: true, trim: true },
    requirements: { type: String, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

// ✅ Default export for Next.js hot reload safety
const JobDoc = models.JobDoc || model<IJobDoc>("JobDoc", JobDocSchema);

export default JobDoc;
