import React from "react";
import Link from "next/link";
import { ShoppingCart, User, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cookies } from "next/headers";
import { decodeJwt } from "@/lib/decodeJwt";
import Image from "next/image";

export default async function StoreLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value ?? null;
    const payload = decodeJwt(token ?? undefined) as { sub?: string } | null;
    const isLoggedIn = !!payload;

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="container mx-auto px-4">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg flex items-center justify-center">
                            </div>
                        </Link>

                        {/* Navigation */}
                        <nav className="hidden md:flex items-center gap-6">
                            <Link href="/" className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg flex items-center justify-center">
                                    <Image
                                        src="/icon/apple.png"
                                        alt="Logo"
                                        width={32}
                                        height={32}
                                    />
                                </div>
                            </Link>
                            <Link
                                href="/iphone"
                                className="text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
                            >
                                iPhone
                            </Link>
                            <Link
                                href="/ipad"
                                className="text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
                            >
                                iPad
                            </Link>
                            <Link
                                href="/macbook"
                                className="text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
                            >
                                Mac
                            </Link>
                            <Link
                                href="/watch"
                                className="text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
                            >
                                Watch
                            </Link>
                            <Link
                                href="/airpods"
                                className="text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
                            >
                                AirPods
                            </Link>
                            <Link
                                href="/accessories"
                                className="text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
                            >
                                Accessories
                            </Link>
                        </nav>

                        {/* Right Actions */}
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="hidden md:flex">
                                <Search className="h-5 w-5" />
                            </Button>
                            <Button variant="ghost" size="icon">
                                <ShoppingCart className="h-5 w-5" />
                            </Button>
                            {isLoggedIn ? (
                                <Link href="/account">
                                    <Button variant="ghost" size="icon">
                                        <User className="h-5 w-5" />
                                    </Button>
                                </Link>
                            ) : (
                                <Link href="/login">
                                    <Button className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900">
                                        Sign In
                                    </Button>
                                </Link>
                            )}
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">{children}</main>

            {/* Footer */}
            <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mt-auto">
                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* Company Info */}
                        <div className="space-y-3">
                            <Link href="/" className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                                    <ShoppingCart className="h-5 w-5 text-white" />
                                </div>
                                <span className="font-bold text-lg text-slate-900 dark:text-white">
                                    Store
                                </span>
                            </Link>
                            <p className="text-sm text-muted-foreground">
                                Your trusted shopping companion for quality products and great deals.
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h3 className="font-semibold mb-3">Shop</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>
                                    <Link href="/products" className="hover:text-slate-900 dark:hover:text-white">
                                        All Products
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/deals" className="hover:text-slate-900 dark:hover:text-white">
                                        Deals
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/new" className="hover:text-slate-900 dark:hover:text-white">
                                        New Arrivals
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Customer Service */}
                        <div>
                            <h3 className="font-semibold mb-3">Customer Service</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>
                                    <Link href="/contact" className="hover:text-slate-900 dark:hover:text-white">
                                        Contact Us
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/shipping" className="hover:text-slate-900 dark:hover:text-white">
                                        Shipping Info
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/returns" className="hover:text-slate-900 dark:hover:text-white">
                                        Returns
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Account */}
                        <div>
                            <h3 className="font-semibold mb-3">Account</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>
                                    <Link href="/account" className="hover:text-slate-900 dark:hover:text-white">
                                        My Account
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/orders" className="hover:text-slate-900 dark:hover:text-white">
                                        Order History
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/wishlist" className="hover:text-slate-900 dark:hover:text-white">
                                        Wishlist
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 text-center text-sm text-muted-foreground">
                        <p>© 2025 Go Store. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
