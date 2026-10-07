// app/api/companies/route.ts
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic'
export const fetchCache = 'default-no-store'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";

  const res = await fetch(
    `https://autocomplete.clearbit.com/v1/companies/suggest?query=${query}`
  );
  const data = await res.json();

  return NextResponse.json(data);
}
