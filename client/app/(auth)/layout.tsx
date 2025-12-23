import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Detect if it's admin or customer based on the URL path
    // This will be determined client-side, but layout is server component
    // For now, we'll use a simpler approach - just render the children
    // The styling will be in individual login pages

    return <>{children}</>;
}
