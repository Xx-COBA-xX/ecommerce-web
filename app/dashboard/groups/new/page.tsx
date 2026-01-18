"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  code: z.string().min(2, "الكود يجب أن يكون حرفين على الأقل"),
  province_id: z.string().optional(),
  sector_id: z.string().optional(),
  leader_id: z.string().optional(),
  is_banned: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddGroupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    control,
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
          apiClient.getMembers(),
        ]);
        setProvinces(provincesData);
        setSectors(sectorsData || []);
        // membersData logic might need adjustment if it returns { items: [...] }
        setMembers(membersData.items || membersData);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
        toast.error("فشل تحميل البيانات الأولية");
      }
    };
    fetchData();
  }, []);

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      await apiClient.createGroup(values);
      toast.success("تم إنشاء المجموعة بنجاح");
      router.push("/dashboard/groups");
    } catch (error) {
      console.error("Failed to create group:", error);
      toast.error("فشل إنشاء المجموعة");
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>القطاع</Label>
                <Controller
                  name="sector_id"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر القطاع" />
                      </SelectTrigger>
                      <SelectContent>
                        {sectors.map((sector: any) => (
                          <SelectItem key={sector.id} value={sector.id}>
                            {sector.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>المحافظة</Label>
                <Controller
                  name="province_id"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المحافظة" />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces.map((province: any) => (
                          <SelectItem key={province.id} value={province.id}>
                            {province.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>قائد المجموعة</Label>
              <Controller
                name="leader_id"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر القائد" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((member: any) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.full_name} ({member.custom_code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <p className="text-sm text-muted-foreground">اختياري</p>
            </div>

            <div className="flex flex-row items-center justify-between rounded-lg border p-4 bg-muted/20">
              <div className="space-y-0.5 ml-4">
                <Label className="text-base text-destructive">
                  حظر المجموعة
                </Label>
                <p className="text-sm text-muted-foreground">
                  عند تفعيل هذا الخيار، ستصبح المجموعة محظورة
                </p>
              </div>
              <Controller
                name="is_banned"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>

            <div className="flex justify-end space-x-2 space-x-reverse pt-4">
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
