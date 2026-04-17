import { logoutAction } from "@/lib/actions/auth";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type TopbarProps = {
  title?: string;
  subtitle?: string;
};

export function Topbar({ title, subtitle }: TopbarProps) {
  return (
    <div className="flex flex-col gap-4 rounded-[26px] border border-border/70 bg-background/75 px-6 py-5 shadow-glow backdrop-blur-xl md:flex-row md:items-center md:justify-between">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/80">
          Hari ini
        </p>
        <div>
          <h2 className="text-lg font-semibold">{title ?? formatDate(new Date(), { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</h2>
          <p className="text-sm text-muted-foreground">
            {subtitle ?? "Tampilan tenang untuk input harian, catatan reflektif, dan pola tim."}
          </p>
        </div>
      </div>

      <form action={logoutAction}>
        <Button type="submit" variant="outline">
          Keluar
        </Button>
      </form>
    </div>
  );
}
