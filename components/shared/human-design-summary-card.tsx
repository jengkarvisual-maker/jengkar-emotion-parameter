import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RavechartViewer } from "@/components/shared/ravechart-viewer";
import { cn } from "@/lib/utils";

type HumanDesignSummaryCardProps = {
  memberName?: string;
  profile: {
    type: string | null;
    authority: string | null;
    profile: string | null;
    signature: string | null;
    notSelfTheme: string | null;
    decisionStyle: string | null;
    triggerNotes: string | null;
    emotionalNotes: string | null;
    ownerSummaryText: string | null;
    ravechartFileUrl: string | null;
  } | null;
  editHref?: string;
};

export function HumanDesignSummaryCard({
  memberName,
  profile,
  editHref,
}: HumanDesignSummaryCardProps) {
  const items = [
    { label: "Tipe", value: profile?.type ?? "Belum diisi" },
    { label: "Otoritas", value: profile?.authority ?? "Belum diisi" },
    { label: "Profil", value: profile?.profile ?? "Belum diisi" },
    { label: "Signature", value: profile?.signature ?? "Belum diisi" },
    { label: "Tema not-self", value: profile?.notSelfTheme ?? "Belum diisi" },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <CardTitle>Ringkasan Human Design</CardTitle>
          <p className="text-sm text-muted-foreground">
            Dikelola manual oleh pemilik pada V1. Tidak ada interpretasi chart otomatis.
          </p>
        </div>
        {editHref ? (
          <Link href={editHref} className={cn(buttonVariants({ variant: "outline" }))}>
            Kelola profil
          </Link>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <Badge key={item.label} variant="outline" className="px-3 py-2 text-sm">
              <span className="mr-2 font-semibold text-foreground">{item.label}:</span>
              <span>{item.value}</span>
            </Badge>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <SummaryBlock label="Gaya pengambilan keputusan" value={profile?.decisionStyle} />
          <SummaryBlock label="Catatan pemicu" value={profile?.triggerNotes} />
          <SummaryBlock label="Catatan emosional" value={profile?.emotionalNotes} />
          <SummaryBlock label="Ringkasan pemilik" value={profile?.ownerSummaryText} />
        </div>

        {profile?.ravechartFileUrl ? (
          <RavechartViewer fileUrl={profile.ravechartFileUrl} memberName={memberName} />
        ) : (
          <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-4 text-sm text-muted-foreground">
            Belum ada file ravechart yang diunggah untuk profil ini.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SummaryBlock({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
      <p className="text-sm font-medium">{label}</p>
      <p className="mt-2 text-sm leading-7 text-muted-foreground">
        {value || "Belum ada catatan."}
      </p>
    </div>
  );
}
