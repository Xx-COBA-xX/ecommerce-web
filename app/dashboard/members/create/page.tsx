"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
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
import { Checkbox } from "@/components/ui/checkbox";
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
  UserCircle,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList, // Add CommandList import
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FieldError } from "@/components/ui/field";

// Enums matching backend
enum UserRole {
  ADMIN = "admin",
  FINANCE_MANAGER = "finance_manager",
  GROUP_LEADER = "group_leader",
  TRAINER = "trainer",
  VISIT_ADMIN = "visit_admin",
  MEMBER = "member",
}

const userRoleLabels: Record<string, string> = {
  [UserRole.ADMIN]: "مدير النظام (Admin)",
  [UserRole.FINANCE_MANAGER]: "المدير المالي",
  [UserRole.GROUP_LEADER]: "مسؤول مجموعة",
  [UserRole.TRAINER]: "مدرب",
  [UserRole.VISIT_ADMIN]: "مسؤول زيارات",
  [UserRole.MEMBER]: "منتسب",
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

const documentTypeLabels: Record<string, string> = {
  [DocumentType.NATIONAL_ID_FRONT]: "هوية العضو (الوجه الأمامي)",
  [DocumentType.NATIONAL_ID_BACK]: "هوية العضو (الوجه الخلفي)",
  [DocumentType.PHOTO]: "الصورة الشخصية",
  [DocumentType.RESIDENCE_CARD_FRONT]: "بطاقة السكن (الوجه الأمامي)",
  [DocumentType.RESIDENCE_CARD_BACK]: "بطاقة السكن (الوجه الخلفي)",
  [DocumentType.CERTIFICATE]: "الشهادة / الوثيقة الدراسية",
  [DocumentType.OTHER]: "مستندات أخرى",
};

export default function CreateMemberPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // File Upload State Map
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({});

  // Dropdown Data States
  const [provinces, setProvinces] = useState<any[]>([]);
  const [educations, setEducations] = useState<any[]>([]);
  // We use local constant for roles to ensure matching backend enum,
  // but we can also fetch from backend if dynamic roles are needed.
  // For now, blending both: prefer backend IDs but map to our labels if possible.
  const [roles, setRoles] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [openGroup, setOpenGroup] = useState(false); // For combobox state

  // Fetch Dropdown Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [provincesRes, educationsRes, rolesRes] = await Promise.all([
          apiClient.get("/provinces"),
          apiClient.get("/educations"),
          apiClient.get("/roles"),
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

        // Fetch Groups
        const groupsRes = await apiClient.get("/groups");
        setGroups(
          Array.isArray(groupsRes.data)
            ? groupsRes.data
            : groupsRes.data.data || [],
        );
      } catch (error) {
        console.error("Failed to fetch dropdown data:", error);
        toast.error("فشل تحميل البيانات الأساسية");
      }
    };
    fetchData();
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateMemberFormData>({
    resolver: zodResolver(createMemberSchema),
    defaultValues: {
      is_banned: false,
    },
  });

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
      // Create FormData to send both member data and files together
      const formData = new FormData();

      // 1. Append all member data fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      // 2. Append files with their correct field names matching backend expectations
      // Backend expects: photo, national_id_front, national_id_back, residence_card_front, residence_card_back
      const fileMapping: Record<DocumentType, string> = {
        [DocumentType.PHOTO]: "photo",
        [DocumentType.NATIONAL_ID_FRONT]: "national_id_front",
        [DocumentType.NATIONAL_ID_BACK]: "national_id_back",
        [DocumentType.RESIDENCE_CARD_FRONT]: "residence_card_front",
        [DocumentType.RESIDENCE_CARD_BACK]: "residence_card_back",
        [DocumentType.CERTIFICATE]: "certificate",
        [DocumentType.OTHER]: "other",
      };

      Object.entries(selectedFiles).forEach(([type, file]) => {
        const fieldName = fileMapping[type as DocumentType];
        if (fieldName) {
          formData.append(fieldName, file);
        }
      });

      // 3. Send single request with both data and files
      const memberResponse = await apiClient.post("/members", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("تم إنشاء العضو ورفع المستندات بنجاح");
      router.push("/dashboard/members");
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "فشل إنشاء العضو");
    } finally {
      setIsLoading(false);
    }
  };

  // Only admin can access
  if (user && user.role !== "admin") {
    return (
      <div className="flex h-[50vh] items-center justify-center text-red-500 font-medium">
        عذراً، انت لا تملك صلاحية للوصول إلى هذه الصفحة
      </div>
    );
  }

  const UploadZone = ({
    type,
    label,
    icon: Icon,
  }: {
    type: DocumentType;
    label: string;
    icon?: any;
  }) => (
    <div className="space-y-3">
      <Label className="text-base font-semibold">{label}</Label>
      {!selectedFiles[type] ? (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/5 hover:bg-muted/20 hover:border-primary/50 transition-all">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="h-6 w-6 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">اضغط لرفع الملف</p>
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
            type="button" // Important to prevent form submission
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
            إضافة عضو جديد
          </h1>
          <p className="text-muted-foreground mt-2">
            يرجى ملء جميع البيانات بدقة وإرفاق المستندات المطلوبة
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
          <Card className="shadow-md border-t-4 border-t-indigo-500 md:col-span-1">
            <CardHeader>
              <CardTitle className="text-center">الصورة الشخصية</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center pb-8">
              <div className="relative">
                {!selectedFiles[DocumentType.PHOTO] ? (
                  <label className="w-40 h-40 rounded-full border-4 border-dashed border-muted-foreground/30 hover:border-indigo-500 cursor-pointer transition-colors flex items-center justify-center bg-muted/10">
                    <UserCircle className="w-20 h-20 text-muted-foreground/50" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/50 rounded-full transition-opacity">
                      <Upload className="w-8 h-8 text-white" />
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
                      className="w-full h-full object-cover rounded-full border-4 border-indigo-500 shadow-xl"
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
              <p className="text-xs text-muted-foreground mt-4 text-center">
                اضغط لرفع صورة شخصية حديثة
              </p>
            </CardContent>
          </Card>

          {/* Left Column: Account Login Info (Always Visible) */}
          <Card className="shadow-md border-t-4 border-t-indigo-500 md:col-span-2">
            <CardHeader className="bg-indigo-50/50 dark:bg-indigo-900/10">
              <CardTitle className="text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                🔐 بيانات الدخول للنظام
              </CardTitle>
              <CardDescription>
                هذه البيانات ضرورية لتمكين العضو من تسجيل الدخول
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
                    placeholder="email@org.iq"
                    dir="ltr"
                    className="text-right"
                  />
                  {errors.email && (
                    <FieldError>{errors.email.message}</FieldError>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>
                    كلمة المرور <span className="text-red-500">*</span>
                  </Label>
                  <Input {...register("password")} type="password" />
                  {errors.password && (
                    <FieldError>{errors.password.message}</FieldError>
                  )}
                </div>
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
              <Input
                {...register("full_name")}
                placeholder="الاسم الرباعي واللقب"
                className="h-11 text-lg"
              />
              {errors.full_name && (
                <FieldError>{errors.full_name.message}</FieldError>
              )}
            </div>

            <div className="space-y-2">
              <Label>اللقب</Label>
              <Input {...register("last_name")} />
              {errors.last_name && (
                <FieldError>{errors.last_name.message}</FieldError>
              )}
            </div>

            <div className="space-y-2">
              <Label>اسم الأم</Label>
              <Input {...register("mother_name")} />
              {errors.mother_name && (
                <FieldError>{errors.mother_name.message}</FieldError>
              )}
            </div>

            <div className="space-y-2">
              <Label>تاريخ الميلاد</Label>
              <Input type="date" {...register("birth_date")} />
              {errors.birth_date && (
                <FieldError>{errors.birth_date.message}</FieldError>
              )}
            </div>

            <div className="space-y-2">
              <Label>رقم الهاتف</Label>
              <Input
                {...register("phone")}
                placeholder="07xxxxxxxxx"
                dir="ltr"
                className="text-right"
              />
              {errors.phone && <FieldError>{errors.phone.message}</FieldError>}
            </div>

            <div className="space-y-2">
              <Label>رقم الهوية / البطاقة الموحدة</Label>
              <Input {...register("national_id")} />
              {errors.national_id && (
                <FieldError>{errors.national_id.message}</FieldError>
              )}
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
                  dir="rtl"
                  onValueChange={(val) => setValue("province_id", val)}
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
                {errors.province_id && (
                  <FieldError>{errors.province_id.message}</FieldError>
                )}
              </div>
              <div className="space-y-2">
                <Label>عنوان السكن</Label>
                <Input
                  {...register("residence")}
                  placeholder="القضاء، الناحية، الحي"
                />
                {errors.residence && (
                  <FieldError>{errors.residence.message}</FieldError>
                )}
              </div>
              <div className="space-y-2">
                <Label>أقرب نقطة دالة</Label>
                <Input {...register("landmark")} />
                {errors.landmark && (
                  <FieldError>{errors.landmark.message}</FieldError>
                )}
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
                  dir="rtl"
                  onValueChange={(val) => setValue("education_id", val)}
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
                {errors.education_id && (
                  <FieldError>{errors.education_id.message}</FieldError>
                )}
              </div>
              <div className="space-y-2">
                <Label>التخصص</Label>
                <Input {...register("specialization")} />
                {errors.specialization && (
                  <FieldError>{errors.specialization.message}</FieldError>
                )}
              </div>
              <div className="space-y-2 flex flex-row gap-2 w-full">
                <div>
                  <Label className="pb-2">الوظيفة</Label>
                  <Input
                    className="pb-2"
                    {...register("job")}
                    placeholder="الوظيفة"
                  />
                  {errors.job && <FieldError>{errors.job.message}</FieldError>}
                </div>
                <div>
                  <Label className="pb-2">مكان العمل</Label>
                  <Input
                    className="pb-2"
                    {...register("workplace")}
                    placeholder="مكان العمل"
                  />
                  {errors.workplace && (
                    <FieldError>{errors.workplace.message}</FieldError>
                  )}
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
              {errors.join_date && (
                <FieldError>{errors.join_date.message}</FieldError>
              )}
            </div>
            <div className="space-y-2">
              <Label>اسم المزكي</Label>
              <Input {...register("recommender_name")} />
              {errors.recommender_name && (
                <FieldError>{errors.recommender_name.message}</FieldError>
              )}
            </div>
            <div className="space-y-2">
              <Label>كود خاص</Label>
              <Input {...register("custom_code")} />
              {errors.custom_code && (
                <FieldError>{errors.custom_code.message}</FieldError>
              )}
            </div>

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
              {errors.group_id && (
                <p className="text-sm text-red-500">
                  {errors.group_id.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Documents Grid */}
        <Card className="shadow-sm">
          <CardHeader className="bg-muted/30">
            <CardTitle>📂 المستندات والمرفقات</CardTitle>
            <CardDescription>
              يرجى رفع صور واضحة للمستندات المطلوبة
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
              className="min-w-[150px] text-lg bg-indigo-600 hover:bg-indigo-700 text-white"
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
                  حفظ البيانات
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
