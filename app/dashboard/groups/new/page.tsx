"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Check, ChevronsUpDown, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
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
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";

const formSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  code: z.string().min(2, "الكود يجب أن يكون حرفين على الأقل"),
  province_id: z.string().optional(),
  sector_id: z.string().optional(),
  leader_id: z.string().optional(),
  is_banned: z.boolean(),
  logo_key: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Helper function to get Arabic role labels
const getRoleLabel = (roleName: string): string => {
  const roleLabels: Record<string, string> = {
    admin: "مدير النظام",
    finance_manager: "مدير مالي",
    sector_leader: "مسؤول قاطع",
    group_leader: "مسؤول مجموعة",
    trainer: "مدرب",
    visit_admin: "مسؤول زيارات",
    member: "منتسب",
  };
  return roleLabels[roleName] || roleName;
};

export default function AddGroupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Data State
  const [provinces, setProvinces] = useState<any[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);

  // Popover State
  const [openProvince, setOpenProvince] = useState(false);
  const [openSector, setOpenSector] = useState(false);
  const [openLeader, setOpenLeader] = useState(false);

  // Logo State
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      code: "",
      is_banned: false,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [provincesData, sectorsData, membersData] = await Promise.all([
          apiClient.getProvinces(),
          apiClient.getSectors(),
          apiClient.getMembers({ limit: 100 }),
        ]);

        // Extract arrays from API responses
        const provincesArray = Array.isArray(provincesData)
          ? provincesData
          : provincesData?.items || provincesData?.data || [];
        const sectorsArray = Array.isArray(sectorsData)
          ? sectorsData
          : sectorsData?.items || sectorsData?.data || [];
        const membersArray = Array.isArray(membersData)
          ? membersData
          : membersData?.items || membersData?.data || [];

        setProvinces(provincesArray);
        setSectors(sectorsArray);

        // Filter members to show only those with "member" role
        const memberRoleMembers = membersArray.filter(
          (member: any) =>
            member.role_name === "member" || member.role_name === "منتسب",
        );
        setMembers(memberRoleMembers);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
        toast.error("فشل تحميل البيانات الأولية");
      }
    };
    fetchData();
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("يرجى اختيار صورة فقط");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("حجم الصورة يجب أن يكون أقل من 5 ميجابايت");
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);

      // Create the group first
      const createdGroup = await apiClient.createGroup(values);

      // If logo file exists, upload it
      if (logoFile && createdGroup.id) {
        try {
          await apiClient.uploadGroupLogo(createdGroup.id, logoFile);
          toast.success("تم إنشاء المجموعة ورفع الشعار بنجاح");
        } catch (uploadError) {
          console.error("Failed to upload logo:", uploadError);
          toast.warning("تم إنشاء المجموعة لكن فشل رفع الشعار");
        }
      } else {
        toast.success("تم إنشاء المجموعة بنجاح");
      }

      router.push("/dashboard/groups");
    } catch (error: any) {
      console.error("Failed to create group:", error);
      toast.error(
        "فشل إنشاء المجموعة: " +
          (error.response?.data?.message || "خطأ غير معروف"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          إضافة مجموعة جديدة
        </h1>
        <p className="text-muted-foreground mt-2">
          أدخل بيانات المجموعة الجديدة
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>بيانات المجموعة</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">اسم المجموعة</Label>
              <Input
                id="name"
                placeholder="مثال: مجموعة المجتبى"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">كود المجموعة</Label>
              <Input
                id="code"
                placeholder="مثال: GRP-001"
                {...register("code")}
              />
              {errors.code && (
                <p className="text-sm text-red-500">{errors.code.message}</p>
              )}
            </div>

            {/* Logo Upload */}
            <div className="space-y-2">
              <Label>شعار المجموعة</Label>
              {!logoPreview ? (
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    id="logo-upload"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      اضغط لرفع الشعار
                    </span>
                    <span className="text-xs text-muted-foreground">
                      PNG, JPG حتى 5MB
                    </span>
                  </label>
                </div>
              ) : (
                <div className="relative border rounded-lg p-4 flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={logoPreview}
                      alt="Logo preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{logoFile?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(logoFile?.size! / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={removeLogo}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <p className="text-sm text-muted-foreground">اختياري</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Province Selection */}
              <div className="space-y-2">
                <Label>المحافظة</Label>
                <Popover open={openProvince} onOpenChange={setOpenProvince}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openProvince}
                      className="w-full justify-between font-normal text-right"
                    >
                      <span className="truncate">
                        {watch("province_id")
                          ? provinces.find((p) => p.id === watch("province_id"))
                              ?.name
                          : "اختر المحافظة"}
                      </span>
                      <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="ابحث عن محافظة..." />
                      <CommandList>
                        <CommandEmpty>لا توجد نتائج.</CommandEmpty>
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
                                  "mr-2 h-4 w-4",
                                  watch("province_id") === province.id
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {province.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <p className="text-sm text-muted-foreground">اختياري</p>
              </div>

              {/* Sector Selection */}
              <div className="space-y-2">
                <Label>القطاع</Label>
                <Popover open={openSector} onOpenChange={setOpenSector}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openSector}
                      className="w-full justify-between font-normal text-right"
                    >
                      <span className="truncate">
                        {watch("sector_id")
                          ? sectors.find((s) => s.id === watch("sector_id"))
                              ?.name
                          : "اختر القطاع"}
                      </span>
                      <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="ابحث عن قطاع..." />
                      <CommandList>
                        <CommandEmpty>لا توجد نتائج.</CommandEmpty>
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
                                  "mr-2 h-4 w-4",
                                  watch("sector_id") === sector.id
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {sector.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <p className="text-sm text-muted-foreground">اختياري</p>
              </div>
            </div>

            {/* Leader Selection */}
            <div className="space-y-2">
              <Label>قائد المجموعة</Label>
              <Popover open={openLeader} onOpenChange={setOpenLeader}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openLeader}
                    className="w-full justify-between font-normal text-right"
                  >
                    <span className="truncate">
                      {watch("leader_id")
                        ? members.find((m) => m.id === watch("leader_id"))
                            ?.full_name
                        : "اختر القائد"}
                    </span>
                    <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
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
                              setValue("leader_id", member.id);
                              setOpenLeader(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                watch("leader_id") === member.id
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
              <p className="text-sm text-muted-foreground">اختياري</p>
            </div>

            <div className="flex justify-end space-x-2 space-x-reverse pt-4 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                إنشاء المجموعة
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
