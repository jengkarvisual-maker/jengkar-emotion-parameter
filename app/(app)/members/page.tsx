import Link from "next/link";

import { requireOwnerSession } from "@/lib/auth";
import { getMembersPageData } from "@/lib/data/queries";
import { MemberForm } from "@/components/forms/member-form";
import { PageHeader } from "@/components/shared/page-header";
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
import { formatDate, formatScore } from "@/lib/utils";

export default async function MembersPage() {
  await requireOwnerSession();
  const members = await getMembersPageData();
  const activeCount = members.filter(
    (member: (typeof members)[number]) => member.activeStatus,
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Peralatan pemilik"
        title="Manajemen anggota"
        description="Buat atau perbarui profil anggota, sinkronkan akses login, dan buka setiap data anggota untuk grafik, log, dan catatan Human Design."
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>Tambah anggota baru</CardTitle>
          </CardHeader>
          <CardContent>
            <MemberForm mode="create" />
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <SummaryCard label="Total anggota" value={String(members.length)} />
          <SummaryCard label="Anggota aktif" value={String(activeCount)} tone="success" />
          <SummaryCard
            label="Human Design dimulai"
            value={String(
              members.filter(
                (member: (typeof members)[number]) => member.humanDesignReady,
              ).length,
            )}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar anggota tim</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Anggota</TableHead>
                <TableHead>Peran</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rata-rata emosi 7 hari</TableHead>
                <TableHead>Rekomendasi terbaru</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member: (typeof members)[number]) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <Link href={`/members/${member.id}`} className="space-y-1 block">
                      <p className="font-medium">{member.fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        {member.email} · {member.divisionOrRole}
                      </p>
                    </Link>
                  </TableCell>
                  <TableCell>{member.divisionOrRole}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={member.activeStatus ? "success" : "warn"}>
                        {member.activeStatus ? "Aktif" : "Nonaktif"}
                      </Badge>
                      <Badge variant={member.humanDesignReady ? "outline" : "secondary"}>
                        {member.humanDesignReady ? "HD dimulai" : "HD menunggu"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {member.averageEmotion7 ? formatScore(member.averageEmotion7) : "Belum ada log"}
                  </TableCell>
                  <TableCell>
                    {member.latestRecommendation ? (
                      <div className="space-y-1">
                        <p className="font-medium">{member.latestRecommendation.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(member.latestRecommendation.date)}
                        </p>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Belum ada rekomendasi</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "success";
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
        {tone === "success" ? (
          <p className="mt-2 text-sm text-success">Saat ini diaktifkan untuk tim internal.</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
