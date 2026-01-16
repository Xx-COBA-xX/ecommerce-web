"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "01 يوليو", value: 30 },
  { name: "02 يوليو", value: 45 },
  { name: "03 يوليو", value: 35 },
  { name: "04 يوليو", value: 55 },
  { name: "05 يوليو", value: 50 },
  { name: "06 يوليو", value: 70 },
  { name: "07 يوليو", value: 65 },
  { name: "08 يوليو", value: 80 },
  { name: "09 يوليو", value: 75 },
  { name: "10 يوليو", value: 85 },
];

export function RevenueChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>إجمالي الإيرادات</CardTitle>
        <p className="text-sm text-muted-foreground">
          <span className="text-2xl font-bold">$20,462.89</span>
          <span className="text-green-600 mr-2">+62% من الشهر الماضي</span>
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" className="text-xs" tick={{ fontSize: 12 }} />
            <YAxis className="text-xs" tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))", r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
