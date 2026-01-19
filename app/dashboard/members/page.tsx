"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { getColumns } from "@/components/members/columns";
import { MembersTable } from "@/components/members/members-table";
import { MemberFilters } from "@/components/members/members-filter";

export interface Member {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  role: string;
  created_at: string;
  province?: { name: string };
  group?: { name: string };
  status?: string;
  documents?: { document_type: string; file_url: string }[];
}

export default function MembersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<MemberFilters>({});

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchMembers();
  }, [filters]); // Re-fetch when filters change

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      // Build query params
      const params: any = {};
      if (searchQuery) params.query = searchQuery;
      if (filters.province_id) params.province_id = filters.province_id;
      if (filters.group_id) params.group_id = filters.group_id;
      if (filters.role_id) params.role_id = filters.role_id;

      // console.log("Fetching members with params:", params);

      const response = await apiClient.get("/members", { params });
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];
      setMembers(data);
    } catch (error: any) {
      toast.error("فشل تحميل قائمة الأعضاء");
      console.error(error);
    } finally {
      setIsLoading(false);
      console.log("Finished fetching members.");
    }
  };

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      // console.log("Executing search for:", searchQuery);
      fetchMembers();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("هل أنت متأكد من حذف هذا العضو؟")) return;
      try {
        await apiClient.delete(`/members/${id}`);
        toast.success("تم حذف العضو بنجاح");
        fetchMembers();
      } catch (error) {
        toast.error("فشل حذف العضو");
      }
    },
    [fetchMembers],
  ); // fetchMembers is stable enough due to its dependencies

  const columns = useMemo(() => getColumns(handleDelete), [handleDelete]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">إدارة الأعضاء</h2>
          <p className="text-muted-foreground">عرض وإدارة جميع أعضاء المؤسسة</p>
        </div>
      </div>

      <MembersTable
        columns={columns}
        data={members}
        filters={filters}
        onFilterChange={setFilters}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
    </div>
  );
}
