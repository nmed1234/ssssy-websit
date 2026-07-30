import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Paths that are always accessible without authentication.
const publicPaths = [
  "/",
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
];

// Path prefixes that are always accessible (static assets, Next.js internals,
// public API routes, uploads).
const alwaysAllowedPrefixes = [
  "/_next",
  "/api",
  "/uploads",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
];

// Path prefixes that require an authenticated session.
// The accessToken cookie is now set with Path=/ so the browser sends it here.
const protectedPrefixes = ["/admin", "/dashboard", "/profile", "/settings"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow static assets and Next.js internals.
  for (const prefix of alwaysAllowedPrefixes) {
    if (pathname.startsWith(prefix)) {
      return NextResponse.next();
    }
  }

  // Always allow explicit public paths.
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  for (const prefix of protectedPrefixes) {
    if (pathname.startsWith(prefix)) {
      // The accessToken cookie (Path=/) is sent by the browser on all requests.
      // If it is absent the user is not logged in — redirect to login.
      const token = request.cookies.get("accessToken")?.value;
      if (!token) {
        const loginUrl = new URL("/auth/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }
      // Cookie present — let the request through.
      // The backend 401 interceptor in api.ts handles expiry via silent refresh.
      return NextResponse.next();
    }
  }

  // For any other path not explicitly listed, allow through.
  // Backend authorization on the API level is the definitive gate.
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
