"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatScore } from "@/lib/utils";

type MorningNightChartProps = {
  data: Array<{
    label: string;
    morning: number | null;
    night: number | null;
  }>;
};

export function MorningNightChart({ data }: MorningNightChartProps) {
  const hasData = data.some(
    (item) => item.morning !== null || item.night !== null,
  );

  if (!hasData) {
    return (
      <ChartPlaceholder
        title="Belum ada data pasangan pagi dan malam"
        description="Saat kedua sesi tersedia pada periode ini, batang perbandingan akan muncul di sini."
      />
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: -12, right: 8, top: 8, bottom: 0 }} barGap={10}>
          <CartesianGrid strokeDasharray="4 6" stroke="rgba(111, 133, 126, 0.18)" />
          <XAxis
            dataKey="label"
            stroke="#6b7a76"
            tickLine={false}
            axisLine={false}
            fontSize={12}
            tickMargin={10}
            minTickGap={24}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[0, 10]}
            stroke="#6b7a76"
            tickLine={false}
            axisLine={false}
            fontSize={12}
            tickMargin={10}
            tickCount={6}
          />
          <Tooltip
            formatter={(value, name) => [formatTooltipValue(value), name]}
            labelStyle={{ color: "#23413a", fontWeight: 600 }}
            contentStyle={{
              borderRadius: 16,
              border: "1px solid rgba(126, 148, 142, 0.22)",
              backgroundColor: "rgba(255,255,255,0.96)",
              boxShadow: "0 18px 48px rgba(25, 44, 40, 0.12)",
            }}
          />
          <Legend verticalAlign="top" height={28} iconType="circle" />
          <Bar dataKey="morning" name="Pagi" fill="#1f6d61" radius={[10, 10, 4, 4]} />
          <Bar dataKey="night" name="Malam" fill="#d08b46" radius={[10, 10, 4, 4]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartPlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex h-[300px] items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 text-center">
      <div className="space-y-2">
        <p className="text-sm font-medium">{title}</p>
        <p className="max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function formatTooltipValue(value: unknown) {
  if (typeof value === "number") {
    return formatScore(value);
  }

  return "Tidak ada data";
}
