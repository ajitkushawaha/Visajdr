import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import TravelInsurance from '@/models/TravelInsurance';

export async function GET() {
  try {
    await connectDB();

    const insurancePlans = await TravelInsurance.find({ status: 'active' })
      .select('country planType coverage duration price features')
      .sort({ country: 1, price: 1 });

    // Group plans by country
    const groupedPlans = insurancePlans.reduce((acc, plan) => {
      if (!acc[plan.country]) {
        acc[plan.country] = [];
      }
      acc[plan.country].push({
        id: plan._id,
        planType: plan.planType,
        coverage: plan.coverage,
        duration: plan.duration,
        price: plan.price,
        features: plan.features
      });
      return acc;
    }, {} as Record<string, any[]>);

    return NextResponse.json({
      success: true,
      plans: groupedPlans
    });

  } catch (error) {
    console.error('Error fetching travel insurance plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch travel insurance plans' },
      { status: 500 }
    );
  }
}
