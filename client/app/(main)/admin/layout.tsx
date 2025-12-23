import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decodeJwt } from "@/lib/decodeJwt";
import React from "react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value ?? null;
  const payload = decodeJwt(token ?? undefined) as any | null;

  const now = Math.floor(Date.now() / 1000);
  if (!payload || (payload.exp && payload.exp <= now)) {
    redirect("/auth/login");
  }

  const roles: string[] = payload?.roles ?? [];
  if (!roles.includes("admin")) {
    // Not authorized for admin area
    redirect("/unauthorized");
  }

  return (
    <div>
      <h2 style={{ padding: 12, borderBottom: "1px solid #ddd" }}>
        Admin Area
      </h2>
      <div style={{ padding: 12 }}>{children}</div>
    </div>
  );
}
