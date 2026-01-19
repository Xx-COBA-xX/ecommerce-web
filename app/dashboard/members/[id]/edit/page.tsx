"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";
import { apiClient } from "@/lib/api-client";
import {
  createMemberSchema,
  type CreateMemberFormData,
} from "@/app/schemas/create-member";
import {
  Loader2,
  ArrowLeft,
  Save,
  Upload,
  FileText,
  X,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
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

// Enums matching backend (copied from create page)
enum UserRole {
  ADMIN = "admin",
  FINANCE_MANAGER = "finance_manager",
  GROUP_LEADER = "group_leader",
  TRAINER = "trainer",
  VISIT_ADMIN = "visit_admin",
}

const userRoleLabels: Record<string, string> = {
  [UserRole.ADMIN]: "مدير النظام (Admin)",
  [UserRole.FINANCE_MANAGER]: "المدير المالي",
  [UserRole.GROUP_LEADER]: "مسؤول مجموعة",
  [UserRole.TRAINER]: "مدرب",
  [UserRole.VISIT_ADMIN]: "مسؤول زيارات",
};

enum DocumentType {
  NATIONAL_ID_FRONT = "national_id_front",
  NATIONAL_ID_BACK = "national_id_back",
  PHOTO = "photo",
  RESIDENCE_CARD_FRONT = "residence_card_front",
  RESIDENCE_CARD_BACK = "residence_card_back",
  CERTIFICATE = "certificate",
  OTHER = "other",
}

export default function EditMemberPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // File Upload State Map
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({});

  // Dropdown Data States
  const [provinces, setProvinces] = useState<any[]>([]);
  const [educations, setEducations] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [openGroup, setOpenGroup] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateMemberFormData>({
    resolver: zodResolver(createMemberSchema),
  });

  // Fetch Dropdown Data & Member Data
  useEffect(() => {
    const initData = async () => {
      try {
        const [provincesRes, educationsRes, rolesRes, groupsRes] =
          await Promise.all([
            apiClient.get("/provinces"),
            apiClient.get("/educations"),
            apiClient.get("/roles"),
            apiClient.get("/groups"),
          ]);

        setProvinces(
          Array.isArray(provincesRes) ? provincesRes : provincesRes.data || [],
        );
        setEducations(
          Array.isArray(educationsRes)
            ? educationsRes
            : educationsRes.data || [],
        );
        setRoles(Array.isArray(rolesRes) ? rolesRes : rolesRes.data || []);
        setGroups(
          Array.isArray(groupsRes.data)
            ? groupsRes.data
            : groupsRes.data.data || [],
        );

        // Fetch Member Data
        if (params.id) {
          const { data: member } = await apiClient.get(`/members/${params.id}`);

          // Prepare form data
          const formData: any = {
            full_name: member.full_name,
            last_name: member.last_name,
            mother_name: member.mother_name,
            birth_date: member.birth_date
              ? new Date(member.birth_date).toISOString().split("T")[0]
              : "",
            phone: member.phone,
            national_id: member.national_id,
            residence: member.residence,
            landmark: member.landmark,
            province_id: member.province?.id || member.province_id,
            education_id: member.education?.id || member.education_id,
            group_id: member.group?.id || member.group_id,
            role_id: member.role?.id || member.role_id, // Might need to check account if role is not on member directly
            specialization: member.specialization,
            job: member.job,
            workplace: member.workplace,
            join_date: member.join_date
              ? new Date(member.join_date).toISOString().split("T")[0]
              : "",
            recommender_name: member.recommender_name,
            custom_code: member.custom_code,
            is_banned: member.is_banned,
          };

          // If member has linked account, populate account fields
          if (member.account) {
            formData.email = member.account.email;
            formData.role_id =
              member.account.role?.id || member.account.role_id;
          }

          reset(formData);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
        toast.error("فشل تحميل بيانات العضو");
      } finally {
        setIsInitializing(false);
      }
    };
    initData();
  }, [params.id, reset]);

  const handleFileChange = (
    type: DocumentType,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFiles((prev) => ({ ...prev, [type]: e.target.files![0] }));
    }
  };

  const removeFile = (type: DocumentType) => {
    setSelectedFiles((prev) => {
      const newState = { ...prev };
      delete newState[type];
      return newState;
    });
  };

  const onSubmit = async (data: CreateMemberFormData) => {
    setIsLoading(true);
    try {
      // 1. Prepare Member Data
      const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as any);

      // Remove password if empty (user might not want to reset it)
      if (!cleanData.password) {
        delete cleanData.password;
      }

      // Also remove email if it wasn't changed to avoid unique constraint if backend checks heavily (though update usually allows same email on same ID)
      // Usually Put handles this.

      // 2. Update Member
      await apiClient.put(`/members/${params.id}`, cleanData);

      // 3. Upload New Documents (if any)
      const uploadPromises = Object.entries(selectedFiles).map(
        async ([type, file]) => {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("member_id", params.id as string);
          formData.append("document_type", type);

          return apiClient.post("/member-documents", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        },
      );

      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
        toast.success("تم رفع المستندات الجديدة بنجاح");
      }

      toast.success("تم تحديث بيانات العضو بنجاح");
      router.push("/dashboard/members");
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message;
      // Clean error message if it is an array
      toast.error(
        typeof msg === "object"
          ? JSON.stringify(msg)
          : msg || "فشل تحديث البيانات",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Only admin can access (or same user logic if needed)
  if (user && user.role !== "admin") {
    // Optional: Allow user to edit their own profile? For now stick to admin.
    return (
      <div className="flex h-[50vh] items-center justify-center text-red-500 font-medium">
        عذراً، انت لا تملك صلاحية للوصول إلى هذه الصفحة
      </div>
    );
  }

  const UploadZone = ({
    type,
    label,
  }: {
    type: DocumentType;
    label: string;
  }) => (
    <div className="space-y-3">
      <Label className="text-base font-semibold">{label}</Label>
      {!selectedFiles[type] ? (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/5 hover:bg-muted/20 hover:border-primary/50 transition-all">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="h-6 w-6 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">اضغط لرفع ملف جديد</p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*,application/pdf"
            onChange={(e) => handleFileChange(type, e)}
          />
        </label>
      ) : (
        <div className="relative group">
          {selectedFiles[type].type.startsWith("image/") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={URL.createObjectURL(selectedFiles[type])}
              alt={label}
              className="w-full h-40 object-cover rounded-lg border shadow-sm"
            />
          ) : (
            <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded">
                  <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-sm truncate max-w-[150px]">
                  {selectedFiles[type].name}
                </div>
              </div>
            </div>
          )}
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={() => removeFile(type)}
            className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto max-w-5xl py-8 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            تعديل بيانات العضو
          </h1>
          <p className="text-muted-foreground mt-2">
            يمكنك تعديل البيانات الشخصية والمرفقات من هنا
          </p>
        </div>
        <Link href="/dashboard/members">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            رجوع للقائمة
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* TOP SECTION: Personal Photo & Account Info */}
        <div className="grid gap-8 md:grid-cols-3">
          {/* Right Column: Photo */}
          <Card className="shadow-md border-t-4 border-t-amber-500 md:col-span-1">
            <CardHeader>
              <CardTitle className="text-center">الصورة الشخصية</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center pb-8">
              {/* Note: Showing existing photo is tricky without fetching documents specifically here.
                    For simplicity, we just allow uploading a NEW photo. 
                    If user uploads new, it overrides/adds.
                 */}
              <div className="relative">
                {!selectedFiles[DocumentType.PHOTO] ? (
                  <label className="w-40 h-40 rounded-full border-4 border-dashed border-muted-foreground/30 hover:border-amber-500 cursor-pointer transition-colors flex items-center justify-center bg-muted/10">
                    <div className="flex flex-col items-center">
                      <Upload className="w-8 h-8 text-muted-foreground/50 mb-2" />
                      <span className="text-xs text-muted-foreground">
                        تغيير الصورة
                      </span>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleFileChange(DocumentType.PHOTO, e)}
                    />
                  </label>
                ) : (
                  <div className="relative w-40 h-40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={URL.createObjectURL(
                        selectedFiles[DocumentType.PHOTO],
                      )}
                      alt="Profile"
                      className="w-full h-full object-cover rounded-full border-4 border-amber-500 shadow-xl"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(DocumentType.PHOTO)}
                      className="absolute bottom-0 right-0 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Left Column: Account Login Info */}
          <Card className="shadow-md border-t-4 border-t-amber-500 md:col-span-2">
            <CardHeader className="bg-amber-50/50 dark:bg-amber-900/10">
              <CardTitle className="text-amber-700 dark:text-amber-300 flex items-center gap-2">
                🔐 بيانات الدخول للنظام
              </CardTitle>
              <CardDescription>
                اترك كلمة المرور فارغة إذا كنت لا تريد تغييرها
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 pt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>
                    البريد الإلكتروني <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...register("email")}
                    type="email"
                    dir="ltr"
                    className="text-right"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>كلمة المرور (اختياري)</Label>
                  <Input
                    {...register("password")}
                    type="password"
                    placeholder="********"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>
                  الصلاحية / الدور <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watch("role_id")}
                  onValueChange={(val) => setValue("role_id", val)}
                  dir="rtl"
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="اختر الصلاحية" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => {
                      const legacyName = r.name || r.role_name;
                      const enumMatch = Object.values(UserRole).find(
                        (role) => role === legacyName,
                      );
                      const displayLabel = enumMatch
                        ? userRoleLabels[enumMatch]
                        : legacyName;

                      return (
                        <SelectItem key={r.id} value={r.id}>
                          {displayLabel}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {errors.role_id && (
                  <p className="text-sm text-red-500">
                    {errors.role_id.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Personal Details */}
        <Card className="shadow-sm">
          <CardHeader className="bg-muted/30">
            <CardTitle>📄 البيانات الشخصية</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pt-6">
            <div className="space-y-2 col-span-full">
              <Label>
                الاسم الكامل <span className="text-red-500">*</span>
              </Label>
              <Input {...register("full_name")} className="h-11 text-lg" />
              {errors.full_name && (
                <p className="text-sm text-red-500">
                  {errors.full_name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>اللقب</Label>
              <Input {...register("last_name")} />
            </div>

            <div className="space-y-2">
              <Label>اسم الأم</Label>
              <Input {...register("mother_name")} />
            </div>

            <div className="space-y-2">
              <Label>تاريخ الميلاد</Label>
              <Input type="date" {...register("birth_date")} />
            </div>

            <div className="space-y-2">
              <Label>رقم الهاتف</Label>
              <Input {...register("phone")} dir="ltr" className="text-right" />
            </div>

            <div className="space-y-2">
              <Label>رقم الهوية / البطاقة الموحدة</Label>
              <Input {...register("national_id")} />
            </div>
          </CardContent>
        </Card>

        {/* Location & Education */}
        <div className="grid gap-8 md:grid-cols-2">
          <Card className="shadow-sm">
            <CardHeader className="bg-muted/30">
              <CardTitle>📍 السكن والعنوان</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label>المحافظة</Label>
                <Select
                  value={watch("province_id")}
                  onValueChange={(val) => setValue("province_id", val)}
                  dir="rtl"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المحافظة" />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>عنوان السكن</Label>
                <Input {...register("residence")} />
              </div>
              <div className="space-y-2">
                <Label>أقرب نقطة دالة</Label>
                <Input {...register("landmark")} />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="bg-muted/30">
              <CardTitle>🎓 التعليم والعمل</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label>التحصيل الدراسي</Label>
                <Select
                  value={watch("education_id")}
                  onValueChange={(val) => setValue("education_id", val)}
                  dir="rtl"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر التحصيل الدراسي" />
                  </SelectTrigger>
                  <SelectContent>
                    {educations.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>التخصص</Label>
                <Input {...register("specialization")} />
              </div>
              <div className="space-y-2">
                <Label>الوظيفة & مكان العمل</Label>
                <div className="flex gap-2">
                  <Input {...register("job")} placeholder="الوظيفة" />
                  <Input {...register("workplace")} placeholder="مكان العمل" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Info */}
        <Card className="shadow-sm">
          <CardHeader className="bg-muted/30">
            <CardTitle>🏢 معلومات النظام</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-6 pt-6">
            <div className="space-y-2">
              <Label>تاريخ الانتماء</Label>
              <Input type="date" {...register("join_date")} />
            </div>
            <div className="space-y-2">
              <Label>اسم المزكي</Label>
              <Input {...register("recommender_name")} />
            </div>
            <div className="space-y-2">
              <Label>كود خاص</Label>
              <Input {...register("custom_code")} />
            </div>

            {/* Group Selection */}
            <div className="space-y-2">
              <Label>المجموعة (اختياري)</Label>
              <Popover open={openGroup} onOpenChange={setOpenGroup}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openGroup}
                    className="w-full justify-between font-normal text-right"
                  >
                    <span className="truncate">
                      {watch("group_id")
                        ? groups.find((group) => group.id === watch("group_id"))
                            ?.name
                        : "اختر المجموعة"}
                    </span>
                    <ChevronsUpDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="ابحث عن مجموعة..." />
                    <CommandList>
                      <CommandEmpty>لا توجد نتائج.</CommandEmpty>
                      <CommandGroup>
                        {groups.map((group) => (
                          <CommandItem
                            key={group.id}
                            value={group.name}
                            onSelect={() => {
                              setValue("group_id", group.id);
                              setOpenGroup(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                watch("group_id") === group.id
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            {group.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        {/* Documents Grid */}
        <Card className="shadow-sm">
          <CardHeader className="bg-muted/30">
            <CardTitle>📂 تحديث المستندات</CardTitle>
            <CardDescription>
              يمكنك رفع مستندات جديدة لتحديثها (ستضاف إلى المستندات الحالية)
            </CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
            <UploadZone
              type={DocumentType.NATIONAL_ID_FRONT}
              label="هوية العضو (الوجه الأمامي)"
            />
            <UploadZone
              type={DocumentType.NATIONAL_ID_BACK}
              label="هوية العضو (الوجه الخلفي)"
            />
            <UploadZone
              type={DocumentType.RESIDENCE_CARD_FRONT}
              label="بطاقة السكن (الوجه الأمامي)"
            />
            <UploadZone
              type={DocumentType.RESIDENCE_CARD_BACK}
              label="بطاقة السكن (الوجه الخلفي)"
            />
          </CardContent>
        </Card>

        {/* Submit Actions */}
        <div className="sticky bottom-4 z-10 bg-background/80 backdrop-blur p-4 border rounded-lg shadow-lg flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            يرجى التأكد من صحة جميع البيانات قبل الحفظ
          </div>
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => router.back()}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              size="lg"
              className="min-w-[150px] text-lg bg-amber-600 hover:bg-amber-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="ml-2 h-5 w-5" />
                  حفظ التعديلات
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
