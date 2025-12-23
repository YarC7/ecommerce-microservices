import React from "react";

export default function AdminAuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Simple pass-through layout for admin auth pages
    // The pages themselves handle the dark theme styling
    return <>{children}</>;
}
