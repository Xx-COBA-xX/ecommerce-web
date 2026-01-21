"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Search,
  Building2,
  MapPin,
  User,
  Eye,
  Trash2,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";

export default function GroupsPage() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const isMounted = useRef(false);

  // Debounced search
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    const timer = setTimeout(() => {
      setPage(1);
      // Force fetch if page is already 1
      if (page === 1) {
        fetchGroups(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchGroups(page);
  }, [page]);

  const fetchGroups = async (pageNum: number) => {
    try {
      setLoading(true);
      const response = await apiClient.getGroups({
        page: pageNum,
        limit,
        search: searchQuery || undefined,
      });

      // Backend now returns PaginatedResponseDto
      const items = response.data || response.items || [];
      const totalItems = response.meta?.totalItems || response.total || 0;

      setData(items);
      setTotal(totalItems);
    } catch (error) {
      console.error("Failed to fetch groups:", error);
      toast.error("فشل تحميل قائمة المجاميع");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه المجموعة؟")) return;
    try {
      await apiClient.deleteGroup(id);
      toast.success("تم حذف المجموعة بنجاح");
      fetchGroups(page);
    } catch (error) {
      console.error("Failed to delete group:", error);
      toast.error("فشل حذف المجموعة");
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">المجاميع</h1>
          <p className="text-muted-foreground mt-2">
            إدارة المجاميع والبحث والتصفية
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/groups/new")}>
          <Plus className="ml-2 h-4 w-4" />
          إضافة مجموعة
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-2 space-x-reverse bg-background/50 p-4 rounded-lg border">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث (الاسم، الكود)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-9"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">الاسم</TableHead>
              <TableHead className="text-right">الكود</TableHead>
              <TableHead className="text-right">القطاع</TableHead>
              <TableHead className="text-right">المحافظة</TableHead>
              <TableHead className="text-right">القائد</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right w-[100px]">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody
            className={
              loading && data.length > 0
                ? "opacity-50 pointer-events-none transition-opacity"
                : ""
            }
          >
            {loading && data.length === 0 ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-[150px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[120px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[60px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  لا توجد مجاميع
                </TableCell>
              </TableRow>
            ) : (
              data.map((group) => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {group.code}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex items-center gap-1">
                    <Building2 className="h-3 w-3 text-muted-foreground" />
                    {group.sector?.name || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      {group.province?.name || "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    {group.leader ? (
                      <div className="flex items-center gap-1 text-sm">
                        <User className="h-3 w-3 text-muted-foreground" />
                        {group.leader.full_name}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={!group.is_banned ? "default" : "destructive"}
                    >
                      {!group.is_banned ? "نشط" : "محظور"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          router.push(`/dashboard/groups/${group.id}`)
                        }
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          router.push(`/dashboard/groups/${group.id}/edit`)
                        }
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => {
                          // TODO: Implement delete functionality
                          toast.info("سيتم تفعيل الحذف قريباً");
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 space-x-reverse">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1 || loading}
        >
          السابق
        </Button>
        <div className="text-sm px-2">
          صفحة {page} من {totalPages || 1}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => p + 1)}
          disabled={page >= totalPages || loading}
        >
          التالي
        </Button>
      </div>
    </div>
  );
}
