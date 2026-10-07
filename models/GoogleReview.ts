import mongoose, { Schema, Document } from "mongoose";

export interface IGoogleReview extends Document {
  reviewId: string; // Google's unique review ID
  authorName: string;
  authorPhotoUrl?: string;
  rating: number; // 1-5 stars
  text?: string; // Review text content
  createTime: Date; // When the review was created on Google
  synced: boolean; // Whether this review was synced from Google
  status: "active" | "inactive"; // Whether to show this review publicly
  placeId?: string; // Google Place ID for reference
  language?: string; // Review language
  originalLanguage?: string; // Original language if translated
  relativeTimeDescription?: string; // "2 months ago" etc.
}

const GoogleReviewSchema = new Schema<IGoogleReview>(
  {
    reviewId: { 
      type: String, 
      required: true, 
      unique: true,
      index: true 
    },
    authorName: { 
      type: String, 
      required: true 
    },
    authorPhotoUrl: { 
      type: String 
    },
    rating: { 
      type: Number, 
      required: true,
      min: 1,
      max: 5
    },
    text: { 
      type: String 
    },
    createTime: { 
      type: Date, 
      required: true 
    },
    synced: { 
      type: Boolean, 
      default: true 
    },
    status: { 
      type: String, 
      enum: ["active", "inactive"], 
      default: "active" 
    },
    placeId: { 
      type: String 
    },
    language: { 
      type: String 
    },
    originalLanguage: { 
      type: String 
    },
    relativeTimeDescription: { 
      type: String 
    }
  },
  { 
    timestamps: true 
  }
);

// Index for efficient queries
GoogleReviewSchema.index({ status: 1, rating: -1, createTime: -1 });
GoogleReviewSchema.index({ placeId: 1 });

export default mongoose.models.GoogleReview || mongoose.model<IGoogleReview>("GoogleReview", GoogleReviewSchema);
