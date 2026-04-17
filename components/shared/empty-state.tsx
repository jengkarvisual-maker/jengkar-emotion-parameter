import { Card, CardContent } from "@/components/ui/card";

type EmptyStateProps = {
  eyebrow?: string;
  title: string;
  description: string;
  hint?: string;
  action?: React.ReactNode;
};

export function EmptyState({
  eyebrow = "Belum ada data",
  title,
  description,
  hint,
  action,
}: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex min-h-48 flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="rounded-full bg-muted/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {eyebrow}
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
          {hint ? (
            <p className="max-w-md text-xs uppercase tracking-[0.18em] text-muted-foreground/80">
              {hint}
            </p>
          ) : null}
        </div>
        {action ? <div className="pt-1">{action}</div> : null}
      </CardContent>
    </Card>
  );
}
