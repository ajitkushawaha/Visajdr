import mongoose, { Schema, Document } from "mongoose";

export interface IServiceCard extends Document {
  name: string;
  price: string;
  image: string;
  deliveryDays: number;
  type: string;
  country: string;
  countryFlag?: string;
  countryCode?: string;
  status: "active" | "inactive";
  order: number;
  description?: string;
  features?: string[];
  hotListed?: boolean;
  eVisa?: boolean;
  processingTime?: string;
  stayPeriod?: string;
  validity?: string;
  occupancyType?: string;
  pricingOptions?: {
    day: number;
    week: number;
    schengen: number;
  };
}

export interface IServiceFilter extends Document {
  name: string;
  value: string;
  icon: string;
  order: number;
  status: "active" | "inactive";
}

export interface IServiceCategory extends Document {
  id: string;
  title: string;
  description: string;
  icon: string;
  services: Array<{
    name: string;
    description: string;
  }>;
  features: string[];
  status: "active" | "inactive";
  order: number;
}

export interface IServicesSection extends Document {
  title: string;
  subtitle?: string;
  description?: string;
  status: "active" | "inactive";
  order: number;
}

const ServiceCardSchema = new Schema<IServiceCard>({
  name: { type: String, required: true },
  price: { type: String, required: true },
  image: { type: String, required: true },
  deliveryDays: { type: Number, required: true, default: 1 },
  type: { type: String, required: true },
  country: { type: String, required: true },
  countryFlag: { type: String },
  countryCode: { type: String },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  order: { type: Number, default: 0 },
  description: { type: String },
  features: [{ type: String }],
  hotListed: { type: Boolean, default: false },
  eVisa: { type: Boolean, default: false },
  processingTime: { type: String },
  stayPeriod: { type: String },
  validity: { type: String },
  occupancyType: { type: String },
  pricingOptions: {
    day: { type: Number },
    week: { type: Number },
    schengen: { type: Number }
  }
}, { _id: true });

const ServiceFilterSchema = new Schema<IServiceFilter>({
  name: { type: String, required: true },
  value: { type: String, required: true },
  icon: { type: String, required: true },
  order: { type: Number, default: 0 },
  status: { type: String, enum: ["active", "inactive"], default: "active" }
}, { _id: true });

const ServiceCategorySchema = new Schema<IServiceCategory>({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  services: [{
    name: { type: String, required: true },
    description: { type: String, required: true }
  }],
  features: [{ type: String }],
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  order: { type: Number, default: 0 }
}, { _id: true });

const ServicesSectionSchema = new Schema<IServicesSection>(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    description: { type: String },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.models.ServicesSection || mongoose.model<IServicesSection>("ServicesSection", ServicesSectionSchema);
