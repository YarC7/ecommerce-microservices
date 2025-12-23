import React from "react";

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Simple pass-through layout for customer login
    // The page itself handles all the styling
    return <>{children}</>;
}
