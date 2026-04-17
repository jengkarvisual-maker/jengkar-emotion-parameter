import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Silakan masukkan alamat email yang valid."),
  password: z.string().min(8, "Kata sandi minimal 8 karakter."),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(8, "Kata sandi saat ini wajib diisi."),
    newPassword: z
      .string()
      .min(8, "Kata sandi baru minimal 8 karakter.")
      .max(72, "Kata sandi baru maksimal 72 karakter."),
    confirmPassword: z.string().min(8, "Silakan konfirmasi kata sandi baru."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Kata sandi baru dan konfirmasinya harus sama.",
  });
