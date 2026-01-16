"use client";

import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  return (
    <Button onClick={handleLogout} variant="outline" size="sm">
      <LogOut className="size-4 mr-2" />
      تسجيل الخروج
    </Button>
  );
}
