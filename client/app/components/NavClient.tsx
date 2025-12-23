"use client";

import React, { useEffect, useState } from "react";

export default function NavClient() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const raw = document.cookie
      .split("; ")
      .find((c) => c.startsWith("user="))
      ?.split("=")[1];
    if (raw) {
      try {
        setUser(JSON.parse(decodeURIComponent(raw)));
      } catch (e) {
        setUser(null);
      }
    }
  }, []);

  return (
    <nav
      style={{
        display: "flex",
        gap: 12,
        padding: 12,
        borderBottom: "1px solid #eee",
      }}
    >
      <a href="/">Home</a>
      <a href="/products">Products</a>
      {user ? (
        <>
          <a href="/cart">Cart</a>
          <a href="/profile">Profile</a>
          {user.roles && JSON.stringify(user.roles).includes("admin") && (
            <a href="/admin">Admin</a>
          )}
        </>
      ) : (
        <a href="/login">Login</a>
      )}
    </nav>
  );
}
