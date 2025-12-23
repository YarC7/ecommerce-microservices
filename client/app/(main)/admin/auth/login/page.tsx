"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Loader2, Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiClient } from "@/lib/api-client";
import { UserType } from "@/lib/api-types";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const from = searchParams.get("from") || "/admin/dashboard";

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await apiClient.auth.login(email, password, UserType.ADMIN);
            router.push(from);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-12 w-72 h-72 bg-gradient-to-br from-indigo-600/30 to-blue-600/30 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 -right-12 w-96 h-96 bg-gradient-to-br from-blue-600/30 to-cyan-600/30 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            {/* Back Button */}
            <div className="absolute top-6 left-6 z-10">
                <Button asChild variant="ghost" className="gap-2 text-white hover:bg-white/10">
                    <Link href="/">
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Link>
                </Button>
            </div>

            {/* Badge */}
            <div className="absolute top-6 right-6 z-10">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-600/20 backdrop-blur-sm border border-indigo-400/30">
                    <Shield className="h-4 w-4 text-indigo-400" />
                    <span className="text-xs font-semibold text-indigo-200">Admin Portal</span>
                </div>
            </div>

            {/* Card */}
            <div className="w-full max-w-md relative z-10">
                <div className="backdrop-blur-xl bg-slate-900/90 border border-slate-700/60 rounded-2xl shadow-2xl p-8 space-y-6">
                    {/* Header */}
                    <div className="flex flex-col items-center gap-3 pb-4 border-b border-slate-700/60">
                        <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 flex items-center justify-center shadow-lg">
                            <Shield className="h-7 w-7 text-white" />
                        </div>
                        <h1 className="font-bold text-2xl bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                            Admin Dashboard
                        </h1>
                        <p className="text-sm text-slate-400">System Administrator Access</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-300">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 bg-slate-800 border-slate-700 text-white"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-300">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 bg-slate-800 border-slate-700 text-white"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {error && (
                            <Alert variant="destructive" className="bg-red-900/50 border-red-700">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                "Sign in to Admin Portal"
                            )}
                        </Button>
                    </form>

                    {/* Footer */}
                    <div className="pt-4 border-t border-slate-700/60">
                        <p className="text-xs text-center text-slate-400">
                            🔒 Enterprise-level security
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
