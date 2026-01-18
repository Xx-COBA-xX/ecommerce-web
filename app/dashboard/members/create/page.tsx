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

// Enums matching backend
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
  NATIONAL_ID = "national_id",
  PHOTO = "photo",
  RESIDENCE_CARD = "residence_card",
  CERTIFICATE = "certificate",
  OTHER = "other",
}

const documentTypeLabels: Record<string, string> = {
  [DocumentType.NATIONAL_ID]: "البطاقة الوطنية / الهوية",
  [DocumentType.PHOTO]: "الصورة الشخصية",
  [DocumentType.RESIDENCE_CARD]: "بطاقة السكن",
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
          Array.isArray(provincesRes) ? provincesRes : provincesRes.data || []
        );
        setEducations(
          Array.isArray(educationsRes)
            ? educationsRes
            : educationsRes.data || []
        );
        setRoles(Array.isArray(rolesRes) ? rolesRes : rolesRes.data || []);
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
    formState: { errors },
  } = useForm<CreateMemberFormData>({
    resolver: zodResolver(createMemberSchema),
    defaultValues: {
      is_banned: false,
    },
  });

  const handleFileChange = (
    type: DocumentType,
    e: React.ChangeEvent<HTMLInputElement>
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
      // Helper to clean empty strings/nulls
      const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as any);

      // 2. Create Member
      const memberResponse = await apiClient.post("/members", cleanData);
      const newMemberId = memberResponse.data?.id;

      if (!newMemberId) {
        throw new Error("لم يتم العثور على معرف العضو في الاستجابة");
      }

      // 3. Upload Documents
      const uploadPromises = Object.entries(selectedFiles).map(
        async ([type, file]) => {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("member_id", newMemberId);
          formData.append("document_type", type);
          // formData.append("is_active", "true");

          return apiClient.post("/member-documents", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }
      );

      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
        toast.success("تم رفع المستندات بنجاح");
      }

      toast.success("تم إنشاء العضو بنجاح");
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
        <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded">
              <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-sm truncate max-w-[150px]">
              {selectedFiles[type].name}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeFile(type)}
            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
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
                        selectedFiles[DocumentType.PHOTO]
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
                    <p className="text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>
                    كلمة المرور <span className="text-red-500">*</span>
                  </Label>
                  <Input {...register("password")} type="password" />
                  {errors.password && (
                    <p className="text-sm text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>
                  الصلاحية / الدور <span className="text-red-500">*</span>
                </Label>
                <Select onValueChange={(val) => setValue("role_id", val)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="اختر الصلاحية" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => {
                      // Try to map backend role name to our Arabic label
                      // Check if r.name or r.role_name matches our enum values
                      const legacyName = r.name || r.role_name;
                      // Try to find if the legacy name matches any enum value
                      const enumMatch = Object.values(UserRole).find(
                        (role) => role === legacyName
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
                    {/* Fallback if roles list is empty or strict enum required by backend but not in DB yet? 
                            Ideally, we trust the DB roles to be seeded with correct enum values.
                            But if the user wants strictly these enums in the dropdown, we might need to rely on DB having them. 
                        */}
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
              <Input
                {...register("full_name")}
                placeholder="الاسم الرباعي واللقب"
                className="h-11 text-lg"
              />
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
              <Input
                {...register("phone")}
                placeholder="07xxxxxxxxx"
                dir="ltr"
                className="text-right"
              />
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
                <Select onValueChange={(val) => setValue("province_id", val)}>
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
                <Input
                  {...register("residence")}
                  placeholder="القضاء، الناحية، الحي"
                />
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
                <Select onValueChange={(val) => setValue("education_id", val)}>
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
            <div className="col-span-full pt-2">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="is_banned"
                  onCheckedChange={(checked) =>
                    setValue("is_banned", checked as boolean)
                  }
                />
                <Label
                  htmlFor="is_banned"
                  className="text-red-500 font-medium cursor-pointer"
                >
                  حظر هذا العضو من النظام
                </Label>
              </div>
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
              type={DocumentType.NATIONAL_ID}
              label="البطاقة الوطنية / الهوية"
            />
            <UploadZone
              type={DocumentType.RESIDENCE_CARD}
              label="بطاقة السكن"
            />
            <UploadZone
              type={DocumentType.CERTIFICATE}
              label="الوثيقة الدراسية"
            />
            <UploadZone type={DocumentType.OTHER} label="مستندات أخرى" />
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
