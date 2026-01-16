"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  GraduationCap,
  Calendar,
  User,
  Building2,
  FileText,
  Clock,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  Ban,
} from "lucide-react";
import { toast } from "sonner";

interface Member {
  id: string;
  full_name: string;
  phone?: string;
  email?: string;
  role?: string;
  created_at: string;
  province?: { id: string; name: string };
  group?: { id: string; name: string };
  education?: { id: string; name: string };
  status?: string;
  last_name?: string;
  national_id?: string;
  mother_name?: string;
  birth_date?: string;
  residence?: string;
  landmark?: string;
  specialization?: string;
  job?: string;
  workplace?: string;
  join_date?: string;
  recommender_name?: string;
  custom_code?: string;
  is_banned?: boolean;
}

export default function MemberDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchMember(params.id as string);
    }
  }, [params.id]);

  const fetchMember = async (id: string) => {
    try {
      const data = await apiClient.get(`/members/${id}`);
      setMember(data.data);
    } catch (error) {
      toast.error("فشل تحميل بيانات العضو");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-semibold">العضو غير موجود</h2>
        <Button onClick={() => router.push("/dashboard/members")}>
          العودة للقائمة
        </Button>
      </div>
    );
  }

  const initials = member.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 container mx-auto pb-10">
      {/* Header & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">ملف العضو</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/members/${member.id}/edit`)}
          >
            تعديل البيانات
          </Button>
          <Button variant="destructive" className="gap-2">
            <Ban className="h-4 w-4" />
            حظر العضو
          </Button>
        </div>
      </div>

      {/* Main Profile Card */}
      <Card className="overflow-hidden border-t-4 border-t-primary shadow-md">
        <div className="h-32 bg-linear-to-r from-blue-600 to-indigo-700"></div>
        <div className="px-6 pb-6">
          <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-end -mt-12 mb-4 gap-4">
            <div className="flex items-end gap-4">
              <Avatar className="h-24 w-24 border-4 border-background text-2xl shadow-lg bg-white">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="mb-1">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {member.full_name} {member.last_name}
                </h2>
                <p className="text-muted-foreground flex items-center gap-2 mt-1">
                  <Building2 className="h-4 w-4" />
                  {member.group?.name || "بدون مجموعة"}
                  <span className="text-gray-300 mx-1">|</span>
                  <MapPin className="h-4 w-4" />
                  {member.province?.name || "غير محدد"}
                </p>
              </div>
            </div>

            <Badge
              variant={member.is_banned ? "destructive" : "default"}
              className="px-4 py-1.5 text-sm font-medium flex gap-1.5 mb-2"
            >
              {member.is_banned ? (
                <ShieldAlert className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {member.is_banned ? "محظور" : "نشط"}
            </Badge>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Personal Info */}
        <Card className="md:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              المعلومات الشخصية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
              <div className="space-y-1.5">
                <dt className="text-sm font-medium text-muted-foreground">
                  رقم الهاتف
                </dt>
                <dd className="flex items-center gap-2 font-medium">
                  <Phone className="h-4 w-4 text-primary/70" />
                  <span dir="ltr">{member.phone || "-"}</span>
                </dd>
              </div>
              <div className="space-y-1.5">
                <dt className="text-sm font-medium text-muted-foreground">
                  البريد الإلكتروني
                </dt>
                <dd className="flex items-center gap-2 font-medium">
                  <Mail className="h-4 w-4 text-primary/70" />
                  {member.email || "-"}
                </dd>
              </div>
              <div className="space-y-1.5">
                <dt className="text-sm font-medium text-muted-foreground">
                  تاريخ الميلاد
                </dt>
                <dd className="flex items-center gap-2 font-medium">
                  <Calendar className="h-4 w-4 text-primary/70" />
                  {member.birth_date
                    ? new Date(member.birth_date).toLocaleDateString("ar-IQ")
                    : "-"}
                </dd>
              </div>
              <div className="space-y-1.5">
                <dt className="text-sm font-medium text-muted-foreground">
                  اسم الأم
                </dt>
                <dd className="flex items-center gap-2 font-medium">
                  <User className="h-4 w-4 text-primary/70" />
                  {member.mother_name || "-"}
                </dd>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <dt className="text-sm font-medium text-muted-foreground">
                  العنوان
                </dt>
                <dd className="font-medium">{member.residence || "-"}</dd>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <dt className="text-sm font-medium text-muted-foreground">
                  أقرب نقطة دالة
                </dt>
                <dd className="font-medium">{member.landmark || "-"}</dd>
              </div>
            </dl>

            <Separator className="my-8" />

            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              التعليم والعمل
            </h3>
            <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
              <div className="space-y-1.5">
                <dt className="text-sm font-medium text-muted-foreground">
                  التحصيل الدراسي
                </dt>
                <dd className="flex items-center gap-2 font-medium">
                  <GraduationCap className="h-4 w-4 text-primary/70" />
                  {member.education?.name || "-"}
                </dd>
              </div>
              <div className="space-y-1.5">
                <dt className="text-sm font-medium text-muted-foreground">
                  التخصص
                </dt>
                <dd className="font-medium">{member.specialization || "-"}</dd>
              </div>
              <div className="space-y-1.5">
                <dt className="text-sm font-medium text-muted-foreground">
                  الوظيفة
                </dt>
                <dd className="flex items-center gap-2 font-medium">
                  <Briefcase className="h-4 w-4 text-primary/70" />
                  {member.job || "-"}
                </dd>
              </div>
              <div className="space-y-1.5">
                <dt className="text-sm font-medium text-muted-foreground">
                  مكان العمل
                </dt>
                <dd className="font-medium">{member.workplace || "-"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Right Column: System Info */}
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                بيانات النظام
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  تاريخ الانضمام
                </span>
                <span className="font-medium text-sm">
                  {member.join_date
                    ? new Date(member.join_date).toLocaleDateString("ar-IQ")
                    : "-"}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  تاريخ الإضافة
                </span>
                <span className="font-medium text-sm">
                  {new Date(member.created_at).toLocaleDateString("ar-IQ")}
                </span>
              </div>
              <Separator />
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground block">
                  المزكي
                </span>
                <span className="font-medium flex items-center gap-2">
                  <User className="h-3 w-3 text-muted-foreground" />{" "}
                  {member.recommender_name || "-"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                المرفقات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground border-2 border-dashed rounded-lg hover:bg-slate-50 transition-colors">
                <FileText className="h-10 w-10 mb-2 opacity-20" />
                <p className="text-sm">لا توجد مستندات مرفقة</p>
                <Button variant="link" size="sm" className="mt-2 h-auto p-0">
                  إضافة ملف
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
