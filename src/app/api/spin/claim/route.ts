// ✅ after you get `data` successfully (after the cooldown checks),
// call CLAIM API via your NEXT proxy route (recommended)

// 1) Create proxy route:
// File: src/app/api/spin/claim/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const token = req.headers.get("authorization"); // Bearer xxx
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Missing Authorization header" },
      { status: 401 }
    );
  }

  const body = await req.json();

  const upstream = await fetch("https://bm24api.xyz/api/v1/spin/claim", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = await upstream.json();
  return NextResponse.json(data, { status: upstream.status });
}
