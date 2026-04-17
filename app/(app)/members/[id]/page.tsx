import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteMemberAction } from "@/lib/actions/members";
import { requireOwnerSession } from "@/lib/auth";
import { getMemberDetailData } from "@/lib/data/queries";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { MemberForm } from "@/components/forms/member-form";
import { EmotionTrendChart } from "@/components/charts/emotion-trend-chart";
import { MorningNightChart } from "@/components/charts/morning-night-chart";
import { HumanDesignSummaryCard } from "@/components/shared/human-design-summary-card";
import { RecommendationList } from "@/components/shared/recommendation-list";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { dominantEmotionLabels, sessionTypeLabels } from "@/lib/constants";
import { cn, formatDate, formatScore } from "@/lib/utils";

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireOwnerSession();
  const { id } = await params;
  const data = await getMemberDetailData(id);

  if (!data) {
    notFound();
  }

  const { member } = data;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Detail anggota"
        title={member.fullName}
        description={`${member.divisionOrRole} · ${member.email}`}
        actions={
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/members/${member.id}/human-design`}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Kelola Human Design
            </Link>
            <form action={deleteMemberAction}>
              <input type="hidden" name="memberId" value={member.id} />
              <button
                type="submit"
                className={cn(buttonVariants({ variant: "destructive" }))}
              >
                Hapus anggota
              </button>
            </form>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>Edit profil anggota</CardTitle>
          </CardHeader>
          <CardContent>
            <MemberForm
              mode="edit"
              defaultValues={{
                id: member.id,
                fullName: member.fullName,
                email: member.email,
                divisionOrRole: member.divisionOrRole,
                activeStatus: member.activeStatus,
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ringkasan saat ini</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <SnapshotBlock label="Email akun" value={member.user?.email ?? member.email} />
            <SnapshotBlock label="Status" value={member.activeStatus ? "Aktif" : "Nonaktif"} />
            <SnapshotBlock
              label="Rata-rata emosi"
              value={data.averages.emotion ? formatScore(data.averages.emotion) : "Belum ada log"}
            />
            <SnapshotBlock
              label="Rata-rata stres"
              value={data.averages.stress ? formatScore(data.averages.stress) : "Belum ada log"}
            />
            <SnapshotBlock
              label="Rata-rata kejernihan"
              value={data.averages.clarity ? formatScore(data.averages.clarity) : "Belum ada log"}
            />
            <SnapshotBlock
              label="Perubahan pagi/malam hari ini"
              value={
                data.pairedDifference !== null
                  ? `${data.pairedDifference} poin`
                  : "Menunggu kedua log"
              }
            />
          </CardContent>
        </Card>
      </div>

      <HumanDesignSummaryCard
        memberName={member.fullName}
        profile={member.humanDesignProfile}
        editHref={`/members/${member.id}/human-design`}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Linimasa sesi</CardTitle>
          </CardHeader>
          <CardContent>
            <EmotionTrendChart data={data.timeline} />
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
        <Card>
          <CardHeader>
            <CardTitle>Log terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Sesi</TableHead>
                  <TableHead>Emosi</TableHead>
                  <TableHead>Stres</TableHead>
                  <TableHead>Kejernihan</TableHead>
                  <TableHead>Emosi dominan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {member.emotionLogs
                  .slice()
                  .reverse()
                  .slice(0, 12)
                  .map((log: (typeof member.emotionLogs)[number]) => (
                    <TableRow key={log.id}>
                      <TableCell>{formatDate(log.date)}</TableCell>
                      <TableCell>
                        {
                          sessionTypeLabels[
                            log.sessionType as keyof typeof sessionTypeLabels
                          ]
                        }
                      </TableCell>
                      <TableCell>{log.emotionScore}</TableCell>
                      <TableCell>{log.stressScore}</TableCell>
                      <TableCell>{log.clarityScore}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {
                            dominantEmotionLabels[
                              log.dominantEmotion as keyof typeof dominantEmotionLabels
                            ]
                          }
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <RecommendationList recommendations={data.recommendations} />
      </div>
    </div>
  );
}

function SnapshotBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 font-medium">{value}</p>
    </div>
  );
}
