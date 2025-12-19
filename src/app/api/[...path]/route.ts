import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // no caching in dev/proxy

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_API_URL!; // e.g. https://api.example.com

async function forward(req: NextRequest) {
  try {
    const url = new URL(req.url);
    // path after /api/
    const path = url.pathname.replace(/^\/api\/?/, "");
    const target = `${BACKEND}/${path}${url.search}`;

    // Pass through Authorization exactly as you send it (your API wants the raw token)
    const headers: Record<string, string> = {};
    const auth = req.headers.get("authorization");
    if (auth) headers["authorization"] = auth;

    // Forward content-type for non-GET
    const contentType = req.headers.get("content-type");
    if (contentType) headers["content-type"] = contentType;

    let body: BodyInit | undefined = undefined;
    if (req.method !== "GET" && req.method !== "HEAD") {
      // Read the incoming body and forward as-is
      // (works for JSON, text, form-data, etc., since we keep content-type)
      const buf = await req.arrayBuffer();
      if (buf.byteLength > 0) body = Buffer.from(buf);
    }

    const res = await fetch(target, {
      method: req.method,
      headers,
      body,
      cache: "no-store",
    });

    // Try to mirror the response (json/text)
    const resCT = res.headers.get("content-type") || "";
    if (resCT.includes("application/json")) {
      const json = await res.json();
      return NextResponse.json(json, { status: res.status });
    } else {
      const text = await res.text();
      return new NextResponse(text, { status: res.status });
    }
  } catch (err: any) {
    console.error("Proxy error:", err);
    return NextResponse.json(
      { message: "Proxy failed", error: String(err?.message || err) },
      { status: 500 }
    );
  }
}

// Handle all HTTP verbs
export async function GET(req: NextRequest)    { return forward(req); }
export async function POST(req: NextRequest)   { return forward(req); }
export async function PUT(req: NextRequest)    { return forward(req); }
export async function PATCH(req: NextRequest)  { return forward(req); }
export async function DELETE(req: NextRequest) { return forward(req); }
export async function HEAD(req: NextRequest)   { return forward(req); }
