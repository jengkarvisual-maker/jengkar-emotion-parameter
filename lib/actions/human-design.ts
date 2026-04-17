"use server";

import { revalidatePath } from "next/cache";

import {
  errorState,
  successState,
  type ActionState,
  zodErrorState,
} from "@/lib/action-state";
import { requireOwnerSession } from "@/lib/auth";
import { deleteUploadedFile, saveUploadedFile } from "@/lib/file-storage";
import { prisma } from "@/lib/prisma";
import { humanDesignSchema } from "@/lib/validations/human-design";

export async function saveHumanDesignAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireOwnerSession();

  const parsed = humanDesignSchema.safeParse({
    teamMemberId: formData.get("teamMemberId"),
    type: formData.get("type") || undefined,
    authority: formData.get("authority") || undefined,
    profile: formData.get("profile") || undefined,
    signature: formData.get("signature") || undefined,
    notSelfTheme: formData.get("notSelfTheme") || undefined,
    emotionalNotes: formData.get("emotionalNotes") || undefined,
    decisionStyle: formData.get("decisionStyle") || undefined,
    triggerNotes: formData.get("triggerNotes") || undefined,
    ownerSummaryText: formData.get("ownerSummaryText") || undefined,
  });

  if (!parsed.success) {
    return zodErrorState(parsed.error);
  }

  const existingProfile = await prisma.humanDesignProfile.findUnique({
    where: { teamMemberId: parsed.data.teamMemberId },
  });

  let nextFileUrl = existingProfile?.ravechartFileUrl ?? null;
  const uploaded = formData.get("ravechartFile");
  const removeCurrentFile = formData.get("removeCurrentFile") === "true";

  try {
    if (uploaded instanceof File && uploaded.size > 0) {
      nextFileUrl = await saveUploadedFile(uploaded);
    } else if (removeCurrentFile) {
      nextFileUrl = null;
    }

    await prisma.humanDesignProfile.upsert({
      where: {
        teamMemberId: parsed.data.teamMemberId,
      },
      update: {
        ...parsed.data,
        ravechartFileUrl: nextFileUrl,
      },
      create: {
        ...parsed.data,
        ravechartFileUrl: nextFileUrl,
      },
    });

    if (
      uploaded instanceof File &&
      uploaded.size > 0 &&
      existingProfile?.ravechartFileUrl &&
      existingProfile.ravechartFileUrl !== nextFileUrl
    ) {
      await deleteUploadedFile(existingProfile.ravechartFileUrl);
    }

    if (removeCurrentFile && existingProfile?.ravechartFileUrl && !uploaded) {
      await deleteUploadedFile(existingProfile.ravechartFileUrl);
    }

    revalidatePath("/dashboard");
    revalidatePath(`/members/${parsed.data.teamMemberId}`);
    revalidatePath(`/members/${parsed.data.teamMemberId}/human-design`);
    revalidatePath("/me");

    return successState("Profil Human Design berhasil disimpan.");
  } catch (error) {
    return errorState(
      error instanceof Error
        ? error.message
        : "Kami tidak dapat menyimpan profil Human Design saat ini.",
    );
  }
}
