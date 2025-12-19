import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const base = process.env.NEXT_PUBLIC_BACKEND_API_URL!; // e.g. https://your-backend.com
  const { searchParams } = new URL(req.url);

  // pass through provider and optional category
  const provider = searchParams.get("provider") ?? "";
  const category = searchParams.get("category");

  const qs = new URLSearchParams();
  if (provider) qs.set("provider", provider);
  if (category) qs.set("category", category);

  const url = `${base}/allgames?${qs.toString()}`;

  const auth = req.headers.get("authorization") ?? ""; // token only is fine
  const res = await fetch(url, {
    headers: auth ? { Authorization: auth } : undefined,
    cache: "no-store",
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
