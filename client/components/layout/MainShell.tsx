"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  User,
  ShoppingCart,
  Package,
  LogOut,
  LayoutDashboard,
  Menu,
  Bell,
  Search,
  Settings,
} from "lucide-react";

import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

const navigationItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Admin", href: "/admin", icon: ShieldCheck },
  { name: "Customer", href: "/customer", icon: User },
  { name: "Orders", href: "/order", icon: Package },
  { name: "Cart", href: "/cart", icon: ShoppingCart },
];

export default function MainShell({
  user,
  children,
}: {
  user?: { sub?: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Determine logout URL based on current path
  const logoutUrl = pathname.startsWith("/admin")
    ? "/admin/auth/logout"
    : pathname.startsWith("/vendor")
      ? "/vendor/auth/logout"
      : "/login"; // Customer logout redirects to login

  const userInitials = user?.sub
    ? user.sub
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
    : "G";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        {/* Sidebar */}
        <Sidebar className="border-r border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xl bg-white/80 dark:bg-slate-950/80">
          <SidebarHeader className="border-b border-slate-200/60 dark:border-slate-800/60 p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <LayoutDashboard className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Go Microservices
                </span>
                <span className="text-xs text-muted-foreground">
                  v1.0 Beta
                </span>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-3 py-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground mb-2 px-2">
                Main Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton
                        asChild
                        className="group transition-all duration-200 hover:bg-gradient-to-r hover:from-indigo-500/10 hover:to-purple-500/10 dark:hover:from-indigo-500/20 dark:hover:to-purple-500/20 rounded-lg px-3 py-2.5"
                      >
                        <Link href={item.href} className="flex items-center gap-3">
                          <item.icon className="h-5 w-5 text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200" />
                          <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                            {item.name}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-6">
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground mb-2 px-2">
                Settings
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className="group transition-all duration-200 hover:bg-gradient-to-r hover:from-indigo-500/10 hover:to-purple-500/10 dark:hover:from-indigo-500/20 dark:hover:to-purple-500/20 rounded-lg px-3 py-2.5"
                    >
                      <Link href={logoutUrl} className="flex items-center gap-3">
                        <LogOut className="h-5 w-5 text-slate-600 dark:text-slate-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-200" />
                        <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-200">
                          Logout
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="mt-auto border-t border-slate-200/60 dark:border-slate-800/60 p-4">
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-gradient-to-r from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10">
              <Avatar className="h-8 w-8 border-2 border-indigo-500/30">
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-xs font-bold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                  {user?.sub || "Guest"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.sub ? "Active" : "Not logged in"}
                </p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Top Navigation Bar */}
          <header className="sticky top-0 z-40 border-b border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xl bg-white/80 dark:bg-slate-950/80 shadow-sm">
            <div className="flex h-16 items-center gap-4 px-6">
              {/* Mobile Menu Trigger */}
              <SidebarTrigger className="lg:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SidebarTrigger>

              {/* Search Bar */}
              <div className="flex-1 max-w-2xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    className="pl-10 bg-slate-100/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors duration-200"
                  />
                </div>
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border border-white dark:border-slate-950 animate-pulse" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
                >
                  <Settings className="h-5 w-5" />
                </Button>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
                    >
                      <Avatar className="h-8 w-8 border-2 border-indigo-500/30">
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-xs font-bold">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium max-w-[100px] truncate hidden md:inline">
                        {user?.sub || "Guest"}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={logoutUrl} className="cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 overflow-auto">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
