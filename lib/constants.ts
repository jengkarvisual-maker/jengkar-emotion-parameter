import type { AlignmentFeeling, DominantEmotion, Role, SessionType } from "@/lib/types";

export const APP_NAME = "JEPAT";
export const APP_DOMAIN = "https://jepat.rumahjengkar.com";
export const APP_PORTAL_DOMAIN = "https://rumahjengkar.com";

export const DEMO_OWNER = {
  email: "owner@emotiontracker.local",
  password: "Owner123!",
};

export const DEMO_MEMBER_PASSWORD = "Member123!";

export const sessionTypeOptions: Array<{ label: string; value: SessionType }> = [
  { label: "Pagi", value: "MORNING" },
  { label: "Malam", value: "NIGHT" },
];

export const dominantEmotionOptions: Array<{
  label: string;
  value: DominantEmotion;
}> = [
  { label: "Tenang", value: "CALM" },
  { label: "Cemas", value: "ANXIOUS" },
  { label: "Marah", value: "ANGRY" },
  { label: "Sedih", value: "SAD" },
  { label: "Bersemangat", value: "EXCITED" },
  { label: "Lelah", value: "TIRED" },
  { label: "Kosong", value: "EMPTY" },
  { label: "Bersyukur", value: "GRATEFUL" },
  { label: "Tertekan", value: "PRESSURED" },
  { label: "Stabil", value: "STABLE" },
];

export const alignmentFeelingOptions: Array<{
  label: string;
  value: AlignmentFeeling;
}> = [
  { label: "Selaras", value: "ALIGNED" },
  { label: "Netral", value: "NEUTRAL" },
  { label: "Tidak selaras", value: "NOT_ALIGNED" },
];

export const roleLabels: Record<Role, string> = {
  OWNER: "Pemilik",
  MEMBER: "Anggota",
};

export const sessionTypeLabels: Record<SessionType, string> = {
  MORNING: "Pagi",
  NIGHT: "Malam",
};

export const dominantEmotionLabels: Record<DominantEmotion, string> = {
  CALM: "Tenang",
  ANXIOUS: "Cemas",
  ANGRY: "Marah",
  SAD: "Sedih",
  EXCITED: "Bersemangat",
  TIRED: "Lelah",
  EMPTY: "Kosong",
  GRATEFUL: "Bersyukur",
  PRESSURED: "Tertekan",
  STABLE: "Stabil",
};

export const alignmentFeelingLabels: Record<AlignmentFeeling, string> = {
  ALIGNED: "Selaras",
  NEUTRAL: "Netral",
  NOT_ALIGNED: "Tidak selaras",
};

export type InternalAppLink = {
  name: string;
  href: string | null;
  domain: string;
  description: string;
  status: "active" | "setup" | "planned";
};

export const INTERNAL_APP_LINKS: InternalAppLink[] = [
  {
    name: "JEPAT",
    href: APP_DOMAIN,
    domain: "jepat.rumahjengkar.com",
    description: "Pelacakan emosi, Human Design, dan rekomendasi reflektif tim.",
    status: "active",
  },
  {
    name: "Finance",
    href: "https://finance.rumahjengkar.com",
    domain: "finance.rumahjengkar.com",
    description: "Aplikasi keuangan tim dengan domain khusus untuk transaksi, laporan, dan arus kas.",
    status: "active",
  },
  {
    name: "Jengkar KPI",
    href: "https://jengkar-ops.vercel.app",
    domain: "ops.rumahjengkar.com",
    description:
      "Fondasi aplikasi operasional untuk SOP, KPI, bonus tahunan, dan review tim. Domain custom sedang menunggu aktivasi DNS.",
    status: "setup",
  },
];
