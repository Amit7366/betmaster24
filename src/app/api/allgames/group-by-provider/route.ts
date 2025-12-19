// app/api/allgames/group-by-provider/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const ORIGIN = process.env.BACKEND_API_URL!;
const TIMEOUT_MS = 10_000;

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") || undefined;

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const upstream = await fetch(`${ORIGIN}/allgames/group-by-provider`, {
      headers: {
        Accept: "application/json",
        ...(auth ? { Authorization: auth } : {}),
      },
      cache: "no-store",
      signal: controller.signal,
    });

    const text = await upstream.text();
    const data = text ? JSON.parse(text) : {};

    if (!upstream.ok) {
      return NextResponse.json(
        { message: data?.message || data?.error || "Fetch failed" },
        { status: upstream.status, headers: { "cache-control": "no-store" } }
      );
    }

    return NextResponse.json(data, {
      status: 200,
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
