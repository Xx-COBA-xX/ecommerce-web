"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Check, ChevronsUpDown, UserCog } from "lucide-react";
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
import { ChangeLeaderDialog } from "@/components/sectors/change-leader-dialog";

const formSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  code: z.string().min(2, "الكود يجب أن يكون حرفين على الأقل"),
  province_id: z.string().min(1, "يجب اختيار المحافظة"),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditSectorPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [sector, setSector] = useState<any>(null);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [openProvince, setOpenProvince] = useState(false);
  const [changeLeaderOpen, setChangeLeaderOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      code: "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetching(true);
        const [sectorData, provincesData] = await Promise.all([
          apiClient.getSector(id),
          apiClient.getProvinces(),
        ]);

        setSector(sectorData);
        setProvinces(provincesData);

        reset({
          name: sectorData.name,
          code: sectorData.code,
          province_id: sectorData.province?.id,
        });
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("فشل تحميل البيانات");
        router.push("/dashboard/sectors");
      } finally {
        setFetching(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, reset, router]);

  const refetchSector = async () => {
    try {
      const sectorData = await apiClient.getSector(id);
      setSector(sectorData);
    } catch (error) {
      console.error("Failed to refetch sector:", error);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      await apiClient.updateSector(id, values);
      toast.success("تم تحديث القاطع بنجاح");
      router.push("/dashboard/sectors");
    } catch (error: any) {
      console.error("Failed to update sector:", error);
      toast.error(
        "فشل تحديث القاطع: " +
          (error.response?.data?.message || "خطأ غير معروف"),
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">تعديل القاطع</h1>
        <p className="text-muted-foreground mt-2">تعديل بيانات القاطع الحالي</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>بيانات القاطع</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">اسم القاطع</Label>
              <Input
                id="name"
                placeholder="مثال: قاطع الكرخ"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">كود القاطع</Label>
              <Input
                id="code"
                placeholder="مثال: KRK-001"
                {...register("code")}
              />
              {errors.code && (
                <p className="text-sm text-red-500">{errors.code.message}</p>
              )}
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
                {errors.province_id && (
                  <p className="text-sm text-red-500">
                    {errors.province_id.message}
                  </p>
                )}
              </div>

              {/* Leader - Read Only with Change Button */}
              <div className="space-y-2">
                <Label>قائد القاطع</Label>
                <div className="flex gap-2">
                  <Input
                    value={sector?.leader?.full_name || "لا يوجد قائد"}
                    disabled
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setChangeLeaderOpen(true)}
                  >
                    <UserCog className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  استخدم زر التغيير لتعيين قائد جديد
                </p>
              </div>
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
                حفظ التغييرات
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <ChangeLeaderDialog
        open={changeLeaderOpen}
        onOpenChange={setChangeLeaderOpen}
        sectorId={id}
        currentLeader={sector?.leader}
        onSuccess={refetchSector}
      />
    </div>
  );
}
