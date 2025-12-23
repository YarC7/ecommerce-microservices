"use client";

import React from "react";
import Link from "next/link";
import { Button } from "../../components/ui/button";
import Icons from "../../components/ui/icons";

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
    <nav className="flex items-center gap-3 py-3 border-b border-border px-3">
      <Link href="/">
        <Button variant="ghost">
          <Icons.Home className="mr-2 h-4 w-4" /> Home
        </Button>
      </Link>

      <Link href="/products">
        <Button variant="ghost">Products</Button>
      </Link>

      <div className="flex-1" />

      {user ? (
        <>
          <Link href="/cart">
            <Button variant="ghost">
              <Icons.Cart className="mr-2 h-4 w-4" /> Cart
            </Button>
          </Link>

          <Link href="/profile">
            <Button variant="ghost">Profile</Button>
          </Link>

          {user.roles && JSON.stringify(user.roles).includes("admin") && (
            <Link href="/admin">
              <Button variant="ghost">Admin</Button>
            </Link>
          )}
        </>
      ) : (
        <Link href="/login">
          <Button>Login</Button>
        </Link>
      )}
    </nav>
  );
}
