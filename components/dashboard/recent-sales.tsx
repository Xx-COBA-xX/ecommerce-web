"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MoreHorizontal, FileDown, Calendar } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const salesData = [
  {
    id: "1",
    client: "Savannah Nguyen",
    date: "07/05/2025",
    price: "$25.00",
    category: "Clothes",
    product: "Le Waikiki Jean cargo file avec taille...",
    city: "Rabat",
    status: "Completed",
  },
  {
    id: "2",
    client: "Jerome Bell",
    date: "07/05/2025",
    price: "$25.00",
    category: "Shoes",
    product: "Le Waikiki Jean cargo file avec taille...",
    city: "Rabat",
    status: "Pending",
  },
  {
    id: "3",
    client: "Darlene Robertson",
    date: "07/05/2025",
    price: "$25.00",
    category: "Clothes",
    product: "Le Waikiki Jean cargo file avec taille...",
    city: "Rabat",
    status: "In Progress",
  },
  {
    id: "4",
    client: "Cody Fisher",
    date: "07/05/2025",
    price: "$25.00",
    category: "Clothes",
    product: "Le Waikiki Jean cargo file avec taille...",
    city: "Rabat",
    status: "Cancelled",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-700 hover:bg-green-100/80";
    case "Pending":
      return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100/80";
    case "In Progress":
      return "bg-blue-100 text-blue-700 hover:bg-blue-100/80";
    case "Cancelled":
      return "bg-red-100 text-red-700 hover:bg-red-100/80";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export function RecentSales() {
  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-7">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>أحدث المبيعات</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              آخر 30 يوم
            </Button>
            <Button variant="outline" size="sm">
              <FileDown className="mr-2 h-4 w-4" />
              تصدير
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4 bg-transparent border-b w-full justify-start h-auto p-0 rounded-none space-x-6 space-x-reverse">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-2"
            >
              الكل
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-2"
            >
              مكتمل
            </TabsTrigger>
            <TabsTrigger
              value="in-progress"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-2"
            >
              جاري التنفيذ
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-2"
            >
              بانتظار الموافقة
            </TabsTrigger>
            <TabsTrigger
              value="cancelled"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-2"
            >
              ملغى
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">اسم العميل</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">السعر</TableHead>
                  <TableHead className="text-right">الفئة</TableHead>
                  <TableHead className="text-right">المنتج</TableHead>
                  <TableHead className="text-right">المدينة</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesData.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.client}</TableCell>
                    <TableCell>{sale.date}</TableCell>
                    <TableCell>{sale.price}</TableCell>
                    <TableCell>{sale.category}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {sale.product}
                    </TableCell>
                    <TableCell>{sale.city}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={getStatusColor(sale.status)}
                      >
                        {sale.status === "Completed" && "• مكتمل"}
                        {sale.status === "Pending" && "• معلق"}
                        {sale.status === "In Progress" && "• جاري التنفيذ"}
                        {sale.status === "Cancelled" && "• ملغى"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                          <DropdownMenuItem>عرض التفاصيل</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>تعديل حالة الطلب</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            حذف الطلب
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
          {/* Add content for other tabs similarly if needed */}
        </Tabs>
      </CardContent>
    </Card>
  );
}
