import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function decodeJwt(token?: string | null): { exp?: number; roles?: string[] } | null {
    if (!token) return null;
    try {
        const parts = token.split(".");
        if (parts.length < 2) return null;
        const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
        const decoded =
            typeof (globalThis as { atob?: (str: string) => string }).atob === "function"
                ? (globalThis as { atob: (str: string) => string }).atob(padded)
                : Buffer.from(padded, "base64").toString("utf8");
        return JSON.parse(decoded);
    } catch {
        return null;
    }
}

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Skip middleware for auth/logout pages and unauthorized page
    if (
        pathname.includes("/auth/login") ||
        pathname.includes("/auth/logout") ||
        pathname === "/login" ||
        pathname === "/unauthorized"
    ) {
        return NextResponse.next();
    }

    // Define protected paths - admin and vendor areas only
    const protectedPaths = ["/admin", "/vendor"];
    const matched = protectedPaths.some((p) => pathname.startsWith(p));

    // Store area is public, no protection needed
    if (!matched) return NextResponse.next();

    const token = req.cookies.get("access_token")?.value ?? null;
    const payload = decodeJwt(token);
    const now = Math.floor(Date.now() / 1000);

    // Check if token is valid
    if (!payload || (payload.exp && payload.exp <= now)) {
        // Redirect to appropriate login based on path
        const loginPath = pathname.startsWith("/admin")
            ? "/admin/auth/login"
            : "/vendor/auth/login";
        const loginUrl = new URL(loginPath, req.url);
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Check role-based authorization
    const roles: string[] = payload.roles ?? [];

    if (pathname.startsWith("/admin") && !roles.includes("admin")) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (pathname.startsWith("/vendor") && !roles.includes("vendor")) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/admin/:path*",
        "/vendor/:path*",
    ],
};
