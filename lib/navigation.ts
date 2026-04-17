import type { Role } from "@/lib/types";

export type NavigationItem = {
  href: string;
  label: string;
  description: string;
  roles: Role[];
};

const items: NavigationItem[] = [
  {
    href: "/dashboard",
    label: "Dasbor",
    description: "Tren, analitik, dan aktivitas terbaru",
    roles: ["OWNER", "MEMBER"],
  },
  {
    href: "/me",
    label: "Profil Saya",
    description: "Akun, ringkasan Human Design, dan riwayat Anda",
    roles: ["OWNER", "MEMBER"],
  },
  {
    href: "/logs",
    label: "Log",
    description: "Check-in harian dan riwayat rekomendasi",
    roles: ["OWNER", "MEMBER"],
  },
  {
    href: "/members",
    label: "Anggota",
    description: "Kelola anggota tim dan profil mereka",
    roles: ["OWNER"],
  },
  {
    href: "/settings",
    label: "Pengaturan",
    description: "Kata sandi dan preferensi akun",
    roles: ["OWNER", "MEMBER"],
  },
];

export function getNavigation(role: Role) {
  return items.filter((item) => item.roles.includes(role));
}
