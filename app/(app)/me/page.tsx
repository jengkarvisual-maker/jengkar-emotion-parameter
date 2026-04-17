import { notFound } from "next/navigation";

import { getAuthenticatedUser } from "@/lib/actions/auth";
import { getMePageData } from "@/lib/data/queries";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HumanDesignSummaryCard } from "@/components/shared/human-design-summary-card";
import { RecommendationList } from "@/components/shared/recommendation-list";
import { EmotionTrendChart } from "@/components/charts/emotion-trend-chart";
import { Badge } from "@/components/ui/badge";

export default async function MePage() {
  const user = await getAuthenticatedUser();
  const data = await getMePageData(user.id);

  if (!data) {
    notFound();
  }

  if (!user.teamMember) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Akun"
          title="Akun pemilik"
          description="Akun pemilik Anda dapat mengelola profil, melihat semua log, dan memelihara ringkasan Human Design."
        />

        <div className="grid gap-6 md:grid-cols-3">
          <OwnerMetric label="Email pemilik" value={data.user.email} />
          <OwnerMetric label="Anggota dalam sistem" value={String(data.memberCount)} />
          <OwnerMetric label="Log emosi tersimpan" value={String(data.logCount)} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tentang workspace ini</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
            <p>
              Aplikasi ini dirancang sebagai pelacak reflektif kesejahteraan dan kesadaran diri untuk penggunaan internal.
              Ini bukan sistem medis, psikologis, atau diagnostik.
            </p>
            <p>
              Konten Human Design dimasukkan secara manual pada V1, dan teks rekomendasi dibuat hanya melalui rule engine sederhana berdasarkan log terbaru serta catatan ringkasan yang tersimpan.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Profil saya"
        title={user.teamMember.fullName}
        description={`${user.teamMember.divisionOrRole} · ${user.email}`}
      />

      <div className="grid gap-6 md:grid-cols-3">
        <OwnerMetric label="Email akun" value={data.user.email} />
        <OwnerMetric
          label="Status profil"
          value={user.teamMember.activeStatus ? "Aktif" : "Nonaktif"}
        />
        <Card>
          <CardContent className="flex h-full items-center justify-center p-6">
            <Badge variant="success">Akun anggota</Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>Tren 30 hari</CardTitle>
          </CardHeader>
          <CardContent>
            <EmotionTrendChart data={data.trend30 ?? []} />
          </CardContent>
        </Card>
        <HumanDesignSummaryCard
          memberName={user.teamMember.fullName}
          profile={user.teamMember.humanDesignProfile}
        />
      </div>

      <RecommendationList recommendations={data.recommendations} />
    </div>
  );
}

function OwnerMetric({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}
