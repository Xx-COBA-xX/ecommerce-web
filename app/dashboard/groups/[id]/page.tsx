"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowRight,
  User,
  Users,
  MapPin,
  Building2,
  Calendar,
  Loader2,
  Trophy,
  Coins,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export default function GroupDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Members Tab State
  const [members, setMembers] = useState<any[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersTotal, setMembersTotal] = useState(0);
  const [membersPage, setMembersPage] = useState(1);
  const [membersLimit] = useState(10);

  useEffect(() => {
    if (id) {
      fetchGroup();
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchMembers();
    }
  }, [id, membersPage]);

  const fetchGroup = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getGroup(id);
      setGroup(data);
    } catch (error) {
      console.error("Failed to fetch group:", error);
      toast.error("فشل تحميل بيانات المجموعة");
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      setMembersLoading(true);
      const data = await apiClient.getGroupMembers(id, {
        page: membersPage,
        limit: membersLimit,
      });
      // Handle potential response structure differences
      const items = data.data || data.items || [];
      const total = data.meta?.totalItems || data.total || 0;
      setMembers(items);
      setMembersTotal(total);
    } catch (error) {
      console.error("Failed to fetch group members:", error);
    } finally {
      setMembersLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <h2 className="text-xl font-semibold">المجموعة غير موجودة</h2>
        <Button onClick={() => router.push("/dashboard/groups")}>
          العودة للقائمة
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto pb-10 space-y-8" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              تفاصيل المجموعة
            </h1>
            <p className="text-sm text-muted-foreground">
              {group.name} ({group.code})
            </p>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Basic Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              معلومات أساسية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">
                  اسم المجموعة
                </div>
                <div className="font-medium">{group.name}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">الكود</div>
                <div className="font-medium font-mono">{group.code}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">القطاع</div>
                <div className="font-medium flex items-center gap-1">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  {group.sector?.name || "-"}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">المحافظة</div>
                <div className="font-medium flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {group.province?.name || "-"}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">الحالة</div>
                <Badge variant={!group.is_banned ? "default" : "destructive"}>
                  {!group.is_banned ? "نشط" : "محظور"}
                </Badge>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  تاريخ الإنشاء
                </div>
                <div className="font-medium flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {new Date(group.created_at).toLocaleDateString("ar-EG")}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scores & Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              النقاط والتقييم
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-muted-foreground" />
                <span>نقاط التدريب</span>
              </div>
              <span className="font-bold text-lg">
                {group.training_score || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-muted-foreground" />
                <span>نقاط المالية</span>
              </div>
              <span className="font-bold text-lg">
                {group.finance_score || 0}
              </span>
            </div>
            <div className="pt-4 border-t flex items-center justify-between">
              <span className="font-semibold">المجموع الكلي</span>
              <Badge variant="secondary" className="text-lg px-3">
                {group.points || 0}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Leader Info */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-600" />
              قائد المجموعة
            </CardTitle>
          </CardHeader>
          <CardContent>
            {group.leader ? (
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-2xl">
                  {group.leader.full_name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-xl">
                    {group.leader.full_name}
                  </div>
                  <div className="text-muted-foreground font-mono">
                    {group.leader.custom_code || "-"}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {group.leader.phone || "لا يوجد رقم هاتف"}
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="mr-auto"
                  onClick={() =>
                    router.push(`/dashboard/members/${group.leader.id}`)
                  }
                >
                  عرض الملف الشخصي
                </Button>
              </div>
            ) : (
              <div className="py-6 text-center text-muted-foreground">
                لا يوجد قائد معين لهذه المجموعة
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="members" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="members">الأعضاء ({membersTotal})</TabsTrigger>
          <TabsTrigger value="overview">سجل النشاطات</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>قائمة أعضاء المجموعة</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الاسم الكامل</TableHead>
                    <TableHead className="text-right">الكود</TableHead>
                    <TableHead className="text-right">رقم الهاتف</TableHead>
                    <TableHead className="text-right">نوع الانتماء</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {membersLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        جاري التحميل...
                      </TableCell>
                    </TableRow>
                  ) : members.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        لا يوجد أعضاء في هذه المجموعة
                      </TableCell>
                    </TableRow>
                  ) : (
                    members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">
                          {member.full_name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {member.custom_code}
                          </Badge>
                        </TableCell>
                        <TableCell>{member.phone || "-"}</TableCell>
                        <TableCell>{member.role_name || "-"}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(`/dashboard/members/${member.id}`)
                                }
                              >
                                عرض التفاصيل
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Simple Pagination Controls */}
              <div className="flex items-center justify-end space-x-2 space-x-reverse mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMembersPage((p) => Math.max(1, p - 1))}
                  disabled={membersPage === 1 || membersLoading}
                >
                  السابق
                </Button>
                <div className="text-sm">الصفحة {membersPage}</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMembersPage((p) => p + 1)}
                  disabled={members.length < membersLimit || membersLoading}
                >
                  التالي
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center">
                سجل النشاطات سيتم إضافته قريباً
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
