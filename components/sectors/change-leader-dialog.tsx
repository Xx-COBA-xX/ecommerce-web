"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ChangeLeaderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectorId: string;
  currentLeader?: {
    id: string;
    full_name: string;
  };
  onSuccess: () => void;
}

const getRoleLabel = (roleName: string): string => {
  const roleLabels: Record<string, string> = {
    admin: "مدير النظام",
    finance_manager: "مدير مالي",
    sector_leader: "قائد قاطع",
    group_leader: "قائد مجموعة",
    trainer: "مدرب",
    visit_admin: "مسؤول زيارات",
  };
  return roleLabels[roleName] || roleName;
};

export function ChangeLeaderDialog({
  open,
  onOpenChange,
  sectorId,
  currentLeader,
  onSuccess,
}: ChangeLeaderDialogProps) {
  const [members, setMembers] = useState<any[]>([]);
  const [selectedLeaderId, setSelectedLeaderId] = useState<string>("");
  const [openCombobox, setOpenCombobox] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (open) {
      fetchMembers();
    }
  }, [open]);

  const fetchMembers = async () => {
    try {
      setFetching(true);
      const response = await apiClient.getMembers({ limit: 100 });
      const membersList = response.data || response.items || [];

      // Filter out current leader and members who are already sector leaders
      const availableMembers = membersList.filter(
        (m: any) =>
          m.id !== currentLeader?.id &&
          m.account?.role?.name !== "sector_leader",
      );

      setMembers(availableMembers);
    } catch (error) {
      console.error("Failed to fetch members:", error);
      toast.error("فشل تحميل قائمة الأعضاء");
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedLeaderId) {
      toast.error("يجب اختيار قائد جديد");
      return;
    }

    try {
      setLoading(true);
      await apiClient.changeSectorLeader(sectorId, selectedLeaderId);
      toast.success("تم تغيير قائد القاطع بنجاح");
      onSuccess();
      onOpenChange(false);
      setSelectedLeaderId("");
    } catch (error: any) {
      console.error("Failed to change leader:", error);
      toast.error(error.response?.data?.message || "فشل تغيير قائد القاطع");
    } finally {
      setLoading(false);
    }
  };

  const selectedMember = members.find((m) => m.id === selectedLeaderId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>تغيير قائد القاطع</DialogTitle>
          <DialogDescription>
            اختر قائدًا جديدًا للقاطع. سيتم تحديث الأدوار تلقائيًا.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {currentLeader && (
            <div className="space-y-2">
              <Label>القائد الحالي</Label>
              <div className="p-3 bg-muted rounded-md">
                <p className="font-medium">{currentLeader.full_name}</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>القائد الجديد *</Label>
            {fetching ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCombobox}
                    className="w-full justify-between font-normal text-right"
                  >
                    <span className="truncate">
                      {selectedMember
                        ? selectedMember.full_name
                        : "اختر القائد الجديد"}
                    </span>
                    <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[450px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="ابحث عن عضو..." />
                    <CommandList>
                      <CommandEmpty>لا توجد نتائج.</CommandEmpty>
                      <CommandGroup>
                        {members.map((member) => (
                          <CommandItem
                            key={member.id}
                            value={member.full_name}
                            onSelect={() => {
                              setSelectedLeaderId(member.id);
                              setOpenCombobox(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedLeaderId === member.id
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            <div className="flex items-center justify-between w-full">
                              <span>{member.full_name}</span>
                              {member.account?.role && (
                                <Badge
                                  variant="secondary"
                                  className="mr-2 text-xs"
                                >
                                  {getRoleLabel(member.account.role.name)}
                                </Badge>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            إلغاء
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !selectedLeaderId}
          >
            {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            تأكيد التغيير
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
