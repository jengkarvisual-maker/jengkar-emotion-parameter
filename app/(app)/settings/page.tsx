import { getAuthenticatedUser } from "@/lib/actions/auth";
import { PasswordForm } from "@/components/forms/password-form";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function SettingsPage() {
  const user = await getAuthenticatedUser();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Pengaturan"
        title="Pengaturan akun"
        description="Kelola kata sandi Anda dan tinjau bagaimana workspace ini menangani pelacakan emosi serta data ringkasan Human Design."
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Detail profil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailRow label="Email" value={user.email} />
            <DetailRow label="Peran" value={user.role === "OWNER" ? "Pemilik" : "Anggota"} />
            <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
              <p className="font-medium">Catatan penanganan data</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                JEPAT ditujukan untuk refleksi dan kesadaran kesejahteraan tim. Aplikasi ini tidak memberikan diagnosis, perawatan, atau penilaian mutlak tentang kesehatan mental.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ubah kata sandi</CardTitle>
          </CardHeader>
          <CardContent>
            <PasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-background/70 px-4 py-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <Badge variant="outline">{value}</Badge>
    </div>
  );
}
