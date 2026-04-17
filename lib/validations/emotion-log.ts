import { z } from "zod";

const scoreSchema = z.coerce
  .number()
  .int("Skor harus berupa angka bulat.")
  .min(1, "Skor harus berada antara 1 dan 10.")
  .max(10, "Skor harus berada antara 1 dan 10.");

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Maksimal ${max} karakter untuk field ini.`)
    .optional()
    .transform((value) => (value?.length ? value : undefined));

export const emotionLogSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Silakan pilih tanggal yang valid."),
  sessionType: z.enum(["MORNING", "NIGHT"]),
  emotionScore: scoreSchema,
  energyScore: scoreSchema,
  stressScore: scoreSchema,
  clarityScore: scoreSchema,
  dominantEmotion: z.enum([
    "CALM",
    "ANXIOUS",
    "ANGRY",
    "SAD",
    "EXCITED",
    "TIRED",
    "EMPTY",
    "GRATEFUL",
    "PRESSURED",
    "STABLE",
  ]),
  triggerText: optionalText(500),
  note: optionalText(1000),
  alignmentFeeling: z.enum(["ALIGNED", "NEUTRAL", "NOT_ALIGNED"]),
});
