"use client";

import { useState, useEffect, useRef } from "react";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus, Search, Filter, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface Sector {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
  leader?: {
    full_name: string;
  };
  province?: {
    name: string;
  };
  created_at: string;
}

export default function SectorsPage() {
  const router = useRouter();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Filter State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const isMounted = useRef(false);

  // Debounced search
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    const timer = setTimeout(() => {
      setPage(1);
      // We don't call fetchSectors here directly if page is already 1,
      // because setPage(1) won't trigger the page effect.
      // So we must force fetch if page is 1, otherwise let page effect handle it.
      if (page === 1) {
        fetchSectors(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchSectors(page);
  }, [page]);

  const fetchSectors = async (pageNum: number) => {
    try {
      setLoading(true);
      // Pass pagination and search params to API
      const response = await apiClient.getSectors({
        page: pageNum,
        limit,
        search: searchQuery || undefined,
      });

      const items = response.items || response.data || [];
      const totalItems =
        response.meta?.totalItems ||
        response.total ||
        items.length; /* Fallback if backend wrapper differs */

      setSectors(items);
      setTotal(totalItems);
    } catch (error) {
      console.error("Failed to fetch sectors:", error);
      toast.error("فشل تحميل القواطع");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا القاطع؟")) {
      try {
        await apiClient.deleteSector(id);
        toast.success("تم حذف القاطع بنجاح");
        fetchSectors(page);
      } catch (error) {
        console.error("Failed to delete sector:", error);
        toast.error("فشل حذف القاطع");
      }
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className=" space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">القطاعات</h1>
          <p className="text-muted-foreground mt-2">
            إدارة القطاعات والمجاميع التابعة لها
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/sectors/new")}>
          <Plus className="ml-2 h-4 w-4" />
          إضافة قاطع جديد
        </Button>
      </div>

      <div className="flex items-center space-x-2 space-x-reverse bg-background/50 p-4 rounded-lg border">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث عن قاطع (الاسم، الكود، المحافظة)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-9"
          />
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">اسم القاطع</TableHead>
              <TableHead className="text-right">الكود</TableHead>
              <TableHead className="text-right">المحافظة</TableHead>
              <TableHead className="text-right">المسؤول</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">تاريخ الإضافة</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody
            className={
              loading && sectors.length > 0
                ? "opacity-50 pointer-events-none transition-opacity"
                : ""
            }
          >
            {loading && sectors.length === 0 ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[60px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[60px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : sectors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  لا توجد قطاعات
                </TableCell>
              </TableRow>
            ) : (
              sectors.map((sector) => (
                <TableRow key={sector.id}>
                  <TableCell className="font-medium">{sector.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {sector.code}
                    </Badge>
                  </TableCell>
                  <TableCell>{sector.province?.name || "-"}</TableCell>
                  <TableCell>{sector.leader?.full_name || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={sector.is_active ? "default" : "secondary"}>
                      {sector.is_active ? "نشط" : "غير نشط"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(sector.created_at).toLocaleDateString("ar-EG")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/dashboard/sectors/${sector.id}`)
                          }
                        >
                          عرض التفاصيل
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/dashboard/sectors/${sector.id}/edit`, // Fixed routing
                            )
                          }
                        >
                          تعديل
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(sector.id)}
                        >
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-end space-x-2 space-x-reverse mt-4">
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
