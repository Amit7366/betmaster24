// ✅ 1) NEXT.JS PROXY ROUTE (App Router)
// File: src/app/api/spin/status/[id]/route.ts

import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const token = _req.headers.get("authorization"); // expects: Bearer xxx
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Missing Authorization header" },
      { status: 401 }
    );
  }

  const upstream = await fetch(
    `https://bm24api.xyz/api/v1/spin/status/${params.id}`,
    {
      method: "GET",
      headers: { Authorization: token },
      cache: "no-store",
    }
  );

  const data = await upstream.json();
  return NextResponse.json(data, { status: upstream.status });
}
