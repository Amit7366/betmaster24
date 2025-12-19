import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // avoid caching
export const runtime = "nodejs";        // ensure Node runtime

// Prefer a server-only env var; fall back to the public one if needed
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_API_URL!;
const TARGET = `${BACKEND}/transaction/deposit/manual`;

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization") || "";
    const body = await req.json();

    const resp = await fetch(TARGET, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(auth ? { authorization: auth } : {}), // pass token as-is (no forced "Bearer ")
      },
      body: JSON.stringify(body),
    });

    const text = await resp.text();
    const contentType = resp.headers.get("content-type") || "application/json";
    return new NextResponse(text, { status: resp.status, headers: { "content-type": contentType } });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Proxy error" },
      { status: 500 }
    );
  }
}

// Optional: help some tools by responding to OPTIONS
export function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
