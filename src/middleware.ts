// import { jwtDecode } from "jwt-decode";
// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// type Role = keyof typeof roleBasedPrivateRoutes;

// const publicRoutes = [
//   "/", // ✅ home is accessible by everyone
//   "/promotion",
//   "/register",
//   "/rewards",
//   "/our-plan",
//   "/blog",
//   "/contact",
// ];

// const commonPrivateRoutes = [
//   "/dashboard",
//   "/dashboard/change-password",
//   "/doctors",
// ];

// const roleBasedPrivateRoutes = {
//   USER: [/^\/dashboard\/user/],
//   DOCTOR: [/^\/dashboard\/doctor/],
//   ADMIN: [/^\/dashboard\/admin/],
//   SUPER_ADMIN: [/^\/dashboard\/super-admin/],
// };

// export function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;
//   const accessToken = request.cookies.get("accessToken")?.value;

//   const isPublic = publicRoutes.includes(pathname);

//   // ✅ Allow access to public routes always
//   if (isPublic) return NextResponse.next();

//   // ✅ If not authenticated and not on a public route, block access
//   if (!accessToken) {
//     return NextResponse.redirect(new URL("/login", request.url));
//   }

//   // ✅ Redirect logged-in users away from login/register
//   if (
//     accessToken &&
//     ["/login", "/register"].includes(pathname)
//   ) {
//     return NextResponse.redirect(new URL("/", request.url));
//   }

//   // ✅ Decode access token
//   let decodedData: any = null;
//   try {
//     decodedData = jwtDecode(accessToken);
//   } catch (e) {
//     return NextResponse.redirect(new URL("/login", request.url));
//   }

//   const role = decodedData?.role;

//   // ✅ Allow common private routes
//   if (
//     commonPrivateRoutes.includes(pathname) ||
//     commonPrivateRoutes.some((route) => pathname.startsWith(route))
//   ) {
//     return NextResponse.next();
//   }

//   // ✅ Allow role-based access
//   if (role && roleBasedPrivateRoutes[role as Role]) {
//     const regexList = roleBasedPrivateRoutes[role as Role];
//     if (regexList.some((regex) => regex.test(pathname))) {
//       return NextResponse.next();
//     }
//   }

//   // ❌ If all else fails, redirect to home
//   return NextResponse.redirect(new URL("/", request.url));
// }

// export const config = {
//   matcher: [
//     "/", // ✅ homepage
//     "/login",
//     "/register",
//     "/about",
//     "/our-plan",
//     "/blog",
//     "/contact",
//     "/dashboard/:path*",
//     "/doctors/:path*",
//   ],
// };




import { jwtDecode } from "jwt-decode";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type Role = keyof typeof roleBasedPrivateRoutes;

const publicRoutes = [
  "/", "/promotion", "/register", "/rewards", "/our-plan", "/blog", "/contact", "/about", "/login",
];

const commonPrivateRoutes = [
  "/dashboard",
  "/dashboard/change-password",
  "/doctors",
];

const roleBasedPrivateRoutes = {
  USER: [/^\/dashboard\/user/],
  DOCTOR: [/^\/dashboard\/doctor/],
  ADMIN: [/^\/dashboard\/admin/],
  SUPER_ADMIN: [/^\/dashboard\/super-admin/],
};

// ✅ Get default dashboard path for role
const getRoleDashboard = (role: string) => {
  switch (role) {
    case "USER":
      return "/dashboard/user";
    case "DOCTOR":
      return "/dashboard/doctor";
    case "ADMIN":
      return "/dashboard/admin";
    case "SUPER_ADMIN":
      return "/dashboard/super-admin";
    default:
      return "/";
  }
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;

  // ✅ Always allow public routes
  if (publicRoutes.includes(pathname)) {
    // 👉 If token exists and accessing /login or /register, redirect by role
    if (accessToken && ["/login", "/register"].includes(pathname)) {
      try {
        const decoded: any = jwtDecode(accessToken);
        const role = decoded?.role;
        const redirectUrl = getRoleDashboard(role);
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      } catch {
        // invalid token: allow to continue to login/register
        return NextResponse.next();
      }
    }

    return NextResponse.next();
  }

  // ✅ Redirect unauthenticated users to login
  if (!accessToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ✅ Decode token
  let decoded: any;
  try {
    decoded = jwtDecode(accessToken);
  } catch (error) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const role = decoded?.role;

  // ✅ Allow common private routes
  if (
    commonPrivateRoutes.includes(pathname) ||
    commonPrivateRoutes.some((route) => pathname.startsWith(route))
  ) {
    return NextResponse.next();
  }

  // ✅ Allow role-based private routes
  if (role && roleBasedPrivateRoutes[role as Role]) {
    const patterns = roleBasedPrivateRoutes[role as Role];
    if (patterns.some((regex) => regex.test(pathname))) {
      return NextResponse.next();
    }
  }

  // ❌ Everything else is blocked → redirect to dashboard
  return NextResponse.redirect(new URL(getRoleDashboard(role), request.url));
}

export const config = {
  matcher: [
    "/", "/login", "/register", "/about", "/our-plan", "/blog", "/contact", "/promotion", "/rewards",
    "/dashboard/:path*",
    "/doctors/:path*",
  ],
};
