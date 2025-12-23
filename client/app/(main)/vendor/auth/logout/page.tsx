"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Store } from "lucide-react";

export default function VendorLogoutPage() {
    const router = useRouter();

    useEffect(() => {
        async function logout() {
            try {
                await fetch("/api/v1/auth/logout", { method: "POST" });
            } catch (error) {
                console.error("Logout error:", error);
            } finally {
                router.push("/vendor/auth/login");
            }
        }
        logout();
    }, [router]);

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-emerald-950 dark:via-slate-900 dark:to-teal-950 flex items-center justify-center p-4">
            <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                    <Store className="h-6 w-6 text-white" />
                </div>
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                <p className="text-sm text-muted-foreground">Signing out from vendor portal...</p>
            </div>
        </div>
    );
}
