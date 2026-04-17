import { z } from "zod";

export const memberSchema = z
  .object({
    id: z.string().optional(),
    fullName: z.string().trim().min(2, "Nama lengkap wajib diisi."),
    email: z.string().trim().email("Silakan masukkan email yang valid."),
    divisionOrRole: z.string().trim().min(2, "Divisi atau peran wajib diisi."),
    activeStatus: z.enum(["true", "false"]).default("true"),
    initialPassword: z.string().optional(),
  })
  .superRefine((data, context) => {
    const password = data.initialPassword?.trim();

    if (!data.id && (!password || password.length < 8)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["initialPassword"],
        message: "Masukkan kata sandi awal minimal 8 karakter.",
      });
    }

    if (password && password.length < 8) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["initialPassword"],
        message: "Kata sandi minimal 8 karakter.",
      });
    }
  });
