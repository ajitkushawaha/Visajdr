import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import GoogleReview from "@/models/GoogleReview";

// GET - Fetch active Google reviews for public display
export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'createTime';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Only fetch active reviews, sorted by rating and date
    const reviews = await GoogleReview.find({ 
      status: 'active' 
    })
    .sort({ rating: -1, createTime: -1 }) // Sort by rating first, then by date
    .limit(limit)
    .select('authorName authorPhotoUrl rating text createTime relativeTimeDescription')
    .lean();

    // Get review statistics for display
    const totalReviews = await GoogleReview.countDocuments({ status: 'active' });
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;

    const ratingDistribution = reviews.reduce((dist, review) => {
      dist[review.rating] = (dist[review.rating] || 0) + 1;
      return dist;
    }, {} as { [key: number]: number });

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        stats: {
          totalReviews,
          averageRating: Math.round(averageRating * 10) / 10,
          ratingDistribution
        }
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching public Google reviews:", error);
    return NextResponse.json({ 
      error: "Failed to fetch reviews" 
    }, { status: 500 });
  }
}
