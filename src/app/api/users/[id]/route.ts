// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";           // ✅ consistent server runtime
export const dynamic = "force-dynamic";    // ✅ disable caching

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = req.headers.get("authorization") || ""; // "Bearer xxx"
  const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/normalUsers/${params.id}`;

  const res = await fetch(backendUrl, {
    method: "GET",
    headers: {
      Authorization: auth,                  // ✅ forward Bearer token
      Accept: "application/json",
    },
    cache: "no-store",                      // ✅ no cache
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status || 500 });
}
