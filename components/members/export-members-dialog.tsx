"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2, FileDown } from "lucide-react";
import { toast } from "sonner";

interface Member {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  role: string;
  created_at: string;
  province?: { name: string };
  group?: { name: string };
  status?: string;
}

interface ExportMembersDialogProps {
  data: Member[];
}

const AVAILABLE_FIELDS = [
  { id: "full_name", label: "الاسم الكامل" },
  { id: "phone", label: "رقم الهاتف" },
  { id: "email", label: "البريد الإلكتروني" },
  { id: "province", label: "المحافظة" },
  { id: "group", label: "المجموعة" },
  { id: "created_at", label: "تاريخ الانضمام" },
  { id: "status", label: "الحالة" },
];

export function ExportMembersDialog({ data }: ExportMembersDialogProps) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<"excel" | "pdf">("excel");
  const [selectedFields, setSelectedFields] = useState<string[]>(
    AVAILABLE_FIELDS.map((f) => f.id),
  );
  const [isExporting, setIsExporting] = useState(false);

  const toggleField = (fieldId: string) => {
    setSelectedFields((prev) =>
      prev.includes(fieldId)
        ? prev.filter((id) => id !== fieldId)
        : [...prev, fieldId],
    );
  };

  const processData = () => {
    return data.map((member) => {
      const row: any = {};
      if (selectedFields.includes("full_name"))
        row["الاسم الكامل"] = member.full_name || "-";
      if (selectedFields.includes("phone"))
        row["رقم الهاتف"] = member.phone || "-";
      if (selectedFields.includes("email"))
        row["البريد الإلكتروني"] = member.email || "-";
      if (selectedFields.includes("province"))
        row["المحافظة"] = member.province?.name || "-";
      if (selectedFields.includes("group"))
        row["المجموعة"] = member.group?.name || "-";
      if (selectedFields.includes("created_at"))
        row["تاريخ الانضمام"] = new Date(member.created_at).toLocaleDateString(
          "ar-IQ",
        );
      if (selectedFields.includes("status")) row["الحالة"] = "نشط";
      return row;
    });
  };

  const loadAmiriFont = async (doc: jsPDF) => {
    try {
      const response = await fetch(
        "https://raw.githubusercontent.com/google/fonts/main/ofl/amiri/Amiri-Regular.ttf",
      );
      if (!response.ok) throw new Error("Failed to fetch font");

      const buffer = await response.arrayBuffer();
      // Browser-safe ArrayBuffer to Base64
      const binary = new Uint8Array(buffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        "",
      );
      const base64 = btoa(binary);

      doc.addFileToVFS("Amiri-Regular.ttf", base64);
      doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
      doc.setFont("Amiri");
    } catch (error) {
      console.error("Error loading font:", error);
      toast.error("فشل تحميل خط اللغة العربية، قد تظهر الرموز بشكل غير صحيح");
    }
  };

  const handleExport = async () => {
    if (selectedFields.length === 0) {
      toast.error("يرجى اختيار حقل واحد على الأقل");
      return;
    }

    setIsExporting(true);
    try {
      const processedData = processData();
      const fileName = `members_export_${new Date().toISOString().slice(0, 10)}`;

      if (format === "excel") {
        const worksheet = XLSX.utils.json_to_sheet(processedData);
        if (!worksheet["!views"]) worksheet["!views"] = [];
        worksheet["!views"].push({ rightToLeft: true });

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Members");
        XLSX.writeFile(workbook, `${fileName}.xlsx`);
        toast.success("تم تصدير ملف Excel بنجاح");
      } else {
        const doc = new jsPDF();

        // Load Arabic Font
        await loadAmiriFont(doc);

        const tableColumn = AVAILABLE_FIELDS.filter((f) =>
          selectedFields.includes(f.id),
        ).map((f) => f.label);

        const tableRows = processedData.map((row) => Object.values(row));

        autoTable(doc, {
          head: [tableColumn],
          body: tableRows as any[],
          theme: "grid",
          styles: {
            font: "Amiri",
            halign: "right",
          },
          headStyles: { halign: "right", fillColor: [22, 163, 74] },
        });

        doc.save(`${fileName}.pdf`);
        toast.success("تم تصدير ملف PDF بنجاح");
      }
      setOpen(false);
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("حدث خطأ أثناء التصدير");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileDown className="mr-2 h-4 w-4" />
          تصدير
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle>تصدير بيانات الأعضاء</DialogTitle>
          <DialogDescription>قم بتخصيص خيارات التصدير أدناه.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label className="text-base font-medium">صيغة الملف</Label>
            <div className="grid grid-cols-2 gap-4">
              <div
                onClick={() => setFormat("excel")}
                className={`cursor-pointer rounded-lg border-2 p-4 flex flex-col items-center justify-center transition-all hover:bg-accent/50 ${
                  format === "excel"
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-muted bg-transparent"
                }`}
              >
                <div className="text-2xl mb-2">📊</div>
                <span className="font-medium">Excel</span>
                <span className="text-xs text-muted-foreground mt-1">
                  تنسيق جداول بيانات
                </span>
              </div>
              <div
                onClick={() => setFormat("pdf")}
                className={`cursor-pointer rounded-lg border-2 p-4 flex flex-col items-center justify-center transition-all hover:bg-accent/50 ${
                  format === "pdf"
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-muted bg-transparent"
                }`}
              >
                <div className="text-2xl mb-2">📄</div>
                <span className="font-medium">PDF</span>
                <span className="text-xs text-muted-foreground mt-1">
                  مستند قابل للطباعة
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">الحقول المطلوبة</Label>
              <div className="flex gap-2 text-xs">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-primary hover:text-primary/80 hover:bg-primary/10"
                  onClick={() =>
                    setSelectedFields(AVAILABLE_FIELDS.map((f) => f.id))
                  }
                >
                  تحديد الكل
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-muted-foreground hover:text-foreground"
                  onClick={() => setSelectedFields([])}
                >
                  إلغاء الكل
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AVAILABLE_FIELDS.map((field) => {
                const isSelected = selectedFields.includes(field.id);
                return (
                  <div
                    key={field.id}
                    onClick={() => toggleField(field.id)}
                    className={`
                      cursor-pointer select-none rounded-md px-3 py-2 text-sm text-center border transition-all
                      ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary font-medium shadow-sm"
                          : "bg-background text-muted-foreground border-input hover:bg-accent hover:text-accent-foreground"
                      }
                    `}
                  >
                    {field.label}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-start">
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full sm:w-auto h-11 text-base shadow-sm"
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري التصدير...
              </>
            ) : (
              `تصدير ${format === "excel" ? "Excel" : "PDF"}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
