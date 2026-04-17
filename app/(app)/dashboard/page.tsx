import Link from "next/link";
import { notFound } from "next/navigation";

import { getAuthenticatedUser } from "@/lib/actions/auth";
import { getOwnerDashboardData, getMemberDashboardData } from "@/lib/data/queries";
import { average, cn, formatDate, formatScore } from "@/lib/utils";
import { buttonVariants, Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmotionTrendChart } from "@/components/charts/emotion-trend-chart";
import { MorningNightChart } from "@/components/charts/morning-night-chart";
import { RecommendationList } from "@/components/shared/recommendation-list";
import { TodayLoggingStatus } from "@/components/shared/today-logging-status";
import { HumanDesignSummaryCard } from "@/components/shared/human-design-summary-card";
import { EmptyState } from "@/components/shared/empty-state";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ member?: string; startDate?: string; endDate?: string }>;
}) {
  const user = await getAuthenticatedUser();

  if (user.role === "OWNER") {
    const params = await searchParams;
    const data = await getOwnerDashboardData(params.member, {
      startDate: params.startDate,
      endDate: params.endDate,
    });
    const rangeLabel = `${formatDate(data.dateRange.startInput)} - ${formatDate(
      data.dateRange.endInput,
    )}`;
    const buildDashboardHref = (memberId: string) => {
      const query = new URLSearchParams({
        member: memberId,
        startDate: data.dateRange.startInput,
        endDate: data.dateRange.endInput,
      });

      return `/dashboard?${query.toString()}`;
    };

    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Tampilan pemilik"
          title="Ikhtisar emosi tim"
          description="Pantau siapa yang sudah check-in, bandingkan perubahan jangka pendek, dan tinjau pola reflektif di seluruh tim."
          actions={
            <form className="grid w-full gap-3 md:grid-cols-2 xl:w-auto xl:grid-cols-[minmax(0,220px)_160px_160px_auto_auto]">
              <select
                name="member"
                defaultValue={data.selectedMember?.id ?? ""}
                className="h-10 rounded-lg border border-input bg-background/80 px-3 text-sm"
              >
                {data.members.length ? (
                  data.members.map((member: (typeof data.members)[number]) => (
                    <option key={member.id} value={member.id}>
                      {member.fullName}
                    </option>
                  ))
                ) : (
                  <option value="">Belum ada anggota</option>
                )}
              </select>
              <input
                type="date"
                name="startDate"
                defaultValue={data.dateRange.startInput}
                className="h-10 rounded-lg border border-input bg-background/80 px-3 text-sm"
              />
              <input
                type="date"
                name="endDate"
                defaultValue={data.dateRange.endInput}
                className="h-10 rounded-lg border border-input bg-background/80 px-3 text-sm"
              />
              <Button type="submit" variant="outline">
                Terapkan filter
              </Button>
              <Link href="/dashboard" className={cn(buttonVariants({ variant: "ghost" }))}>
                Reset
              </Link>
            </form>
          }
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Anggota aktif"
            value={String(data.activeMembers)}
            hint="Anggota seed dan profil aktif baru apa pun."
          />
          <StatCard
            label="Log pagi hari ini"
            value={String(data.morningFilledToday.length)}
            hint={`${data.nightFilledToday.length} log malam sudah dikirim sejauh ini.`}
            accent="success"
          />
          <StatCard
            label="Rata-rata emosi hari ini"
            value={data.averageEmotionToday ? formatScore(data.averageEmotionToday) : "Belum ada log"}
            hint="Rata-rata dari semua log yang dikirim hari ini."
          />
          <StatCard
            label="Rata-rata stres hari ini"
            value={data.averageStressToday ? formatScore(data.averageStressToday) : "Belum ada log"}
            hint="Nilai yang lebih tinggi dapat mengisyaratkan tekanan yang meningkat."
            accent="warn"
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <Card>
            <CardHeader className="space-y-2">
              <CardTitle>Tren rata-rata tim</CardTitle>
              <p className="text-sm text-muted-foreground">
                Rentang terpilih: {rangeLabel}
              </p>
            </CardHeader>
            <CardContent>
              <EmotionTrendChart data={data.teamTrend} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ringkasan hari ini</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoPanel
                title="Rentang terpilih"
                body={`Jendela ${data.dateRange.days} hari dari ${formatDate(
                  data.dateRange.startInput,
                )} sampai ${formatDate(data.dateRange.endInput)}.`}
              />
              <InfoPanel
                title="Fluktuasi tertinggi hari ini"
                body={
                  data.highestFluctuationToday
                    ? `${data.highestFluctuationToday.fullName} berubah ${data.highestFluctuationToday.difference} poin antara pagi dan malam.`
                    : "Belum ada anggota yang memiliki log pagi dan malam hari ini."
                }
              />
              <InfoPanel
                title="Paling stabil 7 hari terakhir"
                body={
                  data.mostStableMember
                    ? `${data.mostStableMember.fullName} menunjukkan pola terbaru yang paling stabil pada jendela 7 hari saat ini.`
                    : "Diperlukan lebih banyak data terbaru sebelum stabilitas bisa dibandingkan."
                }
              />
              <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                <p className="text-sm font-medium">Navigasi cepat</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <Link
                    href="/members"
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  >
                    Kelola anggota
                  </Link>
                  {data.selectedMember ? (
                    <Link
                      href={`/members/${data.selectedMember.id}`}
                      className={cn(buttonVariants({ size: "sm" }))}
                    >
                      Buka anggota terpilih
                    </Link>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {data.selectedMember ? (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <StatCard
                label="Log dalam rentang"
                value={String(data.selectedMember.logsInRange)}
                hint="Semua entri pagi dan malam terpilih pada filter saat ini."
              />
              <StatCard
                label="Indeks stabilitas"
                value={formatIndexValue(data.selectedMember.stabilityIndex)}
                hint="Nilai yang lebih tinggi menunjukkan pola terbaru yang lebih stabil."
                accent="success"
              />
              <StatCard
                label="Skor fluktuasi"
                value={formatIndexValue(data.selectedMember.fluctuationScore)}
                hint="Nilai yang lebih tinggi mencerminkan perubahan emosi terbaru yang lebih besar."
                accent="warn"
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <Card>
                <CardHeader className="space-y-2">
                  <CardTitle>{data.selectedMember.fullName} - linimasa sesi</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {data.selectedMember.divisionOrRole} - {data.selectedMember.email}
                  </p>
                </CardHeader>
                <CardContent>
                  <EmotionTrendChart data={data.selectedMember.timeline} />
                </CardContent>
              </Card>

              <HumanDesignSummaryCard
                memberName={data.selectedMember.fullName}
                profile={data.selectedMember.humanDesignProfile}
                editHref={`/members/${data.selectedMember.id}/human-design`}
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <Card>
                <CardHeader className="space-y-2">
                  <CardTitle>{data.selectedMember.fullName} - rata-rata rentang terpilih</CardTitle>
                  <p className="text-sm text-muted-foreground">{rangeLabel}</p>
                </CardHeader>
                <CardContent>
                  <EmotionTrendChart data={data.selectedMember.trendRange} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="space-y-2">
                  <CardTitle>{data.selectedMember.fullName} - pagi vs malam</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Hingga 14 hari terakhir di dalam rentang yang dipilih.
                  </p>
                </CardHeader>
                <CardContent>
                  <MorningNightChart data={data.selectedMember.morningNight} />
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Status check-in hari ini</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
                  <StatusListCard
                    title="Pagi selesai"
                    people={data.morningFilledToday}
                    emptyLabel="Belum ada log pagi."
                  />
                  <StatusListCard
                    title="Malam selesai"
                    people={data.nightFilledToday}
                    emptyLabel="Belum ada log malam."
                  />
                  <StatusListCard
                    title="Belum ada log hari ini"
                    people={data.notFilledToday}
                    emptyLabel="Semua orang sudah memiliki setidaknya satu log hari ini."
                  />
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader className="space-y-2">
                    <CardTitle>Ringkasan pola anggota</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Stabilitas dan fluktuasi mencerminkan rentang tanggal yang dipilih.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {data.members.map((member: (typeof data.members)[number]) => (
                      <Link
                        key={member.id}
                        href={buildDashboardHref(member.id)}
                        className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-background/70 px-4 py-3 transition hover:border-primary/25 hover:bg-primary/5"
                      >
                        <div className="space-y-1">
                          <p className="font-medium">{member.fullName}</p>
                          <p className="text-xs text-muted-foreground">
                            {member.divisionOrRole}
                          </p>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          <p>{member.logsInRange} log dalam rentang</p>
                          <p>Stabilitas {formatIndexValue(member.stabilityIndex)}</p>
                          <p>Fluktuasi {formatIndexValue(member.fluctuationScore)}</p>
                        </div>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
                <RecommendationList recommendations={data.selectedMember.recentRecommendations} />
              </div>
            </div>
          </>
        ) : (
          <EmptyState
            eyebrow="Anggota"
            title="Belum ada anggota"
            description="Buat profil anggota untuk mulai mencatat pola emosi dan menampilkan dasbor."
            action={
              <Link href="/members" className={cn(buttonVariants({ variant: "outline" }))}>
                Buka anggota
              </Link>
            }
          />
        )}
      </div>
    );
  }

  if (!user.teamMemberId) {
    notFound();
  }

  const data = await getMemberDashboardData(user.teamMemberId);

  if (!data) {
    notFound();
  }

  const emotionAverage = average(
    data.trend7
      .map((item: (typeof data.trend7)[number]) => item.emotion)
      .filter((value): value is number => value !== null),
  );
  const stressAverage = average(
    data.trend7
      .map((item: (typeof data.trend7)[number]) => item.stress)
      .filter((value): value is number => value !== null),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tampilan anggota"
        title={`Selamat datang kembali, ${data.member.fullName.split(" ")[0]}`}
        description="Gunakan check-in harian untuk melihat pola dari waktu ke waktu, membandingkan perubahan pagi dan malam, serta meninjau rekomendasi yang lembut."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Rata-rata emosi 7 hari"
          value={emotionAverage ? formatScore(emotionAverage) : "Belum ada data"}
          hint="Rata-rata dari log terbaru Anda."
        />
        <StatCard
          label="Rata-rata stres 7 hari"
          value={stressAverage ? formatScore(stressAverage) : "Belum ada data"}
          hint="Indikator lembut tentang tekanan pada entri terbaru Anda."
          accent="warn"
        />
        <StatCard
          label="Indeks stabilitas"
          value={formatIndexValue(data.stabilityIndex)}
          hint="Nilai yang lebih tinggi menunjukkan pola terbaru yang lebih stabil."
          accent="success"
        />
        <StatCard
          label="Skor fluktuasi"
          value={formatIndexValue(data.fluctuationScore)}
          hint="Nilai yang lebih tinggi mencerminkan perubahan terbaru yang lebih besar."
          accent="warn"
        />
      </div>

      <TodayLoggingStatus
        morningCompleted={Boolean(data.todayStatus.morning)}
        nightCompleted={Boolean(data.todayStatus.night)}
        pairedDifference={data.pairedDifference}
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Tren emosi 30 hari</CardTitle>
          </CardHeader>
          <CardContent>
            <EmotionTrendChart data={data.trend30} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Perbandingan pagi vs malam</CardTitle>
          </CardHeader>
          <CardContent>
            <MorningNightChart data={data.morningNight} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <HumanDesignSummaryCard
          memberName={data.member.fullName}
          profile={data.member.humanDesignProfile}
        />
        <RecommendationList recommendations={data.recommendations} />
      </div>
    </div>
  );
}

function StatusListCard({
  title,
  people,
  emptyLabel,
}: {
  title: string;
  people: Array<{ id: string; fullName: string; divisionOrRole: string }>;
  emptyLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
      <p className="font-medium">{title}</p>
      {people.length ? (
        <div className="mt-3 space-y-2">
          {people.map((person: (typeof people)[number]) => (
            <Link
              key={person.id}
              href={`/members/${person.id}`}
              className="block rounded-xl border border-border/70 bg-card/80 px-3 py-3 text-sm transition hover:border-primary/25 hover:bg-primary/5"
            >
              <p className="font-medium">{person.fullName}</p>
              <p className="text-xs text-muted-foreground">{person.divisionOrRole}</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-3 rounded-xl border border-dashed border-border/80 bg-muted/20 px-3 py-4 text-sm text-muted-foreground">
          {emptyLabel}
        </div>
      )}
    </div>
  );
}

function InfoPanel({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
      <p className="font-medium">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
    </div>
  );
}

function formatIndexValue(value: number | null) {
  if (value === null) {
    return "Perlu data";
  }

  return `${value}/100`;
}
