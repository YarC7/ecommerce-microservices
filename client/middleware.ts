import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Protect specific routes (app router). Update or expand matcher in config below as needed.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public and API routes, static files, and auth endpoints
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/api")
  ) {
    return NextResponse.next();
  }

  const publicPaths = ["/", "/login", "/products"];
  for (const p of publicPaths) {
    if (pathname === p || pathname.startsWith(p + "/"))
      return NextResponse.next();
  }

  // For protected pages, require access_token cookie
  const access = req.cookies.get("access_token")?.value;
  if (!access) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

// Apply middleware only to protected app routes
export const config = {
  matcher: [
    "/profile/:path*",
    "/checkout/:path*",
    "/orders/:path*",
    "/cart/:path*",
  ],
};
