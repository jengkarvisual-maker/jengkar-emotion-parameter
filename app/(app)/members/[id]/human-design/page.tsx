import { notFound } from "next/navigation";

import { requireOwnerSession } from "@/lib/auth";
import { getMemberDetailData } from "@/lib/data/queries";
import { HumanDesignForm } from "@/components/forms/human-design-form";
import { HumanDesignSummaryCard } from "@/components/shared/human-design-summary-card";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function MemberHumanDesignPage({
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

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Human Design"
        title={`${data.member.fullName} · Human Design`}
        description="Unggah file rave chart dan kelola secara manual field ringkasan yang digunakan oleh mesin rekomendasi."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Editor profil manual</CardTitle>
          </CardHeader>
          <CardContent>
            <HumanDesignForm
              teamMemberId={data.member.id}
              profile={data.member.humanDesignProfile}
            />
          </CardContent>
        </Card>

        <HumanDesignSummaryCard
          memberName={data.member.fullName}
          profile={data.member.humanDesignProfile}
        />
      </div>
    </div>
  );
}
