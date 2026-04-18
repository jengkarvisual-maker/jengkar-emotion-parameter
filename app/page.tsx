import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  ExternalLink,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { APP_PORTAL_DOMAIN, INTERNAL_APP_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

function normalizeHost(value: string | null) {
  if (!value) {
    return "";
  }

  return value.split(",")[0]?.trim().replace(/:\d+$/, "") ?? "";
}

function getStatusLabel(status: "active" | "setup" | "planned") {
  switch (status) {
    case "active":
      return "Aktif";
    case "setup":
      return "Disiapkan";
    case "planned":
      return "Segera hadir";
  }
}

function getAppPresentation(appName: string): {
  Icon: LucideIcon;
  category: string;
  audience: string;
  accessNote: string;
  accentClassName: string;
} {
  switch (appName) {
    case "Finance":
      return {
        Icon: WalletCards,
        category: "Keuangan Internal",
        audience: "Owner dan admin keuangan",
        accessNote: "Masuk untuk transaksi, arus kas, dan laporan",
        accentClassName:
          "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300",
      };
    case "Jengkar KPI":
      return {
        Icon: BriefcaseBusiness,
        category: "Operasional Tim",
        audience: "Owner, admin, dan karyawan",
        accessNote: "Masuk langsung ke login atau dashboard KPI",
        accentClassName:
          "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
      };
    default:
      return {
        Icon: BadgeCheck,
        category: "Aplikasi Internal",
        audience: "Tim internal",
        accessNote: "Masuk melalui subdomain aplikasi",
        accentClassName: "border-primary/20 bg-primary/10 text-primary",
      };
  }
}

export default async function HomePage() {
  const headerStore = await headers();
  const host = normalizeHost(
    headerStore.get("x-forwarded-host") ?? headerStore.get("host"),
  );
  const portalHost = new URL(APP_PORTAL_DOMAIN).host;
  const isPortalHost = host === portalHost || host === `www.${portalHost}`;

  if (!isPortalHost) {
    const session = await getSession();

    redirect(session ? "/dashboard" : "/login");
  }

  const activeApps = INTERNAL_APP_LINKS.filter((app) => app.status === "active");
  const quickAccessApps = activeApps.filter((app) => app.href);

  return (
    <main className="relative min-h-screen px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col justify-between rounded-[32px] border border-border/70 bg-background/85 px-6 py-8 shadow-glow backdrop-blur-xl md:px-10 md:py-10">
        <div className="space-y-10">
          <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <div className="space-y-6">
              <div className="inline-flex w-fit rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                Portal aplikasi Rumah Jengkar
              </div>
              <div className="space-y-4">
                <h1 className="font-serif text-4xl leading-tight text-balance text-foreground md:text-6xl">
                  Satu landing page untuk membuka seluruh sistem kerja Rumah Jengkar.
                </h1>
                <p className="max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
                  Gunakan halaman ini sebagai gerbang utama untuk menuju Jengkar
                  Finance dan aplikasi operasional KPI. Setiap aplikasi tetap
                  berjalan di subdomainnya masing-masing agar akses tim lebih rapi,
                  aman, dan mudah dibuka dari laptop maupun handphone.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {quickAccessApps.map((app, index) => (
                  <a
                    className={buttonVariants({
                      size: "lg",
                      variant: index === 0 ? "default" : "outline",
                    })}
                    href={app.href ?? "#"}
                    key={app.name}
                  >
                    Buka {app.name}
                    {index === 0 ? (
                      <ArrowRight className="ml-2 size-4" />
                    ) : (
                      <ExternalLink className="ml-2 size-4" />
                    )}
                  </a>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-border/70 bg-card/90 p-6">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/80">
                  Struktur domain
                </p>
                <div className="space-y-4">
                  <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
                    <p className="text-sm font-medium text-foreground">Portal utama</p>
                    <p className="mt-1 font-mono text-sm text-primary">{portalHost}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Landing page pusat untuk mengarahkan tim ke aplikasi yang
                      dibutuhkan.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                    <p className="text-sm font-medium text-foreground">Aplikasi Finance</p>
                    <p className="mt-1 font-mono text-sm text-foreground">
                      finance.rumahjengkar.com
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Subdomain ini dipakai untuk transaksi, laporan, dan alur
                      keuangan internal Rumah Jengkar.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                    <p className="text-sm font-medium text-foreground">Aplikasi Jengkar KPI</p>
                    <p className="mt-1 font-mono text-sm text-foreground">
                      ops.rumahjengkar.com
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Subdomain ini langsung membuka halaman login atau dashboard,
                      tanpa landing page terpisah.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            {INTERNAL_APP_LINKS.map((app) => {
              const presentation = getAppPresentation(app.name);
              const badgeStyles =
                app.status === "active"
                  ? "border-success/25 bg-success/10 text-success"
                  : app.status === "setup"
                    ? "border-warn/25 bg-warn/10 text-warn"
                    : "border-border/70 bg-muted/30 text-muted-foreground";

              return (
                <article
                  className={cn(
                    "flex h-full flex-col rounded-[26px] border p-6 transition",
                    app.href
                      ? "border-border/70 bg-card/90 hover:border-primary/25 hover:bg-primary/5"
                      : "border-dashed border-border/70 bg-muted/20",
                  )}
                  key={app.name}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3">
                      <div
                        className={cn(
                          "flex size-11 items-center justify-center rounded-2xl border",
                          presentation.accentClassName,
                        )}
                      >
                        <presentation.Icon className="size-5" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-lg font-semibold text-foreground">{app.name}</p>
                          <span className="rounded-full border border-border/70 bg-background/80 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                            {presentation.category}
                          </span>
                        </div>
                        <p className="font-mono text-xs text-muted-foreground">{app.domain}</p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "inline-flex rounded-full border px-3 py-1 text-xs font-medium",
                        badgeStyles,
                      )}
                    >
                      {getStatusLabel(app.status)}
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">
                    {app.description}
                  </p>
                  <div className="mt-5 grid gap-2 rounded-2xl border border-border/70 bg-background/70 p-4 text-xs">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Pengguna utama</span>
                      <span className="font-medium text-foreground">{presentation.audience}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Akses</span>
                      <span className="text-right font-medium text-foreground">
                        {presentation.accessNote}
                      </span>
                    </div>
                  </div>
                  <div className="mt-6 pt-2">
                    {app.href ? (
                      <a
                        className={cn(
                          buttonVariants({
                            variant: app.name === "Finance" ? "default" : "outline",
                          }),
                          "w-full justify-center",
                        )}
                        href={app.href}
                      >
                        Buka {app.name}
                        <ExternalLink className="ml-2 size-4" />
                      </a>
                    ) : (
                      <div className="rounded-xl border border-dashed border-border/70 bg-background/50 px-4 py-3 text-center text-sm text-muted-foreground">
                        Akan tersedia di {app.domain}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        </div>

        <section className="mt-8 grid gap-4 border-t border-border/70 pt-6 text-sm text-muted-foreground md:grid-cols-2">
          <div className="rounded-2xl border border-border/70 bg-card/70 p-4">
            <p className="font-medium text-foreground">Akses lintas perangkat</p>
            <p className="mt-2 leading-6">
              Portal ini dirancang supaya tautan aplikasi mudah dibuka dari PC,
              laptop, tablet, dan handphone tanpa perlu mengingat banyak URL.
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-card/70 p-4">
            <p className="font-medium text-foreground">Status saat ini</p>
            <p className="mt-2 leading-6">
              {activeApps.length} aplikasi inti sudah aktif dan seluruh akses utama
              Rumah Jengkar kini difokuskan ke Finance dan Jengkar KPI.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
