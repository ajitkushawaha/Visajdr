import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import JobDoc from "@/models/JobDoc"; // ✅ now works
import { z } from "zod";

const jobSchema = z.object({
  jobTitle: z.string().min(1, "Job title is required"),
  categories: z.string().min(1, "Category is required"),
  location: z.string().min(1),
  jobType: z.string().min(1),
  experience: z.string().optional(),
  salary: z.string().optional(),
  description: z.string().optional(),
  requirements: z.string().optional(),
  status: z.enum(["active", "inactive"]),
});

export async function POST(request: NextRequest) {
  try {
    await connectDb();
    const body = await request.json();

    // validate with zod
    const parsed = jobSchema.parse(body);

    const newJob = new JobDoc({
      title: parsed.jobTitle,
      categories: parsed.categories,
      location: parsed.location,
      type: parsed.jobType,
      experience: parsed.experience,
      salary: parsed.salary,
      description: parsed.description,
      requirements: parsed.requirements || '',
      status: parsed.status,
    });

    await newJob.save();
    return NextResponse.json(newJob, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create job:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    if (error.name === "ValidationError") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }
}


export async function GET(request: NextRequest) {
  try {
    await connectDb();

    const { searchParams } = new URL(request.url);

    // query params
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sort = searchParams.get("sort") || "createdAt";
    const dir = searchParams.get("dir") === "asc" ? 1 : -1;

    const key = searchParams.get("key");
    const value = searchParams.get("value");
    const category = searchParams.get("category");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    // build query
    const query: any = {};

    // Handle category filtering (new method)
    if (category) {
      query.categories = { $regex: category, $options: "i" };
    }

    // Handle legacy key-value filtering
    if (key && value) {
      if (["jobTitle", "department", "location", "status"].includes(key)) {
        query[key] = { $regex: value, $options: "i" }; // case-insensitive search
      }
    }

    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    // count for pagination
    const total = await JobDoc.countDocuments(query);

    // fetch jobs
    const jobs = await JobDoc.find(query)
      .sort({ [sort]: dir })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const pages = Math.ceil(total / limit);

    return NextResponse.json(
      { rows: jobs, total, pages, page },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Failed to fetch jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

