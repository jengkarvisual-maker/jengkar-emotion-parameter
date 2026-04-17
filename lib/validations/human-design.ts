import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Maksimal ${max} karakter untuk field ini.`)
    .optional()
    .transform((value) => (value?.length ? value : undefined));

export const humanDesignSchema = z.object({
  teamMemberId: z.string().min(1, "Anggota tim wajib dipilih."),
  type: optionalText(80),
  authority: optionalText(80),
  profile: optionalText(80),
  signature: optionalText(120),
  notSelfTheme: optionalText(120),
  emotionalNotes: optionalText(1000),
  decisionStyle: optionalText(1000),
  triggerNotes: optionalText(1000),
  ownerSummaryText: optionalText(1200),
});
