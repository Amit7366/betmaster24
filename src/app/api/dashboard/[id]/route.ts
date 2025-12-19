// app/api/dashboard/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

const BEARER = /^Bearer\s+/i;

function getBearer(req: NextRequest) {
  const raw = req.headers.get("authorization") || "";
  const token = raw.replace(BEARER, ""); // strip Bearer if present
  return token ? `${token}` : null; // always re-add Bearer
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getBearer(req);
  if (!auth) {
    return NextResponse.json({ message: "Missing Authorization header" }, { status: 401 });
  }

  const base = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!base) {
    return NextResponse.json({ message: "Server misconfig: NEXT_PUBLIC_BACKEND_API_URL is not set" }, { status: 500 });
  }

  const urls = {
    user:    `${base}/normalUsers/${params.id}`,
    balance: `${base}/transaction/balance/${params.id}`,
    promo:   `${base}/admins/promotion-summary/${params.id}`,
  };

  // Small helper with per-request timeout
  const fetchWithTimeout = (url: string, timeoutMs: number) => {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    return fetch(url, { headers: { Authorization: auth, Accept: "application/json" }, cache: "no-store", signal: controller.signal })
      .finally(() => clearTimeout(t));
  };

  try {
    // Make promo optional + fast timeout so it never blocks user/balance
    const promoP = fetchWithTimeout(urls.promo, 2000)
      .then(async r => ({ ok: r.ok, status: r.status, body: await r.json().catch(() => ({})) }))
      .catch((e: any) => ({ ok: false, status: 504, body: { message: e?.name === "AbortError" ? "Promo timed out" : e?.message } }));

    const [userRes, balanceRes] = await Promise.all([
      fetchWithTimeout(urls.user, 8000),
      fetchWithTimeout(urls.balance, 8000),
    ]);

    const [userJson, balanceJson] = await Promise.all([
      userRes.json().catch(() => ({})),
      balanceRes.json().catch(() => ({})),
    ]);

    if (!userRes.ok) {
      return NextResponse.json({ message: userJson?.message || "Failed to fetch user" }, { status: userRes.status || 500 });
    }
    if (!balanceRes.ok) {
      return NextResponse.json({ message: balanceJson?.message || "Failed to fetch balance" }, { status: balanceRes.status || 500 });
    }

    const promo = await promoP;
    return NextResponse.json({
      data: {
        user: userJson?.data ?? null,
        balance: balanceJson?.data?.currentBalance ?? 0,
        promoSummary: promo?.ok ? (promo?.body?.data ?? null) : null,
      },
      errors: {
        promo: promo?.ok ? null : (promo?.body?.message || `HTTP ${promo?.status}`),
      },
    }, { status: 200, headers: { "Cache-Control": "no-store" } });
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || "Unexpected error" }, { status: 500 });
  }
}
