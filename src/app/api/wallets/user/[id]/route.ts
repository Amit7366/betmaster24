// app/api/wallets/user/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const ORIGIN = process.env.NEXT_PUBLIC_BACKEND_API_URL!; // server-only env var
const TIMEOUT_MS = 10_000;

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.headers.get("authorization");
  if (!token) {
    return NextResponse.json({ message: "Missing Authorization header" }, { status: 401 });
  }

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const upstream = await fetch(`${ORIGIN}/wallets/user/${params.id}`, {
      headers: {
        // If your backend expects Bearer, change to: Authorization: `Bearer ${token}`,
        Authorization: token,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: controller.signal,
    });

    const text = await upstream.text();
    const data = text ? JSON.parse(text) : {};

    if (!upstream.ok) {
      return NextResponse.json(
        { message: data?.message || data?.error || "Fetch failed" },
        { status: upstream.status }
      );
    }

    return NextResponse.json(data, { status: 200, headers: { "cache-control": "no-store" } });
  } catch (err: any) {
    const isTimeout = err?.name === "AbortError";
    return NextResponse.json(
      { message: isTimeout ? "Upstream timeout" : err?.message || "Unexpected error" },
      { status: isTimeout ? 504 : 500 }
    );
  } finally {
    clearTimeout(t);
  }
}
