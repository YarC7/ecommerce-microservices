import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function decodeJwt(token?: string | null) {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
    // Prefer browser atob in edge runtime, fallback to Buffer when available
    const decoded =
      typeof (globalThis as any).atob === "function"
        ? (globalThis as any).atob(padded)
        : Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(decoded);
  } catch (e) {
    return null;
  }
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect UI routes under these paths
  const protectedPaths = ["/admin", "/customer", "/order", "/cart"];
  const matched = protectedPaths.some((p) => pathname.startsWith(p));
  if (!matched) return NextResponse.next();

  const token = req.cookies.get("access_token")?.value ?? null;
  const payload = decodeJwt(token);
  const now = Math.floor(Date.now() / 1000);

  if (!payload || (payload.exp && payload.exp <= now)) {
    // Redirect to login (preserve attempted path)
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Example authorization for admin paths
  if (pathname.startsWith("/admin")) {
    const roles = payload.roles ?? [];
    if (!roles.includes("admin")) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/customer/:path*",
    "/order/:path*",
    "/cart/:path*",
  ],
};
