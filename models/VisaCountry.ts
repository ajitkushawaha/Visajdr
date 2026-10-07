// models/VisaCountry.ts

import mongoose from "mongoose";

const VisaCountrySchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  label: { type: String, required: true },
  flag: { type: String },
  price: { type: String, required: true },
  processingDays: { type: Number, required: true },
});

export default mongoose.models.VisaCountry || mongoose.model("VisaCountry", VisaCountrySchema);
