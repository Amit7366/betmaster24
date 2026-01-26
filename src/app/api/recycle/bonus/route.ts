import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "https://bm24api.xyz/api/v1";

function normalizeAuth(auth: string) {
  const v = (auth || "").trim();
  if (!v) return "";
  // if already "Bearer xxx" keep it, otherwise keep as-is (your current style)
  return v;
}

export async function POST(req: NextRequest) {
  try {
    const auth = normalizeAuth(req.headers.get("authorization") || "");
    const body = await req.json();

    // ✅ enforce API doc shape (optional but recommended)
    const payload = {
      userId: body?.userId,
      amount: body?.amount,
    };

    if (!payload.userId || typeof payload.amount !== "number") {
      return NextResponse.json(
        { success: false, message: "Invalid body. Expected { userId, amount }" },
        { status: 400 }
      );
    }

    const upstream = await fetch(`${BASE_URL}/recycle/retention/bonus`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(auth ? { Authorization: auth } : {}),
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const contentType = upstream.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await upstream.json()
      : await upstream.text();

    if (!upstream.ok) {
      const msg =
        typeof data === "string"
          ? data
          : data?.message || data?.error || `Upstream error: ${upstream.status}`;
      return NextResponse.json(
        { success: false, message: msg, statusCode: upstream.status },
        { status: upstream.status }
      );
    }

    // pass-through success response
    return NextResponse.json(data, { status: upstream.status });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Proxy failed." },
      { status: 500 }
    );
  }
}
