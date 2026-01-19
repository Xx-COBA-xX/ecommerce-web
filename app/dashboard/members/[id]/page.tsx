"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Download,
  Eye,
  CreditCard,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

// Define strict types matching backend response
interface MemberDocument {
  id: string;
  document_type: string;
  file_url?: string;
  file_key?: string;
  is_active: boolean;
  created_at: string;
}

interface Member {
  id: string;
  full_name: string;
  last_name?: string;
  national_id?: string;
  mother_name?: string;
  phone?: string;
  email?: string;
  birth_date?: string;
  residence?: string;
  landmark?: string;
  education?: { id: string; name: string };
  specialization?: string;
  job?: string;
  workplace?: string;
  join_date?: string;
  recommender_name?: string;
  custom_code?: string;
  is_banned: boolean;
  province?: { id: string; name: string };
  group?: { id: string; name: string };
  account?: {
    id: string;
    email: string;
    role?: { id: string; name: string };
  };
  documents?: MemberDocument[];
  created_at: string;
}

const documentTypeLabels: Record<string, string> = {
  national_id: "البطاقة الوطنية / الهوية",
  photo: "الصورة الشخصية",
  residence_card: "بطاقة السكن",
  certificate: "الشهادة / الوثيقة الدراسية",
  other: "مستندات أخرى",
};

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
      const { data } = await apiClient.get<Member>(`/members/${id}`);
      setMember(data);
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

  // Helper to find profile photo if it exists in documents
  const profilePhoto = member.documents?.find(
    (d) => d.document_type === "photo" && d.is_active
  );

  const R2_DOMAIN = "https://pub-78f212f5cfc14ae7baadced9bbb60ce3.r2.dev";

  const getFileUrl = (doc?: MemberDocument) => {
    if (!doc) return undefined;
    if (doc.file_key) return( 
      console.log(`${R2_DOMAIN}/${doc.file_key}`),
      `${R2_DOMAIN}/${doc.file_key}`);
    return doc.file_url;
  };

  return (
    <div className="container mx-auto pb-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">ملف العضو</h1>
            <p className="text-sm text-muted-foreground">
              عرض التفاصيل الكاملة والمستندات
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/members/${member.id}/edit`)}
          >
            <Pencil className="h-4 w-4 ml-2" />
            تعديل البيانات
          </Button>
          <Button variant="destructive" className="gap-2">
            <Ban className="h-4 w-4" />
            حظر العضو
          </Button>
        </div>
      </div>

      {/* Main Profile Header Card */}
      <Card className="overflow-hidden border-t-4 border-t-indigo-600 shadow-lg">
        <div className="h-40 bg-linear-to-r from-indigo-600 to-purple-700 relative">
          <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-black/50 to-transparent"></div>
        </div>
        <div className="px-8 pb-8">
          <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-end -mt-16 gap-6">
            <div className="flex items-end gap-6">
              <Avatar className="h-32 w-32 border-4 border-white dark:border-gray-900 shadow-2xl bg-white cursor-pointer hover:scale-105 transition-transform duration-300">
                <AvatarImage
                  src={getFileUrl(profilePhoto)}
                  className="object-cover"
                />
                <AvatarFallback className="bg-indigo-50 text-indigo-700 font-bold text-4xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="mb-2 space-y-1">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 drop-shadow-sm">
                  {member.full_name} {member.last_name}
                </h2>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {member.job && (
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {member.job}
                    </div>
                  )}
                  {member.province && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {member.province.name}
                    </div>
                  )}
                  {member.group && (
                    <div className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      {member.group.name}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 mb-2">
              <Badge
                variant={member.is_banned ? "destructive" : "default"}
                className={`px-4 py-1.5 text-sm font-medium flex gap-1.5 ${
                  !member.is_banned ? "bg-green-600 hover:bg-green-700" : ""
                }`}
              >
                {member.is_banned ? (
                  <ShieldAlert className="h-4 w-4" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                {member.is_banned ? "محظور من النظام" : "نشط وفعال"}
              </Badge>
              {member.custom_code && (
                <Badge variant="outline" className="font-mono bg-muted/50">
                  {member.custom_code}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal Info */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-indigo-600" />
                المعلومات الشخصية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">
                    الرقم الوطني / الهوية
                  </dt>
                  <dd className="font-medium text-base">
                    {member.national_id || "-"}
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">
                    تاريخ الميلاد
                  </dt>
                  <dd className="font-medium text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {member.birth_date
                      ? new Date(member.birth_date).toLocaleDateString("ar-IQ")
                      : "-"}
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">
                    اسم الأم
                  </dt>
                  <dd className="font-medium text-base">
                    {member.mother_name || "-"}
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">
                    رقم الهاتف
                  </dt>
                  <dd
                    className="font-medium text-base flex items-center gap-2"
                    dir="ltr"
                  >
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-right">{member.phone || "-"}</span>
                  </dd>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <dt className="text-sm font-medium text-muted-foreground">
                    العنوان الكامل
                  </dt>
                  <dd className="font-medium text-base p-2 bg-muted/20 rounded-md">
                    {member.province?.name}, {member.residence}{" "}
                    {member.landmark && `(أقرب نقطة دالة: ${member.landmark})`}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Education & Work */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <GraduationCap className="h-5 w-5 text-indigo-600" />
                التعليم والعمل
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">
                    التحصيل الدراسي
                  </dt>
                  <dd className="font-medium text-base">
                    {member.education?.name || "-"}
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">
                    التخصص
                  </dt>
                  <dd className="font-medium text-base">
                    {member.specialization || "-"}
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">
                    الوظيفة الحالية
                  </dt>
                  <dd className="font-medium text-base">{member.job || "-"}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">
                    مكان العمل
                  </dt>
                  <dd className="font-medium text-base">
                    {member.workplace || "-"}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Documents Gallery */}
          <Card className="shadow-sm border-t-4 border-t-amber-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-amber-600" />
                المستندات والمرفقات ({member.documents?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {member.documents && member.documents.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {member.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="group relative border rounded-lg overflow-hidden bg-background hover:shadow-md transition-shadow"
                    >
                      <div className="aspect-video bg-muted flex items-center justify-center relative overflow-hidden">
                        {doc.file_key || doc.file_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={getFileUrl(doc)}
                            alt={documentTypeLabels[doc.document_type]}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <FileText className="h-10 w-10 text-muted-foreground opacity-50" />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          {(doc.file_key || doc.file_url) && (
                            <Button
                              size="icon"
                              variant="secondary"
                              className="h-8 w-8 rounded-full"
                              onClick={() =>
                                window.open(getFileUrl(doc), "_blank")
                              }
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="p-2 bg-muted/20">
                        <p className="text-xs font-semibold truncate">
                          {documentTypeLabels[doc.document_type] ||
                            doc.document_type}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(doc.created_at).toLocaleDateString("ar-IQ")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/5">
                  <FileText className="h-12 w-12 mb-3 opacity-20" />
                  <p className="text-sm font-medium">
                    لا توجد مستندات مرفقة لهذا العضو
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: System & Account Info */}
        <div className="space-y-6">
          {/* System Info */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                بيانات النظام
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">تاريخ الانضمام</span>
                <span className="font-semibold text-right">
                  {member.join_date
                    ? new Date(member.join_date).toLocaleDateString("ar-IQ")
                    : "-"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">تاريخ التسجيل</span>
                <span className="font-semibold text-right">
                  {new Date(member.created_at).toLocaleDateString("ar-IQ")}
                </span>
              </div>
              <div className="py-2 space-y-1">
                <span className="text-muted-foreground block">
                  تم إدخال البيانات بواسطة
                </span>
                <div className="flex items-center gap-2 font-medium">
                  <User className="h-3 w-3" />
                  {member.recommender_name || "غير محدد"}
                </div>
              </div>
              <div className="pt-2">
                <span className="text-xs text-muted-foreground block mb-1">
                  المعرف الفريد (ID)
                </span>
                <code className="bg-muted p-1.5 rounded text-xs select-all block w-full overflow-hidden text-ellipsis">
                  {member.id}
                </code>
              </div>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                حساب النظام
              </CardTitle>
            </CardHeader>
            <CardContent>
              {member.account ? (
                <div className="space-y-4">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-1">
                      البريد الإلكتروني
                    </p>
                    <p className="text-sm font-medium break-all">
                      {member.account.email}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      الصلاحية
                    </span>
                    <Badge variant="secondary" className="capitalize">
                      {member.account.role?.name || "Member"}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    لا يوجد حساب مرتبط بهذا العضو
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    إنشاء حساب
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
