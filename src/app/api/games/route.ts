// app/api/games/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const base = process.env.NEXT_PUBLIC_BACKEND_API_URL!;
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const provider = searchParams.get("provider"); // optional

  if (!category) {
    return NextResponse.json({ message: "Missing category" }, { status: 400 });
  }

  const qs = new URLSearchParams({ category });
  if (provider) qs.set("provider", provider);

  const auth = req.headers.get("authorization") || ""; // pass-through if present

  try {
    const res = await fetch(`${base}/allgames?${qs.toString()}`, {
      headers: { Accept: "application/json", Authorization: auth },
      cache: "no-store",
      // You can add a manual AbortController timeout here if desired.
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message || "Failed to fetch games" },
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
