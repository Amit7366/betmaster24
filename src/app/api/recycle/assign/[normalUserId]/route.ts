import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://bm24api.xyz/api/v1";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { normalUserId: string } }
) {
  const auth = req.headers.get("authorization") || "";
  const payload = await req.json();

  const upstream = await fetch(
    `${API_BASE}/RecycleAssign/recycle/assign/${encodeURIComponent(
      params.normalUserId
    )}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: auth,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    }
  );

  const body = await upstream.text();

  return new NextResponse(body, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("content-type") || "application/json",
    },
  });
}
