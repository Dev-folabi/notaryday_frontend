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

const ONBOARDING_PATHS = [
  "/onboarding/home",
  "/onboarding/mileage",
  "/onboarding/durations",
  "/onboarding/booking",
];

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

  // Check for session cookie
  const sessionCookie = request.cookies.get("session");
  const hasSession = !!sessionCookie?.value;

  // Protect onboarding paths — require session
  if (pathname.startsWith("/onboarding/")) {
    if (!hasSession) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next();
  }

  // Protect (app) routes — require session
  if (pathname.startsWith("/(")) {
    if (!hasSession) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Onboarding completion check — redirect to onboarding if not complete
    // We pass this through for the layout to handle client-side, but the
    // middleware allows the route so the layout can show the onboarding shell
    return NextResponse.next();
  }

  // Protect top-level app routes that are not public
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

  if (PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    if (!hasSession) {
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
