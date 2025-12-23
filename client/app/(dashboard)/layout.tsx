import { cookies } from "next/headers";
import { decodeJwt } from "@/lib/decodeJwt";
import React from "react";
import MainShell from "@/components/layout/MainShell";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value ?? null;
    const payload = decodeJwt(token ?? undefined) as any | null;

    return (
        <MainShell user={payload ? { sub: payload.sub } : undefined}>
            {children}
        </MainShell>
    );
}
