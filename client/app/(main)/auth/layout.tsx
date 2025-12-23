import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ padding: 24 }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <h1>Auth</h1>
        <div>{children}</div>
      </div>
    </div>
  );
}
