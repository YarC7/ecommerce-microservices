"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShoppingBag } from "lucide-react";

export default function CustomerLogoutPage() {
    const router = useRouter();

    useEffect(() => {
        async function logout() {
            try {
                await fetch("/api/auth/logout", { method: "POST" });
            } catch (error) {
                console.error("Logout error:", error);
            } finally {
                router.push("/");
            }
        }
        logout();
    }, [router]);

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950 flex items-center justify-center p-4">
            <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-white" />
                </div>
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                <p className="text-sm text-muted-foreground">Signing out...</p>
            </div>
        </div>
    );
}
