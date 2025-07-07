// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const AUTH_ROUTES = ["/dashboard", "/dashboard/:path*"];

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("accessToken")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    // verify JWT if needed
    await jwtVerify(token, new TextEncoder().encode("your-secret-key"));
    return NextResponse.next();
  } catch (err) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
