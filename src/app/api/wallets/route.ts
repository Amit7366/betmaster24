// app/api/wallets/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const ORIGIN = process.env.NEXT_PUBLIC_BACKEND_API_URL!;
const TIMEOUT_MS = 10_000;

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization");
  if (!token) {
    return NextResponse.json({ message: "Missing Authorization header" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const upstream = await fetch(`${ORIGIN}/wallets`, {
      method: "POST",
      headers: {
        Authorization: token, // or `Bearer ${token}`
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: controller.signal,
    });

    const text = await upstream.text();
    const data = text ? JSON.parse(text) : {};

    if (!upstream.ok) {
      return NextResponse.json(
        { message: data?.message || data?.error || "Create failed" },
        { status: upstream.status }
      );
    }

    // Pass through upstream status (201 or 200), default to 200
    return NextResponse.json(data, {
      status: upstream.status || 200,
      headers: { "cache-control": "no-store" },
    });
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
