"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, BarChart3, LayoutDashboard, Settings, Sparkles, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { APP_NAME, INTERNAL_APP_LINKS } from "@/lib/constants";
import { cn, getInitials } from "@/lib/utils";
import { getNavigation } from "@/lib/navigation";
import type { Role } from "@/lib/types";

const iconMap = {
  "/dashboard": LayoutDashboard,
  "/me": Sparkles,
  "/logs": BarChart3,
  "/members": Users,
  "/settings": Settings,
};

type SidebarProps = {
  role: Role;
  email: string;
  name: string;
};

export function Sidebar({ role, email, name }: SidebarProps) {
  const pathname = usePathname();
  const navigation = getNavigation(role);

  return (
    <>
      <aside className="hidden w-80 shrink-0 lg:block">
        <div className="sticky top-0 flex min-h-screen flex-col gap-6 border-r border-border/60 bg-background/55 px-6 py-8 backdrop-blur-xl">
          <div className="space-y-4">
            <div className="inline-flex w-fit rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              V1 Internal
            </div>
            <div className="space-y-2">
              <p className="font-serif text-3xl leading-tight">{APP_NAME}</p>
              <p className="text-sm leading-6 text-muted-foreground">
                Ruang kerja reflektif untuk melacak pola emosi dan membandingkannya dengan ringkasan Human Design setiap orang.
              </p>
            </div>
          </div>

          <div className="rounded-[26px] border border-border/70 bg-card/90 p-5 shadow-glow">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 font-semibold text-primary">
                {getInitials(name)}
              </div>
              <div className="space-y-1">
                <p className="font-medium">{name}</p>
                <p className="text-xs text-muted-foreground">{email}</p>
              </div>
            </div>
            <Badge className="mt-4 w-fit" variant={role === "OWNER" ? "success" : "outline"}>
              {role === "OWNER" ? "Akses pemilik" : "Akses anggota"}
            </Badge>
          </div>

          <nav className="space-y-2">
            {navigation.map((item) => {
              const Icon =
                iconMap[item.href as keyof typeof iconMap] ?? LayoutDashboard;
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex rounded-2xl border border-transparent px-4 py-3 transition-all",
                    active
                      ? "border-primary/20 bg-primary/10 text-primary shadow-sm"
                      : "hover:border-border/80 hover:bg-card/90",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "rounded-xl p-2",
                        active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
                      )}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium">{item.label}</p>
                      <p className="text-xs leading-5 text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="rounded-[24px] border border-border/70 bg-card/90 p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">Aplikasi Jengkar</p>
              <Badge variant="outline">Lintas app</Badge>
            </div>
            <div className="mt-4 space-y-3">
              {INTERNAL_APP_LINKS.map((app) => {
                const statusVariant =
                  app.status === "active"
                    ? "success"
                    : app.status === "setup"
                      ? "warn"
                      : "outline";

                return app.href ? (
                  <a
                    key={app.name}
                    href={app.href}
                    className="block rounded-2xl border border-border/70 bg-background/75 px-4 py-3 transition hover:border-primary/25 hover:bg-primary/5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="font-medium">{app.name}</p>
                        <p className="text-xs text-muted-foreground">{app.domain}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={statusVariant}>{getStatusLabel(app.status)}</Badge>
                        <ArrowUpRight className="mt-0.5 size-4 text-muted-foreground" />
                      </div>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      {app.description}
                    </p>
                  </a>
                ) : (
                  <div
                    key={app.name}
                    className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="font-medium">{app.name}</p>
                        <p className="text-xs text-muted-foreground">{app.domain}</p>
                      </div>
                      <Badge variant={statusVariant}>{getStatusLabel(app.status)}</Badge>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      {app.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-auto rounded-[24px] border border-border/70 bg-card/90 p-5">
            <p className="text-sm font-medium">Catatan penting</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Aplikasi ini mendukung kesadaran diri dan refleksi tim. Aplikasi ini tidak ditujukan untuk diagnosis, perawatan, atau interpretasi medis.
            </p>
          </div>
        </div>
      </aside>

      <div className="border-b border-border/60 bg-background/80 px-4 py-4 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-7xl flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-serif text-2xl">{APP_NAME}</p>
              <p className="text-sm text-muted-foreground">{name}</p>
            </div>
            <Badge variant={role === "OWNER" ? "success" : "outline"}>
              {role === "OWNER" ? "Pemilik" : "Anggota"}
            </Badge>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {navigation.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition",
                    active
                      ? "border-primary/20 bg-primary/10 text-primary"
                      : "border-border bg-card/90 text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {INTERNAL_APP_LINKS.map((app) =>
              app.href ? (
                <a
                  key={app.name}
                  href={app.href}
                  className="whitespace-nowrap rounded-full border border-border bg-card/90 px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary/25 hover:bg-primary/5"
                >
                  {app.name}
                </a>
              ) : (
                <span
                  key={app.name}
                  className="whitespace-nowrap rounded-full border border-dashed border-border px-4 py-2 text-sm font-medium text-muted-foreground"
                >
                  {app.name} - segera
                </span>
              ),
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function getStatusLabel(status: "active" | "setup" | "planned") {
  switch (status) {
    case "active":
      return "Aktif";
    case "setup":
      return "Disiapkan";
    case "planned":
      return "Direncanakan";
  }
}
