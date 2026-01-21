"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
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
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Check, ChevronsUpDown, Loader2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ChangeLeaderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  currentLeader: any;
  onSuccess: () => void;
}

export function ChangeLeaderDialog({
  open,
  onOpenChange,
  groupId,
  currentLeader,
  onSuccess,
}: ChangeLeaderDialogProps) {
  const [members, setMembers] = useState<any[]>([]);
  const [selectedLeaderId, setSelectedLeaderId] = useState<string>("");
  const [openMemberSelect, setOpenMemberSelect] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      fetchMembers();
    }
  }, [open]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getMembers({ limit: 100 });

      const membersArray = Array.isArray(response)
        ? response
        : response?.items || response?.data || [];

      // Filter to show only members with "member" role
      // Exclude current leader
      const availableMembers = membersArray.filter(
        (member: any) =>
          (member.role_name === "member" || member.role_name === "منتسب") &&
          member.id !== currentLeader?.id,
      );

      setMembers(availableMembers);
    } catch (error) {
      console.error("Failed to fetch members:", error);
      toast.error("فشل تحميل قائمة الأعضاء");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedLeaderId) {
      toast.error("يرجى اختيار قائد جديد");
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.changeGroupLeader(groupId, selectedLeaderId);
      toast.success("تم تغيير قائد المجموعة بنجاح");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Failed to change leader:", error);
      toast.error(error.response?.data?.message || "فشل تغيير قائد المجموعة");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedMember = members.find((m) => m.id === selectedLeaderId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>تغيير قائد المجموعة</DialogTitle>
          <DialogDescription>
            اختر عضواً جديداً ليكون قائد المجموعة. يجب أن يكون العضو بدور
            "منتسب".
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Leader */}
          {currentLeader && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-1">القائد الحالي</p>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{currentLeader.full_name}</span>
                {currentLeader.custom_code && (
                  <span className="text-xs text-muted-foreground">
                    ({currentLeader.custom_code})
                  </span>
                )}
              </div>
            </div>
          )}

          {/* New Leader Selection */}
          <div className="space-y-2">
            <Label>القائد الجديد *</Label>
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Popover
                open={openMemberSelect}
                onOpenChange={setOpenMemberSelect}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openMemberSelect}
                    className="w-full justify-between"
                  >
                    {selectedMember ? (
                      <span className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {selectedMember.full_name}
                        {selectedMember.custom_code && (
                          <span className="text-xs text-muted-foreground">
                            ({selectedMember.custom_code})
                          </span>
                        )}
                      </span>
                    ) : (
                      "اختر القائد الجديد"
                    )}
                    <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="ابحث عن عضو..." />
                    <CommandEmpty>لا توجد نتائج</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-auto">
                      {members.map((member) => (
                        <CommandItem
                          key={member.id}
                          value={`${member.full_name} ${member.custom_code || ""}`}
                          onSelect={() => {
                            setSelectedLeaderId(member.id);
                            setOpenMemberSelect(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "ml-2 h-4 w-4",
                              selectedLeaderId === member.id
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          <div className="flex flex-col">
                            <span>{member.full_name}</span>
                            {member.custom_code && (
                              <span className="text-xs text-muted-foreground">
                                {member.custom_code}
                              </span>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
            {members.length === 0 && !loading && (
              <p className="text-sm text-muted-foreground">
                لا يوجد أعضاء متاحين بدور "منتسب"
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            إلغاء
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !selectedLeaderId}
          >
            {submitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            تغيير القائد
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
