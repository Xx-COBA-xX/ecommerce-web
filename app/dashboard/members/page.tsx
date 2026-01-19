"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { apiClient } from "@/lib/api-client";
import {
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  FileDown,
  SlidersHorizontal,
  Mail,
  Phone,
} from "lucide-react";
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Member {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  role: string;
  created_at: string;
  province?: { name: string };
  group?: { name: string };
  status?: string;
}

export default function MembersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await apiClient.get("/members");
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];
      setMembers(data);
    } catch (error: any) {
      toast.error("فشل تحميل قائمة الأعضاء");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter & Pagination Logic
  const filteredMembers = useMemo(() => {
    return members.filter(
      (member) =>
        member.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.phone?.includes(searchQuery)
    );
  }, [members, searchQuery]);

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const currentMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا العضو؟")) return;
    try {
      await apiClient.delete(`/members/${id}`);
      toast.success("تم حذف العضو بنجاح");
      fetchMembers();
    } catch (error) {
      toast.error("فشل حذف العضو");
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">إدارة الأعضاء</h2>
          <p className="text-muted-foreground">
            عرض وإدارة جميع أعضاء المؤسسة ({filteredMembers.length} عضو)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="hidden sm:flex">
            <FileDown className="mr-2 h-4 w-4" />
            تصدير Excel
          </Button>
          <Button onClick={() => router.push("/dashboard/members/create")}>
            <Plus className="mr-2 h-4 w-4" />
            إضافة عضو
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث بالاسم أو رقم الهاتف..."
            className="pr-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">الاسم الكامل</TableHead>
              <TableHead className="text-right">الاتصال</TableHead>
              <TableHead className="text-right">المحافظة</TableHead>
              <TableHead className="text-right">المجموعة</TableHead>
              <TableHead className="text-right">تاريخ الإضافة</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span>جاري التحميل...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : currentMembers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  لا يوجد أعضاء مطابقين للبحث
                </TableCell>
              </TableRow>
            ) : (
              currentMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{member.full_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {member.phone || "-"}
                      </div>
                      {member.email && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {member.email}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{member.province?.name || "-"}</TableCell>
                  <TableCell>
                    {member.group ? (
                      <Badge variant="secondary" className="font-normal">
                        {member.group.name}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="font-normal">
                        لا يوجد مجموعة
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(member.created_at).toLocaleDateString("ar-IQ")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      نشط
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
                        <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/dashboard/members/${member.id}`)
                          }
                        >
                          عرض التفاصيل
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/dashboard/members/${member.id}/edit`)
                          }
                        >
                          تعديل
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
                          onClick={() => handleDelete(member.id)}
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

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) setCurrentPage((p) => p - 1);
                }}
                className={
                  currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>

            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  isActive={currentPage === i + 1}
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(i + 1);
                  }}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) setCurrentPage((p) => p + 1);
                }}
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
