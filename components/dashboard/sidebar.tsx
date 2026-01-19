"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/lib/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Users,
  Settings,
  Building2,
  LogOut,
  Bell,
  ChevronRight, // Should point to "collapsed direction" or "expand direction"? In RTL, Right is "Inwards".
  // Using ChevronRight (>) for expand button. In RTL, > points Left (visually <). Wait.
  // Lucide icons are NOT mirrored by dir="rtl".
  // ChevronRight is >.
  // In RTL layout, button is on Left. > points to content (Right).
  // I will use ChevronRight to mean "Expand" (if sidebar is on right, expanding moves edge to left).
} from "lucide-react";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleSidebarClick = (e: React.MouseEvent) => {
    // If collapsed, clicking anywhere expands it
    if (collapsed) {
      setCollapsed(false);
    }
  };

  const toggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent parent click from immediately re-opening
    setCollapsed(!collapsed);
  };

  return (
    <div
      dir="rtl"
      onClick={handleSidebarClick}
      className={cn(
        "relative border-l h-screen bg-background transition-all duration-300 flex flex-col cursor-pointer",
        !collapsed ? "cursor-default" : "",
        collapsed ? "w-20" : "w-72",
      )}
    >
      {/* Header & Logo */}
      <div className="flex flex-col gap-4 p-3 border-b shrink-0">
        <div className="flex items-center justify-between h-10">
          <div
            className={cn(
              "flex items-center gap-3 transition-opacity duration-300",
              collapsed ? "opacity-0 w-0 hidden" : "opacity-100 flex-1",
            )}
          >
            <div className="w-8 h-8 relative shrink-0">
              <Image
                src="/logo-icon.png"
                alt="Organization Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="font-bold text-lg text-primary whitespace-nowrap">
              مؤسسة السبط المجتبى
            </span>
          </div>

          {/* Collapsed Logo Show/Hide logic */}
          {collapsed && (
            <div className="mx-auto w-8 h-8 relative shrink-0">
              <Image
                src="/logo-icon.png"
                alt="Organization Logo"
                fill
                className="object-contain"
              />
            </div>
          )}

          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapse}
              className="h-8 w-8 text-muted-foreground hover:text-foreground md:flex"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <ScrollArea dir="rtl" className="flex-1 px-4 py-4">
        <div className="space-y-6">
          {/* General Section */}
          <div>
            {!collapsed && (
              <h4 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
                { title: "المجاميع", href: "/dashboard/groups", icon: Users },
              ].map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block group"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                        collapsed && "justify-center px-2",
                      )}
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon
                        className={cn(
                          "w-5 h-5 shrink-0",
                          isActive
                            ? "text-primary-foreground"
                            : "text-muted-foreground group-hover:text-foreground",
                        )}
                      />

                      {!collapsed && (
                        <span className="flex-1 font-medium text-sm">
                          {item.title}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </ScrollArea>

      <div
        className="p-4 border-t mt-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Profile Section */}
        <div>
        
          <div className="space-y-1">
            {[
              {
                title: "الإشعارات",
                href: "/dashboard/notifications",
                icon: Bell,
              },
              {
                title: "الإعدادات",
                href: "/dashboard/settings",
                icon: Settings,
              },
            ].map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block group"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                      collapsed && "justify-center px-2",
                    )}
                    title={collapsed ? item.title : undefined}
                  >
                    <item.icon
                      className={cn(
                        "w-5 h-5 shrink-0",
                        isActive
                          ? "text-primary-foreground"
                          : "text-muted-foreground group-hover:text-foreground",
                      )}
                    />
                    {!collapsed && (
                      <span className="flex-1 font-medium text-sm">
                        {item.title}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}

            {/* Logout Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                logout();
              }}
              className="w-full text-right block group"
            >
              <div
                className={cn(
                  "Color-red flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 text-destructive hover:bg-destructive/10 hover:text-destructive",
                  collapsed && "justify-center px-2",
                )}
                title={collapsed ? "تسجيل خروج" : undefined}
              >
                <LogOut className="w-5 h-5 shrink-0 text-destructive" />
                {!collapsed && (
                  <span className="flex-1 font-medium text-sm">تسجيل خروج</span>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
