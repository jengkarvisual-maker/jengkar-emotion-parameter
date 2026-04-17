import Link from "next/link";

import { getAuthenticatedUser } from "@/lib/actions/auth";
import { getLogsPageData, getMemberDashboardData } from "@/lib/data/queries";
import { EmotionLogForm } from "@/components/forms/emotion-log-form";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { buttonVariants, Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  alignmentFeelingLabels,
  dominantEmotionLabels,
  sessionTypeLabels,
} from "@/lib/constants";
import { cn, formatDate, formatDateInput } from "@/lib/utils";

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<{
    memberId?: string;
    session?: "MORNING" | "NIGHT";
    startDate?: string;
    endDate?: string;
  }>;
}) {
  const user = await getAuthenticatedUser();
  const params = await searchParams;

  if (user.role === "OWNER") {
    const data = await getLogsPageData({
      role: "OWNER",
      memberId: params.memberId,
      sessionType: params.session,
      startDate: params.startDate,
      endDate: params.endDate,
    });
    const rangeLabel = `${formatDate(data.dateRange.startInput)} - ${formatDate(
      data.dateRange.endInput,
    )}`;

    return (
      <div className="space-y-6">
      <PageHeader
        eyebrow="Log pemilik"
        title="Semua log emosi"
        description="Tinjau log yang dikirim di seluruh tim dan saring berdasarkan anggota, sesi, atau rentang tanggal."
        />

        <Card>
          <CardHeader className="space-y-2">
            <CardTitle>Filter</CardTitle>
            <p className="text-sm text-muted-foreground">
              Rentang terpilih: {rangeLabel}
            </p>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,220px)_180px_170px_170px_auto_auto]">
              <select
                name="memberId"
                defaultValue={params.memberId ?? ""}
                className="h-10 rounded-lg border border-input bg-background/80 px-3 text-sm"
              >
                <option value="">Semua anggota</option>
                {data.members.map((member: (typeof data.members)[number]) => (
                  <option key={member.id} value={member.id}>
                    {member.fullName}
                  </option>
                ))}
              </select>
              <select
                name="session"
                defaultValue={params.session ?? ""}
                className="h-10 rounded-lg border border-input bg-background/80 px-3 text-sm"
              >
                <option value="">Kedua sesi</option>
                <option value="MORNING">Pagi</option>
                <option value="NIGHT">Malam</option>
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
              <Button type="submit">
                Terapkan filter
              </Button>
              <Link href="/logs" className={cn(buttonVariants({ variant: "ghost" }))}>
                Reset
              </Link>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-2">
            <CardTitle>Riwayat log</CardTitle>
            <p className="text-sm text-muted-foreground">
              {data.logs.length} log ditemukan dalam rentang terpilih.
            </p>
          </CardHeader>
          <CardContent>
            {data.logs.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Anggota</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Sesi</TableHead>
                    <TableHead>Skor</TableHead>
                    <TableHead>Keselarasan</TableHead>
                    <TableHead>Rekomendasi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.logs.map((log: (typeof data.logs)[number]) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <Link href={`/members/${log.teamMemberId}`} className="block space-y-1">
                          <p className="font-medium">{log.teamMember.fullName}</p>
                          <p className="text-xs text-muted-foreground">
                            {log.teamMember.divisionOrRole}
                          </p>
                        </Link>
                      </TableCell>
                      <TableCell>{formatDate(log.date)}</TableCell>
                      <TableCell>{sessionTypeLabels[log.sessionType]}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {`E ${log.emotionScore} - En ${log.energyScore} - S ${log.stressScore} - C ${log.clarityScore}`}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">
                            {alignmentFeelingLabels[log.alignmentFeeling]}
                          </Badge>
                          <Badge variant="secondary">
                            {dominantEmotionLabels[log.dominantEmotion]}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.recommendation ? (
                          <div className="space-y-1">
                            <p className="font-medium">{log.recommendation.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {log.recommendation.body}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Belum dibuat</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                eyebrow="Log"
                title="Tidak ada log dalam rentang ini"
                description="Coba perluas rentang tanggal atau hapus salah satu filter untuk melihat lebih banyak entri tim."
                action={
                  <Link href="/logs" className={cn(buttonVariants({ variant: "outline" }))}>
                    Reset filter
                  </Link>
                }
              />
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const dashboardData = await getMemberDashboardData(user.teamMemberId!);
  const logsData = await getLogsPageData({
    role: "MEMBER",
    teamMemberId: user.teamMemberId,
    startDate: params.startDate,
    endDate: params.endDate,
  });

  const sessionType = params.session === "NIGHT" ? "NIGHT" : "MORNING";
  const todaysLog =
    sessionType === "MORNING"
      ? dashboardData?.todayStatus.morning
      : dashboardData?.todayStatus.night;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Log saya"
        title="Check-in emosi harian"
        description="Simpan satu log pagi dan satu log malam setiap hari. Jika sesi sudah ada, penyimpanan ulang akan memperbaruinya."
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>Kirim atau perbarui log</CardTitle>
          </CardHeader>
          <CardContent>
            <EmotionLogForm
              defaultValues={{
                date: formatDateInput(new Date()),
                sessionType,
                emotionScore: todaysLog?.emotionScore,
                energyScore: todaysLog?.energyScore,
                stressScore: todaysLog?.stressScore,
                clarityScore: todaysLog?.clarityScore,
                dominantEmotion: todaysLog?.dominantEmotion,
                triggerText: todaysLog?.triggerText,
                note: todaysLog?.note,
                alignmentFeeling: todaysLog?.alignmentFeeling,
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Catatan singkat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <p className="font-medium">Pagi</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Paling baik digunakan sesaat setelah bangun untuk menangkap titik awal emosi di hari itu.
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
              <p className="font-medium">Malam</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Paling baik digunakan sebelum tidur untuk melihat bagaimana hari berubah dan apa yang mungkin memengaruhinya.
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
              Rekomendasi dibuat setelah setiap penyimpanan dan menggunakan bahasa yang lembut serta reflektif. Ini bukan panduan diagnostik atau medis.
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="space-y-2">
          <CardTitle>Riwayat log terbaru</CardTitle>
          <p className="text-sm text-muted-foreground">
            Menampilkan {logsData.logs.length} log dari {formatDate(logsData.dateRange.startInput)} sampai{" "}
            {formatDate(logsData.dateRange.endInput)}.
          </p>
        </CardHeader>
        <CardContent>
          {logsData.logs.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Sesi</TableHead>
                  <TableHead>Skor</TableHead>
                  <TableHead>Emosi dominan</TableHead>
                  <TableHead>Keselarasan</TableHead>
                  <TableHead>Rekomendasi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logsData.logs.map((log: (typeof logsData.logs)[number]) => (
                  <TableRow key={log.id}>
                    <TableCell>{formatDate(log.date)}</TableCell>
                    <TableCell>{sessionTypeLabels[log.sessionType]}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {`E ${log.emotionScore} - En ${log.energyScore} - S ${log.stressScore} - C ${log.clarityScore}`}
                    </TableCell>
                    <TableCell>{dominantEmotionLabels[log.dominantEmotion]}</TableCell>
                    <TableCell>{alignmentFeelingLabels[log.alignmentFeeling]}</TableCell>
                    <TableCell>
                      {log.recommendation ? (
                        <div className="space-y-1">
                          <p className="font-medium">{log.recommendation.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {log.recommendation.body}
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Menunggu</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              eyebrow="Log saya"
              title="Tidak ada log pribadi dalam rentang ini"
              description="Check-in terbaru Anda akan muncul di sini setelah menyimpan entri pagi atau malam."
              hint="Tampilan riwayat saat ini menggunakan jendela tanggal berjalan yang sama dengan aplikasi."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
