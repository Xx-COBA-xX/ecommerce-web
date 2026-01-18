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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowRight,
  MapPin,
  User,
  MoreHorizontal,
  Building2,
  Calendar,
  Loader2,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

export default function SectorDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [sector, setSector] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Groups Tab State
  const [groups, setGroups] = useState<any[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupsTotal, setGroupsTotal] = useState(0);
  const [groupsPage, setGroupsPage] = useState(1);
  const [groupsLimit] = useState(10);

  useEffect(() => {
    if (id) {
      fetchSector();
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchGroups();
    }
  }, [id, groupsPage]);

  const fetchSector = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getSector(id);
      setSector(data);
    } catch (error) {
      console.error("Failed to fetch sector:", error);
      toast.error("فشل loading بيانات القاطع");
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      setGroupsLoading(true);
      const data = await apiClient.getSectorGroups(id, {
        page: groupsPage,
        limit: groupsLimit,
      });
      // The API returns { data: [...], meta: ... } or just arrays/paginated objects usually.
      // Based on user log: Object { data: (1) […], meta: {…} }
      // So we should access data.data for items.
      const items = data.data || data.items || [];
      const total = data.meta?.totalItems || data.total || 0;

      setGroups(items);
      setGroupsTotal(total);
    } catch (error) {
      console.error("Failed to fetch groups:", error);
    } finally {
      setGroupsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!sector) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <h2 className="text-xl font-semibold">القاطع غير موجود</h2>
        <Button onClick={() => router.push("/dashboard/sectors")}>
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
            <h1 className="text-2xl font-bold tracking-tight">تفاصيل القاطع</h1>
            <p className="text-sm text-muted-foreground">
              {sector.name} ({sector.code})
            </p>
          </div>
        </div>
        <div className="flex gap-2">{/* Edit button could go here */}</div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5 text-indigo-600" />
              معلومات أساسية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">اسم القاطع</div>
                <div className="font-medium">{sector.name}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">الكود</div>
                <div className="font-medium font-mono">{sector.code}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">المحافظة</div>
                <div className="font-medium flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {sector.province?.name || "-"}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">الحالة</div>
                <Badge variant={sector.is_active ? "default" : "secondary"}>
                  {sector.is_active ? "نشط" : "غير نشط"}
                </Badge>
              </div>
              <div className="col-span-2">
                <div className="text-sm text-muted-foreground">
                  تاريخ الإنشاء
                </div>
                <div className="font-medium flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {new Date(sector.created_at).toLocaleDateString("ar-EG")}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-600" />
              القائد والمسؤولية
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sector.leader ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl">
                    {sector.leader.full_name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-lg">
                      {sector.leader.full_name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {sector.leader.phone || "-"}
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <div className="text-sm text-muted-foreground">
                    كود القائد
                  </div>
                  <div className="font-mono">
                    {sector.leader.custom_code || "-"}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                <User className="h-10 w-10 mb-2 opacity-20" />
                <p>لا يوجد قائد معين لهذا القاطع</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="groups" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="groups">المجاميع ({groupsTotal})</TabsTrigger>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>قائمة المجاميع</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">اسم المجموعة</TableHead>
                    <TableHead className="text-right">الكود</TableHead>
                    <TableHead className="text-right">المحافظة</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupsLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        جاري التحميل...
                      </TableCell>
                    </TableRow>
                  ) : groups.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        لا توجد مجاميع في هذا القاطع
                      </TableCell>
                    </TableRow>
                  ) : (
                    groups.map((group) => (
                      <TableRow key={group.id}>
                        <TableCell className="font-medium">
                          {group.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {group.code}
                          </Badge>
                        </TableCell>
                        <TableCell>{group.province?.name || "-"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              !group.is_banned ? "default" : "destructive"
                            }
                          >
                            {!group.is_banned ? "نشط" : "محظور"}
                          </Badge>
                        </TableCell>
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
                                  router.push(`/dashboard/groups/${group.id}`)
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
                  onClick={() => setGroupsPage((p) => Math.max(1, p - 1))}
                  disabled={groupsPage === 1 || groupsLoading}
                >
                  السابق
                </Button>
                <div className="text-sm">الصفحة {groupsPage}</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setGroupsPage((p) => p + 1)}
                  disabled={groups.length < groupsLimit || groupsLoading}
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
                مزيد من الإحصائيات والتفاصيل يمكن إضافتها هنا.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
