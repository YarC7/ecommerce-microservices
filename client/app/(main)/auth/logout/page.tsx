"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();
  useEffect(() => {
    (async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/auth/login");
    })();
  }, [router]);
  return <div style={{ padding: 24 }}>Logging out...</div>;
}
