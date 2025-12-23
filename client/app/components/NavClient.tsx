"use client";

import React from "react";
import Link from "next/link";

type User = { user_id: number | string | null; roles?: unknown } | null;

function parseUserFromCookie(): User {
  const raw = document.cookie
    .split("; ")
    .find((c) => c.startsWith("user="))
    ?.split("=")[1];
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw));
  } catch {
    return null;
  }
}

export default function NavClient() {
  const [user] = React.useState<User>(() =>
    typeof window !== "undefined" ? parseUserFromCookie() : null
  );

  return (
    <nav
      style={{
        display: "flex",
        gap: 12,
        padding: 12,
        borderBottom: "1px solid #eee",
      }}
    >
      <Link href="/">Home</Link>
      <Link href="/products">Products</Link>
      {user ? (
        <>
          <Link href="/cart">Cart</Link>
          <Link href="/profile">Profile</Link>
          {user.roles && JSON.stringify(user.roles).includes("admin") && (
            <Link href="/admin">Admin</Link>
          )}
        </>
      ) : (
        <Link href="/login">Login</Link>
      )}
    </nav>
  );
}
