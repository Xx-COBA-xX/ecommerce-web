"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Settings, CreditCard } from "lucide-react";
import { toast } from "sonner";

export function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    toast.success("تم تسجيل الخروج بنجاح", {
      description: "نراك قريباً!",
      duration: 2000,
    });
    router.push("/auth/login");
  };

  const initials = user.member?.full_name
    ? user.member.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
    : user.email.substring(0, 2).toUpperCase();

  return (
    <DropdownMenu dir="rtl">
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border-2 border-primary/10 transition-all hover:border-primary">
            <AvatarImage
              src={
               'https://pub-78f212f5cfc14ae7baadced9bbb60ce3.r2.dev/' + user.member?.image_url ||
                `https://ui-avatars.com/api/?name=${initials}&background=random`
              }
              alt={user.member?.full_name || "User"}
              className="object-cover"
            />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal"> 
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.member?.full_name || "المستخدم"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => router.push("/dashboard/profile")}
          className="cursor-pointer"
        >
          <User className="ml-2 h-4 w-4" />
          <span>الملف الشخصي</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push("/dashboard/settings")}
          className="cursor-pointer"
        >
          <Settings className="ml-2 h-4 w-4" />
          <span>الإعدادات</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
        >
          <LogOut className="ml-2 h-4 w-4" />
          <span>تسجيل الخروج</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
