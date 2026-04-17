"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatScore } from "@/lib/utils";

type EmotionTrendChartProps = {
  data: Array<{
    label: string;
    emotion: number | null;
    stress?: number | null;
    clarity?: number | null;
    energy?: number | null;
  }>;
};

export function EmotionTrendChart({ data }: EmotionTrendChartProps) {
  const hasData = data.some(
    (item) =>
      item.emotion !== null ||
      item.stress !== null ||
      item.clarity !== null ||
      item.energy !== null,
  );
  const showStress = data.some((item) => item.stress !== null && item.stress !== undefined);
  const showClarity = data.some((item) => item.clarity !== null && item.clarity !== undefined);

  if (!hasData) {
    return (
      <ChartPlaceholder
        title="Belum ada data grafik pada rentang ini"
        description="Saat log untuk periode ini tersedia, tren akan muncul di sini."
      />
    );
  }

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: -12, right: 8, top: 8, bottom: 0 }}>
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
          <Line
            type="monotone"
            dataKey="emotion"
            name="Emosi"
            stroke="#1f6d61"
            strokeWidth={3}
            dot={{ r: 2.5 }}
            activeDot={{ r: 4 }}
            connectNulls
          />
          {showStress ? (
            <Line
              type="monotone"
              dataKey="stress"
              name="Stres"
              stroke="#c7692d"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          ) : null}
          {showClarity ? (
            <Line
              type="monotone"
              dataKey="clarity"
              name="Kejernihan"
              stroke="#5c8b63"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          ) : null}
        </LineChart>
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
    <div className="flex h-[320px] items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 text-center">
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
