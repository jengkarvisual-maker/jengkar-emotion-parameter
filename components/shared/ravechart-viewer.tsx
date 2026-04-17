import Link from "next/link";

type RavechartViewerProps = {
  fileUrl: string;
  memberName?: string;
};

export function RavechartViewer({ fileUrl, memberName }: RavechartViewerProps) {
  const isPdf = fileUrl.toLowerCase().endsWith(".pdf");
  const title = memberName ? `Ravechart ${memberName}` : "Ravechart";

  return (
    <div className="space-y-4 rounded-2xl border border-border/70 bg-muted/25 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Pratinjau ravechart</p>
          <p className="text-sm text-muted-foreground">
            File yang sudah diunggah untuk profil ini dapat ditinjau langsung di sini.
          </p>
        </div>
        <Link
          href={fileUrl}
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          target="_blank"
        >
          Buka file penuh
        </Link>
      </div>

      {isPdf ? (
        <iframe
          src={fileUrl}
          title={title}
          className="h-[520px] w-full rounded-xl border border-border/70 bg-background"
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/70 bg-background">
          <img
            src={fileUrl}
            alt={title}
            className="max-h-[720px] w-full object-contain"
          />
        </div>
      )}
    </div>
  );
}
