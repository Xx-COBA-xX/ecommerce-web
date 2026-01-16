"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Loader2, ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function CreateMemberPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [createAccount, setCreateAccount] = useState(false);

  // Dropdown Data States
  const [provinces, setProvinces] = useState<any[]>([]);
  const [educations, setEducations] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);

  // Fetch Dropdown Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [provincesRes, educationsRes, rolesRes, groupsRes] =
          await Promise.all([
            apiClient.get("/provinces"),
            apiClient.get("/educations"),
            apiClient.get("/roles"),
            apiClient.get("/groups"),
          ]);

        // Handle array response or paginated response format
        setProvinces(
          Array.isArray(provincesRes) ? provincesRes : provincesRes.data || []
        );
        setEducations(
          Array.isArray(educationsRes)
            ? educationsRes
            : educationsRes.data || []
        );
        setRoles(Array.isArray(rolesRes) ? rolesRes : rolesRes.data || []);
        setGroups(Array.isArray(groupsRes) ? groupsRes : groupsRes.data || []);
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

  const onSubmit = async (data: CreateMemberFormData) => {
    setIsLoading(true);
    try {
      // Clean up empty strings for optional UUIDs to avoid validation errors on backend
      const cleanData = { ...data };
      if (!cleanData.province_id) delete cleanData.province_id;
      if (!cleanData.education_id) delete cleanData.education_id;
      // if (!cleanData.group_id) delete cleanData.group_id;
      if (!cleanData.role_id) delete cleanData.role_id;
      if (!createAccount) {
        delete cleanData.email;
        delete cleanData.password;
        delete cleanData.role_id;
      }

      await apiClient.post("/members", cleanData);
      toast.success("تم إنشاء العضو بنجاح");
      router.push("/dashboard/members");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "فشل إنشاء العضو");
    } finally {
      setIsLoading(false);
    }
  };

  // Only admin can access
  if (user && user.role !== "admin") {
    return (
      <div className="p-8 text-center text-red-500">
        عذراً، انت لا تملك صلاحية للوصول إلى هذه الصفحة
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">إضافة عضو جديد</h2>
          <p className="text-muted-foreground">
            أدخل بيانات العضو الجديد للتسجيل في النظام
          </p>
        </div>
        <Link href="/dashboard/members">
          <Button variant="outline">
            <ArrowLeft className="ml-2 h-4 w-4" />
            رجوع للقائمة
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>البيانات الشخصية</CardTitle>
            <CardDescription>المعلومات الأساسية للعضو</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>الاسم الكامل *</Label>
              <Input
                {...register("full_name")}
                placeholder="الاسم الرباعي واللقب"
              />
              {errors.full_name && (
                <p className="text-sm text-red-500">
                  {errors.full_name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>اللقب</Label>
              <Input {...register("last_name")} placeholder="اللقب العشائري" />
            </div>

            <div className="space-y-2">
              <Label>اسم الأم</Label>
              <Input
                {...register("mother_name")}
                placeholder="اسم الأم الثلاثي"
              />
            </div>

            <div className="space-y-2">
              <Label>تاريخ الميلاد</Label>
              <Input type="date" {...register("birth_date")} />
            </div>

            <div className="space-y-2">
              <Label>رقم الهاتف</Label>
              <Input {...register("phone")} placeholder="07xxxxxxxxx" />
            </div>

            <div className="space-y-2">
              <Label>الرقم الوطني / رقم الهوية</Label>
              <Input
                {...register("national_id")}
                placeholder="رقم البطاقة الموحدة أو الهوية"
              />
            </div>
          </CardContent>
        </Card>

        {/* Location & Address */}
        <Card>
          <CardHeader>
            <CardTitle>السكن والعنوان</CardTitle>
            <CardDescription>بيانات الموقع الجغرافي</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
              <Input {...register("landmark")} placeholder="بالقرب من..." />
            </div>
          </CardContent>
        </Card>

        {/* Education & Work */}
        <Card>
          <CardHeader>
            <CardTitle>التعليم والعمل</CardTitle>
            <CardDescription>المؤهلات العلمية والوظيفية</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
              <Input
                {...register("specialization")}
                placeholder="مثال: هندسة برمجيات"
              />
            </div>

            <div className="space-y-2">
              <Label>الوظيفة الحالية</Label>
              <Input {...register("job")} placeholder="المسمى الوظيفي" />
            </div>

            <div className="space-y-2">
              <Label>مكان العمل</Label>
              <Input
                {...register("workplace")}
                placeholder="الدائرة أو الشركة"
              />
            </div>
          </CardContent>
        </Card>

        {/* System Info */}
        <Card>
          <CardHeader>
            <CardTitle>معلومات النظام</CardTitle>
            <CardDescription>بيانات تنظيمية إضافية</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>تاريخ الانتماء</Label>
              <Input type="date" {...register("join_date")} />
            </div>

            <div className="space-y-2">
              <Label>اسم المزكي</Label>
              <Input
                {...register("recommender_name")}
                placeholder="اسم الشخص المزكي"
              />
            </div>

            <div className="space-y-2">
              <Label>كود خاص</Label>
              <Input
                {...register("custom_code")}
                placeholder="كود تعريفي (اختياري)"
              />
            </div>

            {/* <div className="space-y-2">
              <Label>المجموعة</Label>
              <Select onValueChange={(val) => setValue("group_id", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المجموعة" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div> */}

            <div className="flex items-center space-x-2 space-x-reverse pt-8">
              <Checkbox
                id="is_banned"
                onCheckedChange={(checked) =>
                  setValue("is_banned", checked as boolean)
                }
              />
              <Label
                htmlFor="is_banned"
                className="text-red-500 font-bold cursor-pointer"
              >
                حظر هذا العضو
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Account Creation (Optional) */}
        <Card className="border-indigo-100 dark:border-indigo-900 border-2">
          <CardHeader className="flex flex-row items-center space-x-4 space-x-reverse space-y-0">
            <Checkbox
              id="create_account"
              checked={createAccount}
              onCheckedChange={(checked) =>
                setCreateAccount(checked as boolean)
              }
              className="h-5 w-5"
            />
            <div className="space-y-1">
              <CardTitle className="text-indigo-700 dark:text-indigo-400">
                إنشاء حساب مستخدم للنظام
              </CardTitle>
              <CardDescription>
                قم بتفعيل هذا الخيار إذا كنت تريد منح العضو صلاحية الدخول للنظام
              </CardDescription>
            </div>
          </CardHeader>
          {createAccount && (
            <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="space-y-2">
                <Label>البريد الإلكتروني *</Label>
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="user@org.iq"
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>كلمة المرور *</Label>
                <Input {...register("password")} type="password" />
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>الدور (Role) *</Label>
                <Select onValueChange={(val) => setValue("role_id", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الصلاحية" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name || r.role_name}{" "}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role_id && (
                  <p className="text-sm text-red-500">
                    {errors.role_id.message}
                  </p>
                )}
              </div>
            </CardContent>
          )}
        </Card>

        <Button
          type="submit"
          size="lg"
          className="w-full md:w-auto"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <Save className="ml-2 h-4 w-4" />
              حفظ العضو الجديد
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
