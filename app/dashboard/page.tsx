"use client";

import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/dashboard/stats-card";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { RecentSales } from "@/components/dashboard/recent-sales";
import {
  Users,
  Building2,
  Map,
  UserPlus,
  Calendar,
  FileDown,
  Activity,
  AlertCircle,
  CreditCard,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            نظرة عامة على المؤسسة
          </h1>
          <p className="text-muted-foreground mt-1">
            مرحبا بك مجدداً، إليك آخر تحديثات وإحصائيات النظام
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-9">
            <Calendar className="mr-2 h-4 w-4" />
            التاريخ: {new Date().toLocaleDateString("ar-IQ")}
          </Button>
          <Button variant="default" className="h-9">
            <FileDown className="mr-2 h-4 w-4" />
            تحميل تقرير شهري
          </Button>
        </div>
      </div>
      {/* Stats Grid - Institution Focused */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="إجمالي الأعضاء"
          value="12,562"
          change="+180 عضو جديد"
          changeType="increase"
          icon={Users}
          iconColor="text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400"
        />
        <StatsCard
          title="المجموعات النشطة"
          value="45"
          change="+3 مجموعات"
          changeType="increase"
          icon={Building2}
          iconColor="text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400"
        />
        <StatsCard
          title="القطاعات"
          value="8"
          change="مستقر"
          changeType="increase"
          icon={Map}
          iconColor="text-cyan-600 bg-cyan-100 dark:bg-cyan-900/20 dark:text-cyan-400"
        />
        <StatsCard
          title="نشاط النظام"
          value="98%"
          change="+2% تحسن في الأداء"
          changeType="increase"
          icon={Activity}
          iconColor="text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400"
        />
      </div>
      {/* Main Charts & Content Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Growth Chart */}
        <div className="col-span-1 md:col-span-2 lg:col-span-5 space-y-4">
          {/* Upgrade/Notification Banner */}
          <div className="relative overflow-hidden rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 p-6 text-white shadow-lg">
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">تنبيهات النظام</h2>
                <p className="text-indigo-100 mt-1">
                  هناك 5 طلبات عضوية جديدة بانتظار الموافقة عليها. يرجى مراجعتها
                  وتحديث حالتها.
                </p>
              </div>
              <Button className="bg-white text-indigo-600 hover:bg-indigo-50 border-0 font-bold shadow-md">
                مراجعة الطلبات
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <SalesChart /> {/* To be renamed/repurposed as Member Growth */}
            <RevenueChart /> {/* To be repurposed as Financials/Activity */}
          </div>
        </div>

        {/* Side Panel Information */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">توزيع الأعضاء</CardTitle>
              <CardDescription>حسب الحالة النشطة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4" dir="ltr">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">نشط</span>
                  <span className="text-muted-foreground">85%</span>
                </div>
                <Progress
                  value={85}
                  className="h-2 bg-green-100 dark:bg-green-900/20"
                />
                {/* indicator color fix needed via inline class or custom component props, relying on default for now */}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">غير نشط</span>
                  <span className="text-muted-foreground">10%</span>
                </div>
                <Progress value={10} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">جديد</span>
                  <span className="text-muted-foreground">5%</span>
                </div>
                <Progress value={5} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">إجراءات سريعة</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button variant="outline" className="w-full justify-start">
                <UserPlus className="mr-2 h-4 w-4" />
                إضافة عضو جديد
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Building2 className="mr-2 h-4 w-4" />
                إنشاء مجموعة
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <AlertCircle className="mr-2 h-4 w-4" />
                عرض السجلات
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Detailed Tables */}
      <RecentSales />{" "}
      {/* Renamed logically but kept component for now, will visualize as Recent Members/Activities */}
    </div>
  );
}
