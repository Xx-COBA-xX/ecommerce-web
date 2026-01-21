"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Check, ChevronsUpDown, Loader2, ArrowRight, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ChangeLeaderDialog } from "@/components/group/change-leader-dialog";

const formSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  code: z.string().min(2, "الكود يجب أن يكون حرفين على الأقل"),
  province_id: z.string().optional(),
  sector_id: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditGroupPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [group, setGroup] = useState<any>(null);

  // Data State
  const [provinces, setProvinces] = useState<any[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);

  // Popover State
  const [openProvince, setOpenProvince] = useState(false);
  const [openSector, setOpenSector] = useState(false);

  // Dialog State
  const [changeLeaderDialogOpen, setChangeLeaderDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [groupData, provincesData, sectorsData] = await Promise.all([
          apiClient.getGroup(groupId),
          apiClient.getProvinces(),
          apiClient.getSectors(),
        ]);

        setGroup(groupData);

        // Set form values
        setValue("name", groupData.name);
        setValue("code", groupData.code);
        setValue("province_id", groupData.province_id || "");
        setValue("sector_id", groupData.sector_id || "");

        // Extract arrays from API responses
        const provincesArray = Array.isArray(provincesData)
          ? provincesData
          : provincesData?.items || provincesData?.data || [];
        const sectorsArray = Array.isArray(sectorsData)
          ? sectorsData
          : sectorsData?.items || sectorsData?.data || [];

        setProvinces(provincesArray);
        setSectors(sectorsArray);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("فشل تحميل البيانات");
        router.push("/dashboard/groups");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [groupId, router, setValue]);

  const refreshGroup = async () => {
    try {
      const groupData = await apiClient.getGroup(groupId);
      setGroup(groupData);
      setValue("name", groupData.name);
      setValue("code", groupData.code);
      setValue("province_id", groupData.province_id || "");
      setValue("sector_id", groupData.sector_id || "");
    } catch (error) {
      console.error("Failed to refresh group:", error);
      toast.error("فشل تحديث البيانات");
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setSubmitting(true);
      await apiClient.updateGroup(groupId, values);
      toast.success("تم تحديث المجموعة بنجاح");
      router.push(`/dashboard/groups/${groupId}`);
    } catch (error: any) {
      console.error("Failed to update group:", error);
      toast.error(error.response?.data?.message || "فشل تحديث المجموعة");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10" dir="rtl">
      <div className="mb-6 flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/dashboard/groups/${groupId}`)}
        >
          <ArrowRight className="h-4 w-4 ml-2" />
          رجوع
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">تعديل المجموعة</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">اسم المجموعة *</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="أدخل اسم المجموعة"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Code */}
              <div className="space-y-2">
                <Label htmlFor="code">الكود *</Label>
                <Input
                  id="code"
                  {...register("code")}
                  placeholder="أدخل كود المجموعة"
                />
                {errors.code && (
                  <p className="text-sm text-destructive">
                    {errors.code.message}
                  </p>
                )}
              </div>

              {/* Province */}
              <div className="space-y-2">
                <Label>المحافظة</Label>
                <Popover open={openProvince} onOpenChange={setOpenProvince}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openProvince}
                      className="w-full justify-between"
                    >
                      {watch("province_id")
                        ? provinces.find((p) => p.id === watch("province_id"))
                            ?.name
                        : "اختر المحافظة"}
                      <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="ابحث عن محافظة..." />
                      <CommandEmpty>لا توجد نتائج</CommandEmpty>
                      <CommandGroup>
                        {provinces.map((province) => (
                          <CommandItem
                            key={province.id}
                            value={province.name}
                            onSelect={() => {
                              setValue("province_id", province.id);
                              setOpenProvince(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "ml-2 h-4 w-4",
                                watch("province_id") === province.id
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            {province.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Sector */}
              <div className="space-y-2">
                <Label>القطاع</Label>
                <Popover open={openSector} onOpenChange={setOpenSector}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openSector}
                      className="w-full justify-between"
                    >
                      {watch("sector_id")
                        ? sectors.find((s) => s.id === watch("sector_id"))?.name
                        : "اختر القطاع"}
                      <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="ابحث عن قطاع..." />
                      <CommandEmpty>لا توجد نتائج</CommandEmpty>
                      <CommandGroup>
                        {sectors.map((sector) => (
                          <CommandItem
                            key={sector.id}
                            value={sector.name}
                            onSelect={() => {
                              setValue("sector_id", sector.id);
                              setOpenSector(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "ml-2 h-4 w-4",
                                watch("sector_id") === sector.id
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            {sector.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Leader Info */}
            {group?.leader && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">القائد الحالي</p>
                      <p className="text-sm text-muted-foreground">
                        {group.leader.full_name}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setChangeLeaderDialogOpen(true)}
                  >
                    تغيير القائد
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 space-x-reverse gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/dashboard/groups/${groupId}`)}
                disabled={submitting}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                )}
                حفظ التغييرات
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Change Leader Dialog */}
      <ChangeLeaderDialog
        open={changeLeaderDialogOpen}
        onOpenChange={setChangeLeaderDialogOpen}
        groupId={groupId}
        currentLeader={group?.leader}
        onSuccess={refreshGroup}
      />
    </div>
  );
}
