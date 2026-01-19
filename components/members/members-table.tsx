"use client";

import { useState, useEffect } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, Plus, Trash2 } from "lucide-react";
import { MemberFilters } from "./members-filter"; // Keep type for now, but remove UI component usage
import { ExportMembersDialog } from "./export-members-dialog";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";

interface MembersTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filters: MemberFilters;
  onFilterChange: (filters: MemberFilters) => void;
  onSearchChange: (search: string) => void;
  searchQuery: string;
}

export function MembersTable<TData, TValue>({
  columns,
  data,
  filters,
  onFilterChange,
  onSearchChange,
  searchQuery,
}: MembersTableProps<TData, TValue>) {
  const router = useRouter();

  // Data for filters (we should fetch this, ideally passing it from page or fetching here)
  // To keep it simple and encapsulated as user requested, I will fetch here.
  const [provinces, setProvinces] = useState<
    { label: string; value: string }[]
  >([]);
  const [groups, setGroups] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [provRes, groupRes] = await Promise.all([
          apiClient.get("/provinces"),
          apiClient.get("/groups"),
        ]);
        setProvinces(
          provRes.data.map((p: any) => ({ label: p.name, value: p.id })),
        );
        setGroups(
          groupRes.data.map((g: any) => ({ label: g.name, value: g.id })),
        );
      } catch (error) {
        console.error("Failed to fetch filter options", error);
      }
    };
    fetchOptions();
  }, []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 8,
      },
    },
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 bg-card p-4 rounded-lg border shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          {/* Left: Search + Filters */}
          <div className="flex flex-1 flex-col sm:flex-row items-center gap-2 w-full">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث بالاسم أو الهاتف..."
                value={searchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
                className="pr-10 bg-background"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
              <DataTableFacetedFilter
                title="المحافظة"
                options={provinces}
                selectedValues={
                  filters.province_id
                    ? new Set([filters.province_id])
                    : undefined
                }
                onSelect={(vals) => {
                  // Single select for now as per backend limitation (allows one id),
                  // but UI supports multi. We take the first one or undefined.
                  const val = vals?.values().next().value;
                  onFilterChange({ ...filters, province_id: val });
                }}
              />
              <DataTableFacetedFilter
                title="المجموعة"
                options={groups}
                selectedValues={
                  filters.group_id ? new Set([filters.group_id]) : undefined
                }
                onSelect={(vals) => {
                  const val = vals?.values().next().value;
                  onFilterChange({ ...filters, group_id: val });
                }}
              />

              {(filters.province_id || filters.group_id) && (
                <Button
                  variant="ghost"
                  onClick={() => onFilterChange({})}
                  className="h-8 px-2 lg:px-3 text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  إعادة تعيين
                  <Trash2 className="mr-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <ExportMembersDialog data={data as any} />
            <Button
              onClick={() => router.push("/dashboard/members/create")}
              className="shadow-sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              إضافة عضو
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-right h-12">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/30 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  لا توجد نتائج مطابقة
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 space-x-reverse py-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          السابق
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          التالي
        </Button>
      </div>
    </div>
  );
}
