// app/api/proxy/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";

// Use Node runtime for widest TLS compatibility.
export const runtime = "nodejs";

// Keep this server-only (DON'T prefix with NEXT_PUBLIC)
const ORIGIN = process.env.BACKEND_API_URL!; // e.g. https://your-backend.example.com

function targetUrl(req: NextRequest) {
    // Strip the /api/proxy prefix and forward the rest
    const path = req.nextUrl.pathname.replace(/^\/api\/proxy/, "") || "/";
    const url = new URL(path, ORIGIN);
    // instead of looping over search params:
    url.search = req.nextUrl.search; // ✅ copies everything, preserves duplicates
    return url;
}

export async function GET(req: NextRequest) {
    const url = targetUrl(req);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    try {
        const upstream = await fetch(url.toString(), {
            method: "GET",
            headers: {
                // Forward auth if you need it; otherwise remove this line
                authorization: req.headers.get("authorization") ?? "",
                accept: "application/json",
            },
            // Avoid browser caches getting stuck on mobile networks
            cache: "no-store",
            signal: controller.signal,
        });

        const body = await upstream.text();

        return new NextResponse(body, {
            status: upstream.status,
            headers: {
                // Preserve content-type if upstream returns JSON
                "content-type": upstream.headers.get("content-type") ?? "application/json",
                // Reasonable CDN cache; adjust to your needs
                "cache-control": "s-maxage=60, stale-while-revalidate=300",
            },
        });
    } catch (err: any) {
        // Surface a clean error to the client rather than a vague "Failed to fetch"
        const isTimeout = err?.name === "AbortError";
        return NextResponse.json(
            {
                success: false,
                message: isTimeout ? "Upstream timeout" : "Upstream fetch failed",
                hint: "Check ORIGIN, TLS, or network connectivity",
            },
            { status: isTimeout ? 504 : 502 }
        );
    } finally {
        clearTimeout(timeout);
    }
}
