"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Shield } from "lucide-react";

export default function AdminLogoutPage() {
    const router = useRouter();

    useEffect(() => {
        async function logout() {
            try {
                await fetch("/api/auth/logout", { method: "POST" });
            } catch (error) {
                console.error("Logout error:", error);
            } finally {
                router.push("/admin/auth/login");
            }
        }
        logout();
    }, [router]);

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center p-4">
            <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-600 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-white" />
                </div>
                <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
                <p className="text-sm text-slate-400">Signing out from admin portal...</p>
            </div>
        </div>
    );
}
