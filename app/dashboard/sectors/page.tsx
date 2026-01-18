"use client";

import { useState, useEffect } from "react";
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
import { MoreHorizontal, Plus, Search, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  const [filteredSectors, setFilteredSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchSectors();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSectors(sectors);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = sectors.filter(
        (sector) =>
          sector.name.toLowerCase().includes(query) ||
          sector.code.toLowerCase().includes(query) ||
          sector.province?.name.toLowerCase().includes(query) ||
          sector.leader?.full_name.toLowerCase().includes(query),
      );
      setFilteredSectors(filtered);
    }
  }, [searchQuery, sectors]);

  const fetchSectors = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getSectors();
      setSectors(data);
      setFilteredSectors(data);
    } catch (error) {
      console.error("Failed to fetch sectors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا القاطع؟")) {
      try {
        await apiClient.deleteSector(id);
        fetchSectors();
      } catch (error) {
        console.error("Failed to delete sector:", error);
        alert("فشل حذف القاطع");
      }
    }
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
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
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  جاري التحميل...
                </TableCell>
              </TableRow>
            ) : filteredSectors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  لا توجد قطاعات
                </TableCell>
              </TableRow>
            ) : (
              filteredSectors.map((sector) => (
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
                              `/dashboard/sectors/${sector.id}?edit=true`,
                            )
                          } // Assuming edit inside details or we can add separate edit page
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
    </div>
  );
}
