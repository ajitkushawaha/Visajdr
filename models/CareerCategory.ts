import mongoose from 'mongoose';

const CareerCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  description: String,
  metaTitle: String,
  metaDescription: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.CareerCategory || mongoose.model('CareerCategory', CareerCategorySchema);