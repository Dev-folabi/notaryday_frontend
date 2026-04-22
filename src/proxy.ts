import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

const PUBLIC_PREFIXES = ["/book/"];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Landing page, auth pages, and public booking pages — allow through
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Check for auth token cookie (set alongside localStorage for middleware use)
  const authTokenCookie = request.cookies.get("auth_token");
  const hasToken = !!authTokenCookie?.value;

  // Protect onboarding paths — require token
  if (pathname.startsWith("/onboarding/")) {
    if (!hasToken) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next();
  }

  // Protect app routes — require token
  // The (app) group routes and other protected paths
  const PROTECTED_PREFIXES = [
    "/jobs",
    "/map",
    "/bookings",
    "/earnings",
    "/expenses",
    "/reports",
    "/journal",
    "/settings",
  ];

  const isAppRoute =
    pathname === "/" ||
    pathname.startsWith("/(") ||
    PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isAppRoute) {
    if (!hasToken) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public files (e.g. /manifest.json)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
