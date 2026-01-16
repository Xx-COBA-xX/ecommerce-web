"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>جاري التحميل...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Non-admin users see coming soon message
  if (user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">قريباً</h1>
          <p className="text-muted-foreground">
            سيتم بناء الصفحات الخاصة بك قريباً
          </p>
          <Button onClick={logout} variant="outline">
            <LogOut className="size-4 mr-2" />
            تسجيل الخروج
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen max-w overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-muted/10">
          <div className=" p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
