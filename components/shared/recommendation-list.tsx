import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/utils";
import { sessionTypeLabels } from "@/lib/constants";

type RecommendationListProps = {
  recommendations: Array<{
    id: string;
    title: string;
    body: string;
    createdAt: Date;
    date: Date;
    sessionType: "MORNING" | "NIGHT";
  }>;
};

export function RecommendationList({ recommendations }: RecommendationListProps) {
  if (!recommendations.length) {
    return (
      <EmptyState
        eyebrow="Rekomendasi"
        title="Belum ada rekomendasi"
        description="Rekomendasi disimpan otomatis setelah log emosi dikirim."
        hint="Simpan log pagi atau malam untuk menghasilkan catatan reflektif pertama."
      />
    );
  }

  return (
    <div className="space-y-4">
      {recommendations.map((recommendation) => (
        <Card key={recommendation.id}>
          <CardHeader className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline">
                {`${formatDate(recommendation.date)} - ${sessionTypeLabels[recommendation.sessionType]}`}
              </Badge>
              <p className="text-xs text-muted-foreground">
                Disimpan {formatDate(recommendation.createdAt)}
              </p>
            </div>
            <CardTitle className="text-base">{recommendation.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-7 text-muted-foreground">{recommendation.body}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
