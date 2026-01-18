"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Package,
  BarChart3,
  FileText,
  Building2,
  LogOut,
  User,
} from "lucide-react";

const navigationItems = [
  {
    title: "عام",
    items: [
      {
        title: "لوحة التحكم",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "الأعضاء",
        href: "/dashboard/members",
        icon: Users,
        badge: "2",
      },
    ],
  },
  {
    title: "أدوات",
    items: [
      {
        title: "التحليلات",
        href: "/dashboard/analytics",
        icon: BarChart3,
      },
      {
        title: "التقارير",
        href: "/dashboard/reports",
        icon: FileText,
      },
      {
        title: "الإعدادات",
        href: "/dashboard/settings",
        icon: Settings,
      },
    ],
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "relative border-l h-screen bg-background transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b shrink-0 overflow-hidden">
        <div
          className={cn(
            "flex items-center gap-2 transition-opacity duration-300",
            collapsed ? "opacity-0 w-0" : "opacity-100",
          )}
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Package className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg whitespace-nowrap">
            نظام الإدارة
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 ml-auto"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Main Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-4">
          <div>
            {!collapsed && (
              <h4 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase">
                عام
              </h4>
            )}
            <div className="space-y-1">
              {[
                {
                  title: "لوحة التحكم",
                  href: "/dashboard",
                  icon: LayoutDashboard,
                },
                { title: "الأعضاء", href: "/dashboard/members", icon: Users },
                {
                  title: "القطاعات",
                  href: "/dashboard/sectors",
                  icon: Building2,
                },
                {
                  title: "المجاميع",
                  href: "/dashboard/groups",
                  icon: Users, // Using Users icon as placeholder or maybe a different one like Layers
                },
              ].map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3",
                        collapsed && "justify-center px-2",
                      )}
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && (
                        <span className="flex-1 text-right">{item.title}</span>
                      )}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            {!collapsed && (
              <h4 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase">
                أدوات
              </h4>
            )}
            <div className="space-y-1">
              {[
                {
                  title: "التحليلات",
                  href: "/dashboard/analytics",
                  icon: BarChart3,
                },
                {
                  title: "التقارير",
                  href: "/dashboard/reports",
                  icon: FileText,
                },
              ].map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3",
                        collapsed && "justify-center px-2",
                      )}
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && (
                        <span className="flex-1 text-right">{item.title}</span>
                      )}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Bottom Actions */}
      <div className="p-3 border-t bg-muted/10">
        <div className="space-y-1">
          {[
            { title: "الإعدادات", href: "/dashboard/settings", icon: Settings },
            { title: "الملف الشخصي", href: "/dashboard/profile", icon: User },
            {
              title: "تسجيل الخروج",
              href: "/auth/logout",
              icon: LogOut,
              variant: "destructive",
              className: "text-red-600 hover:text-red-700 hover:bg-red-50",
            },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3",
                  collapsed && "justify-center px-2",
                  item.className,
                )}
                title={collapsed ? item.title : undefined}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && (
                  <span className="flex-1 text-right">{item.title}</span>
                )}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
