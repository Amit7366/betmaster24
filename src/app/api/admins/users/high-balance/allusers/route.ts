import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const ORIGIN = process.env.NEXT_PUBLIC_BACKEND_API_URL!;
const TIMEOUT_MS = 10_000;

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization");
  if (!token) {
    return NextResponse.json(
      { message: "Missing Authorization header" },
      { status: 401 }
    );
  }

  const upstreamUrl = new URL(`${ORIGIN}/admins/users/high-balance/allusers`);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: {
        Authorization: token,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: controller.signal,
    });

    const text = await upstream.text();
    const data = text ? JSON.parse(text) : {};

    return NextResponse.json(data, {
      status: upstream.status,
      headers: { "cache-control": "no-store" },
    });
  } catch (err: any) {
    const isTimeout = err?.name === "AbortError";
    return NextResponse.json(
      { message: isTimeout ? "Timeout" : err?.message || "Unexpected error" },
      { status: isTimeout ? 504 : 500 }
    );
  } finally {
    clearTimeout(timeout);
  }
}
