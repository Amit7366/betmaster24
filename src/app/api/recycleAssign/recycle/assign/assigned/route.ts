import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://bm24api.xyz/api/v1";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);

  const customerOfficerId = url.searchParams.get("customerOfficerId") ?? "";
  const page = url.searchParams.get("page") ?? "1";
  const limit = url.searchParams.get("limit") ?? "20";

  const auth = req.headers.get("authorization") || "";

  const upstream = await fetch(
    `${API_BASE}/RecycleAssign/recycle/assigned?customerOfficerId=${encodeURIComponent(
      customerOfficerId
    )}&page=${encodeURIComponent(page)}&limit=${encodeURIComponent(limit)}`,
    {
      method: "GET",
      headers: { Authorization: auth }, // ✅ token exactly
      cache: "no-store",
    }
  );

  const body = await upstream.text();

  return new NextResponse(body, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("content-type") || "application/json",
    },
  });
}
