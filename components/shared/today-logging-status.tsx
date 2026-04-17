import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TodayLoggingStatusProps = {
  morningCompleted: boolean;
  nightCompleted: boolean;
  pairedDifference?: number | null;
};

export function TodayLoggingStatus({
  morningCompleted,
  nightCompleted,
  pairedDifference,
}: TodayLoggingStatusProps) {
  const status = [
    { label: "Log pagi", complete: morningCompleted, query: "MORNING" },
    { label: "Log malam", complete: nightCompleted, query: "NIGHT" },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <CardTitle>Status pengisian log hari ini</CardTitle>
          <p className="text-sm text-muted-foreground">
            Anggota dapat mengirim satu log pagi dan satu log malam setiap hari.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/logs?session=MORNING#log-form"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Check-in pagi
          </Link>
          <Link href="/logs?session=NIGHT#log-form" className={cn(buttonVariants())}>
            Check-in malam
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 md:grid-cols-2">
          {status.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-border/70 bg-background/70 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">{item.label}</p>
                <Badge variant={item.complete ? "success" : "warn"}>
                  {item.complete ? "Terkirim" : "Menunggu"}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {pairedDifference !== null && pairedDifference !== undefined ? (
          <div className="rounded-2xl border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
            Selisih skor emosi pagi dan malam hari ini adalah{" "}
            <span className="font-semibold text-foreground">{pairedDifference}</span>.
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
