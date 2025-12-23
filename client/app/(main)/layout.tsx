import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decodeJwt } from "@/lib/decodeJwt";
import React from "react";
import MainShell from "@/components/layout/MainShell";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value ?? null;
  const payload = decodeJwt(token ?? undefined) as any | null;

  // Don't enforce auth globally here — allow public pages like /auth/login to render.
  // Show a login link when unauthenticated instead of redirecting.

  // If we want, we can expose user via props or context; for now show basic nav + sidebar
  return (
    <MainShell user={payload ? { sub: payload.sub } : undefined}>
      {children}
    </MainShell>
  );
}
