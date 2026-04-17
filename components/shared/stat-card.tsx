import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  trend?: "up" | "down" | "neutral";
  accent?: "primary" | "success" | "warn";
};

export function StatCard({
  label,
  value,
  hint,
  trend = "neutral",
  accent = "primary",
}: StatCardProps) {
  const TrendIcon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;

  return (
    <Card className="overflow-hidden">
      <CardContent className="relative p-6">
        <div
          className={cn(
            "absolute inset-x-0 top-0 h-1",
            accent === "primary" && "bg-primary/80",
            accent === "success" && "bg-success/80",
            accent === "warn" && "bg-warn/80",
          )}
        />
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-semibold tracking-tight">{value}</p>
          </div>
          <div className="rounded-full border border-border/60 bg-background/70 p-2 text-muted-foreground">
            <TrendIcon className="size-4" />
          </div>
        </div>
        {hint ? <p className="mt-4 text-sm text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
