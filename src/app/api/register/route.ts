// app/api/register/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // or "edge" if you prefer; keep nodejs if you need Node APIs

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Build the exact backend URL here (FIX path & casing on the frontend side)
    const backendURL = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/users/create-user`;

    const res = await fetch(backendURL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      // credentials: "include", // only if your backend sets cookies and you need them
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message || data?.error || "Registration failed." },
        { status: res.status || 500 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    const message =
      err?.name === "AbortError"
        ? "Request timed out. Please try again."
        : err?.message || "Unexpected error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
