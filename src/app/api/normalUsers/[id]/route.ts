// app/api/normalUsers/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const ORIGIN = process.env.NEXT_PUBLIC_BACKEND_API_URL!; // server-only env var
const TIMEOUT_MS = 12_000;

async function readJSON(res: Response) {
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

function requireAuth(req: NextRequest) {
  const token = req.headers.get("authorization");
  if (!token) {
    return { error: NextResponse.json({ message: "Missing Authorization header" }, { status: 401 }) };
  }
  return { token };
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(req);
  if ("error" in auth) return auth.error;

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const upstream = await fetch(`${ORIGIN}/normalUsers/${params.id}`, {
      headers: {
        // If your backend expects Bearer: Authorization: `Bearer ${auth.token}`
        Authorization: auth.token as string,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: controller.signal,
    });

    const data = await readJSON(upstream);

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

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(req);
  if ("error" in auth) return auth.error;

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const upstream = await fetch(`${ORIGIN}/normalUsers/${params.id}`, {
      method: "PATCH",
      headers: {
        Authorization: auth.token as string, // or `Bearer ${auth.token}`
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: controller.signal,
    });

    const data = await readJSON(upstream);

    if (!upstream.ok) {
      return NextResponse.json(
        { message: data?.message || data?.error || "Profile update failed" },
        { status: upstream.status }
      );
    }

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
