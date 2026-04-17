"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";

import {
  errorState,
  successState,
  type ActionState,
  zodErrorState,
} from "@/lib/action-state";
import { hashPassword, requireOwnerSession } from "@/lib/auth";
import { deleteUploadedFile } from "@/lib/file-storage";
import { prisma } from "@/lib/prisma";
import { memberSchema } from "@/lib/validations/member";

export async function saveMemberAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireOwnerSession();

  const parsed = memberSchema.safeParse({
    id: formData.get("id") || undefined,
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    divisionOrRole: formData.get("divisionOrRole"),
    activeStatus: formData.get("activeStatus") ?? "true",
    initialPassword: formData.get("initialPassword") || undefined,
  });

  if (!parsed.success) {
    return zodErrorState(parsed.error);
  }

  const data = parsed.data;
  const normalizedEmail = data.email.toLowerCase();
  const activeStatus = data.activeStatus === "true";

  try {
    if (data.id) {
      const existing = await prisma.teamMember.findUnique({
        where: { id: data.id },
        include: {
          user: true,
        },
      });

      if (!existing) {
        return errorState("Anggota tim tersebut tidak dapat ditemukan.");
      }

      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.teamMember.update({
          where: { id: data.id },
          data: {
            fullName: data.fullName,
            email: normalizedEmail,
            divisionOrRole: data.divisionOrRole,
            activeStatus,
          },
        });

        const nextPasswordHash = data.initialPassword?.trim()
          ? await hashPassword(data.initialPassword.trim())
          : existing.user?.passwordHash;

        if (existing.user) {
          await tx.user.update({
            where: { id: existing.user.id },
            data: {
              email: normalizedEmail,
              activeStatus,
              passwordHash: nextPasswordHash,
            },
          });
        } else {
          await tx.user.create({
            data: {
              email: normalizedEmail,
              passwordHash: await hashPassword(data.initialPassword?.trim() || "Member123!"),
              role: "MEMBER",
              activeStatus,
              teamMemberId: data.id,
            },
          });
        }
      });

      revalidateMemberPaths(data.id);
      return successState("Profil anggota berhasil diperbarui.");
    }

    const passwordHash = await hashPassword(data.initialPassword!.trim());

    const member = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const createdMember = await tx.teamMember.create({
        data: {
          fullName: data.fullName,
          email: normalizedEmail,
          divisionOrRole: data.divisionOrRole,
          activeStatus,
        },
      });

      await tx.humanDesignProfile.create({
        data: {
          teamMemberId: createdMember.id,
        },
      });

      await tx.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          role: "MEMBER",
          activeStatus,
          teamMemberId: createdMember.id,
        },
      });

      return createdMember;
    });

    revalidateMemberPaths(member.id);

    return successState("Anggota baru berhasil dibuat.");
  } catch (error) {
    return errorState(resolveMutationError(error));
  }
}

export async function deleteMemberAction(formData: FormData) {
  await requireOwnerSession();

  const memberId = String(formData.get("memberId") || "");

  if (!memberId) {
    redirect("/members");
  }

  const member = await prisma.teamMember.findUnique({
    where: { id: memberId },
    include: {
      humanDesignProfile: true,
      user: true,
    },
  });

  if (!member) {
    redirect("/members");
  }

  await deleteUploadedFile(member.humanDesignProfile?.ravechartFileUrl);

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.user.deleteMany({
      where: {
        teamMemberId: memberId,
      },
    });

    await tx.teamMember.delete({
      where: {
        id: memberId,
      },
    });
  });

  revalidatePath("/dashboard");
  revalidatePath("/members");
  revalidatePath("/logs");
  redirect("/members");
}

function revalidateMemberPaths(memberId: string) {
  revalidatePath("/dashboard");
  revalidatePath("/members");
  revalidatePath(`/members/${memberId}`);
  revalidatePath(`/members/${memberId}/human-design`);
  revalidatePath("/logs");
}

function resolveMutationError(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  ) {
    return "Email tersebut sudah digunakan oleh akun lain.";
  }

  return "Kami tidak dapat menyimpan anggota itu saat ini. Silakan coba lagi.";
}
