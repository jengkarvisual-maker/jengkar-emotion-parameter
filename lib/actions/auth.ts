"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  authenticateUser,
  clearSession,
  createSession,
  getCurrentUserRecord,
  hashPassword,
  requireSession,
  verifyPassword,
} from "@/lib/auth";
import {
  errorState,
  successState,
  type ActionState,
  zodErrorState,
} from "@/lib/action-state";
import { prisma } from "@/lib/prisma";
import { loginSchema, passwordChangeSchema } from "@/lib/validations/auth";

export async function loginAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return zodErrorState(parsed.error);
  }

  const user = await authenticateUser(parsed.data.email, parsed.data.password);

  if (!user) {
    return errorState("Kami tidak bisa masuk dengan kredensial tersebut.");
  }

  await createSession(user);
  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}

export async function changePasswordAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSession();
  const parsed = passwordChangeSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return zodErrorState(parsed.error);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) {
    return errorState("Akun Anda tidak dapat ditemukan. Silakan masuk kembali.");
  }

  const passwordMatches = await verifyPassword(
    parsed.data.currentPassword,
    user.passwordHash,
  );

  if (!passwordMatches) {
    return errorState("Kata sandi saat ini tidak cocok dengan data kami.", {
      currentPassword: ["Kata sandi saat ini salah."],
    });
  }

  if (parsed.data.currentPassword === parsed.data.newPassword) {
    return errorState("Pilih kata sandi baru yang berbeda dari kata sandi saat ini.", {
      newPassword: ["Silakan pilih kata sandi yang berbeda."],
    });
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: {
      passwordHash: await hashPassword(parsed.data.newPassword),
    },
  });

  revalidatePath("/settings");
  revalidatePath("/me");

  return successState("Kata sandi berhasil diperbarui.");
}

export async function getAuthenticatedUser() {
  const user = await getCurrentUserRecord();

  if (!user) {
    redirect("/login");
  }

  return user;
}
