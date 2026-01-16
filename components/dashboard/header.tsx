"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Bell,
  Settings as SettingsIcon,
  ChevronLeft,
  Home,
} from "lucide-react";
import { UserMenu } from "@/components/auth/user-menu";
import { ModeToggle } from "@/components/ui/theme-toggle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const routeNames: Record<string, string> = {
  dashboard: "الرئيسية",
  members: "الأعضاء",
  create: "إضافة جديد",
  settings: "الإعدادات",
  analytics: "التحليلات",
  profile: "الملف الشخصي",
};

export function DashboardHeader() {
  const pathname = usePathname();
  const paths = pathname.split("/").filter(Boolean);

  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
      <div className="flex h-full items-center justify-between px-6 gap-4">
        {/* Left Side (RTL: Right): Breadcrumbs */}
        <div className="flex items-center gap-4 flex-1">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/dashboard"
                  className="flex items-center gap-1"
                >
                  <Home className="h-4 w-4" />
                </BreadcrumbLink>
              </BreadcrumbItem>
              {paths.map((path, index) => {
                // Skip 'dashboard' redundancy if we want, but let's keep logic simple
                if (path === "dashboard" && index === 0 && paths.length > 1)
                  return <BreadcrumbSeparator key={`sep-${index}`} />;
                if (path === "dashboard") return null;

                const href = `/${paths.slice(0, index + 1).join("/")}`;
                const isLast = index === paths.length - 1;
                const name = routeNames[path] || path;

                return (
                  <div key={path} className="flex items-center">
                    <BreadcrumbSeparator className="mx-2" />
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage>{name}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={href}>{name}</BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </div>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Center: Wide Search Bar */}
        <div className="hidden md:flex flex-1 max-w-xl mx-4">
          <div className="relative w-full">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث سريع..."
              className="pr-10 bg-muted/50 focus:bg-background transition-colors w-full"
            />
            <div className="absolute left-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">Ctrl</span>K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right Side (RTL: Left): Actions & User */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-muted rounded-full"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 left-2 h-2 w-2 rounded-full bg-red-500 border-2 border-background" />
          </Button>

          <ModeToggle />

          <div className="h-6 w-px bg-border mx-2" />

          <UserMenu />
        </div>
      </div>
    </header>
  );
}
