"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Member } from "@/app/dashboard/members/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Eye,
  Pen,
  Trash2,
  Phone,
  Building2,
  MapPin,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

// Provide a type compatible with the columns
export type MemberColumn = Member;

// Helper component for Delete to avoid cluttering column def with logic
// (and to allow us to pass refresh callbacks if we wanted, though standard way is just query invalidation).
// Actually, since I can't easily pass "refresh" here without context, I will stick to the basic button
// and maybe letting the user know they need to refresh manually? No, that's bad UX.
// Better approach: The `page.tsx` handles delete.
// BUT, separating columns makes it harder.
// Solution: Define columns *inside* the component or use `meta`.
// Usage of `meta` is best. I will assume table has meta.deleteMember.

// Revised approach: Export a function to get columns, so we can pass handlers
export const getColumns = (
  onDelete: (id: string) => void,
): ColumnDef<MemberColumn>[] => [
  {
    accessorKey: "full_name",
    header: ({ column }) => <div className="text-right">الاسم</div>,
    cell: ({ row }) => {
      const member = row.original;
      const profilePic = member.documents?.find(
        (d: any) => d.document_type === "photo",
      )?.file_url;
      const initials = member.full_name?.slice(0, 2).toUpperCase() || "??";

      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border cursor-pointer hover:opacity-80 transition-opacity">
            <AvatarImage
              src={profilePic}
              alt={member.full_name}
              className="object-cover"
            />
            <AvatarFallback className="bg-primary/5 text-primary text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <Link
              href={`/dashboard/members/${member.id}`}
              className="font-medium text-sm hover:underline hover:text-primary transition-colors"
            >
              {member.full_name}
            </Link>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {member.phone || "-"}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "province",
    header: ({ column }) => <div className="text-right">الموقع</div>,
    cell: ({ row }) => {
      const province = row.original.province?.name;
      return province ? (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {province}
        </div>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
  },
  {
    accessorKey: "group",
    header: ({ column }) => <div className="text-right">المجموعة</div>,
    cell: ({ row }) => {
      const group = row.original.group?.name;
      return group ? (
        <Badge
          variant="secondary"
          className="font-normal text-xs px-2 py-0.5 h-6"
        >
          {group}
        </Badge>
      ) : (
        <Badge variant="outline">
          لاتوجد مجموعة
        </Badge>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => <div className="text-right">تاريخ الانضمام</div>,
    cell: ({ row }) => {
      return (
        <div className="text-sm text-muted-foreground font-mono">
          {new Date(row.original.created_at).toLocaleDateString("ar-IQ")}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const member = row.original;

      return (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            asChild
          >
            <Link href={`/dashboard/members/${member.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
            asChild
          >
            <Link href={`/dashboard/members/${member.id}/edit`}>
              <Pen className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => onDelete(member.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
