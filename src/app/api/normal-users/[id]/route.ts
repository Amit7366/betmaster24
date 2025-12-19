import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const token = _req.headers.get("authorization"); // "Bearer x"

    if (!token) {
      return NextResponse.json(
        { message: "Missing Authorization header" },
        { status: 401 }
      );
    }

    const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/normalUsers/${id}`;

    const res = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Authorization: token, // pass-through
        Accept: "application/json",
      },
      // Avoid caching user profile on edge/CDN
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message || data?.error || "Fetch failed" },
        { status: res.status || 500 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
