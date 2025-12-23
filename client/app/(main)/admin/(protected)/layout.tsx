import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decodeJwt } from "@/lib/decodeJwt";
import React from "react";
import MainShell from "@/components/layout/MainShell";

export default async function AdminProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value ?? null;
    const payload = decodeJwt(token ?? undefined) as { sub?: string; roles?: string[]; exp?: number } | null;

    // Middleware already checks token expiration, just verify payload exists
    if (!payload) {
        redirect("/admin/auth/login");
    }

    const roles: string[] = payload?.roles ?? [];
    if (!roles.includes("admin")) {
        // Not authorized for admin area
        redirect("/unauthorized");
    }

    return <MainShell user={payload ? { sub: payload.sub } : undefined}>{children}</MainShell>;
}
