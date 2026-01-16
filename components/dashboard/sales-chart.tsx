"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "يناير", value: 120 },
  { name: "فبراير", value: 145 },
  { name: "مارس", value: 160 },
  { name: "أبريل", value: 190 },
  { name: "مايو", value: 230 },
  { name: "يونيو", value: 280 },
  { name: "يوليو", value: 320 },
  { name: "أغسطس", value: 350 },
  { name: "سبتمبر", value: 410 },
  { name: "أكتوبر", value: 450 },
];

export function SalesChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>نمو الأعضاء</CardTitle>
        <p className="text-sm text-muted-foreground">
          <span className="text-2xl font-bold">450</span>
          <span className="text-green-600 mr-2">+12% هذا الشهر</span>
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" className="text-xs" tick={{ fontSize: 12 }} />
            <YAxis className="text-xs" tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar
              dataKey="value"
              fill="hsl(var(--primary))"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
