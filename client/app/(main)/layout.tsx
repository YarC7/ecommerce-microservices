import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decodeJwt } from "@/lib/decodeJwt";
import React from "react";
import Link from "next/link";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const token = cookieStore.get("access_token")?.value;
  const payload = decodeJwt(token ?? undefined) as any | null;

  const now = Math.floor(Date.now() / 1000);
  if (!payload || (payload.exp && payload.exp <= now)) {
    // Not authenticated — redirect to login
    redirect("/auth/login");
  }

  // If we want, we can expose user via props or context; for now show basic nav
  return (
    <html>
      <body>
        <header style={{ padding: 16, borderBottom: "1px solid #eee" }}>
          <nav style={{ display: "flex", gap: 12 }}>
            <Link href="/">Home</Link>
            <Link href="/admin">Admin</Link>
            <Link href="/customer">Customer</Link>
            <Link href="/auth/logout">Logout</Link>
            <div style={{ marginLeft: "auto" }}>
              {payload?.sub ? `User ${payload.sub}` : null}
            </div>
          </nav>
        </header>
        <main style={{ padding: 16 }}>{children}</main>
      </body>
    </html>
  );
}
