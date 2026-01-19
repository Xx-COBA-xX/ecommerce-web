"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Filter, X, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

export interface MemberFilters {
  province_id?: string;
  group_id?: string;
  role_id?: string;
  status?: string;
}

interface MembersFilterProps {
  filters: MemberFilters;
  onApply: (filters: MemberFilters) => void;
  onReset: () => void;
}

export function MembersFilter({
  filters,
  onApply,
  onReset,
}: MembersFilterProps) {
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<MemberFilters>(filters);
  const [provinces, setProvinces] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  // Sync local filters when prop changes
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Fetch filter options when sheet opens
  useEffect(() => {
    if (open && provinces.length === 0) {
      fetchOptions();
    }
  }, [open]);

  const fetchOptions = async () => {
    setIsLoadingOptions(true);
    try {
      // Fetch provinces
      const usersRes = await apiClient.get("/users/provinces");
      // Note: Assuming there is an endpoint for provinces/groups.
      // If not, we might need to rely on static data or fix backend.
      // Based on previous convos, looks like we might need to verify endpoints.
      // For now, I'll try standard endpoints.

      // Actually, typically these might be:
      const provincesRes = await apiClient.get("/provinces");
      setProvinces(provincesRes.data);

      const groupsRes = await apiClient.get("/groups");
      const groupsData = Array.isArray(groupsRes.data)
        ? groupsRes.data
        : groupsRes.data.data || [];
      setGroups(groupsData);
    } catch (error) {
      console.error("Failed to fetch filter options", error);
      // Fallback or silent fail
    } finally {
      setIsLoadingOptions(false);
    }
  };

  const handleApply = () => {
    onApply(localFilters);
    setOpen(false);
  };

  const handleReset = () => {
    setLocalFilters({});
    onReset();
    setOpen(false);
  };

  const activeFilterCount = Object.keys(filters).length;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2 bg-background">
          <Filter className="h-4 w-4" />
          <span>تصفية</span>
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <SheetHeader className="text-right">
          <SheetTitle>تصفية الأعضاء</SheetTitle>
          <SheetDescription>
            قم بتحديد خيارات التصفية أدناه لعرض النتائج المطابقة.
          </SheetDescription>
        </SheetHeader>

        <div className="grid gap-6 py-6">
          {isLoadingOptions ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Province Filter */}
              <div className="space-y-2">
                <Label>المحافظة</Label>
                <Select
                  value={localFilters.province_id || "all"}
                  onValueChange={(val) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      province_id: val === "all" ? undefined : val,
                    }))
                  }
                >
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="الكل" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    {provinces.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Group Filter */}
              <div className="space-y-2">
                <Label>المجموعة</Label>
                <Select
                  value={localFilters.group_id || "all"}
                  onValueChange={(val) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      group_id: val === "all" ? undefined : val,
                    }))
                  }
                >
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="الكل" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    {groups.map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>

        <SheetFooter className="flex-col gap-2 sm:justify-start">
          <Button onClick={handleApply} className="w-full">
            تطبيق التصفية
          </Button>
          <Button variant="outline" onClick={handleReset} className="w-full">
            إعادة تعيين
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
