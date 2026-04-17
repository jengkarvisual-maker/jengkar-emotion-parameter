"use server";

import { revalidatePath } from "next/cache";

import {
  errorState,
  successState,
  type ActionState,
  zodErrorState,
} from "@/lib/action-state";
import { requireMemberSession } from "@/lib/auth";
import { parseDateInput } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { emotionLogSchema } from "@/lib/validations/emotion-log";
import { generateRecommendation } from "@/lib/recommendation-engine";

export async function saveEmotionLogAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireMemberSession();

  const parsed = emotionLogSchema.safeParse({
    date: formData.get("date"),
    sessionType: formData.get("sessionType"),
    emotionScore: formData.get("emotionScore"),
    energyScore: formData.get("energyScore"),
    stressScore: formData.get("stressScore"),
    clarityScore: formData.get("clarityScore"),
    dominantEmotion: formData.get("dominantEmotion"),
    triggerText: formData.get("triggerText") || undefined,
    note: formData.get("note") || undefined,
    alignmentFeeling: formData.get("alignmentFeeling"),
  });

  if (!parsed.success) {
    return zodErrorState(parsed.error);
  }

  const selectedDate = parseDateInput(parsed.data.date);
  const today = new Date();
  const todayOnly = new Date(`${today.toISOString().slice(0, 10)}T00:00:00.000Z`);

  if (selectedDate.getTime() > todayOnly.getTime()) {
    return errorState("Silakan pilih hari ini atau tanggal sebelumnya.");
  }

  const oppositeSession = parsed.data.sessionType === "MORNING" ? "NIGHT" : "MORNING";
  const recommendationWindowStart = new Date(selectedDate);
  recommendationWindowStart.setUTCDate(recommendationWindowStart.getUTCDate() - 6);

  const log = await prisma.emotionLog.upsert({
    where: {
      teamMemberId_date_sessionType: {
        teamMemberId: session.teamMemberId,
        date: selectedDate,
        sessionType: parsed.data.sessionType,
      },
    },
    update: {
      emotionScore: parsed.data.emotionScore,
      energyScore: parsed.data.energyScore,
      stressScore: parsed.data.stressScore,
      clarityScore: parsed.data.clarityScore,
      dominantEmotion: parsed.data.dominantEmotion,
      triggerText: parsed.data.triggerText,
      note: parsed.data.note,
      alignmentFeeling: parsed.data.alignmentFeeling,
    },
    create: {
      teamMemberId: session.teamMemberId,
      date: selectedDate,
      sessionType: parsed.data.sessionType,
      emotionScore: parsed.data.emotionScore,
      energyScore: parsed.data.energyScore,
      stressScore: parsed.data.stressScore,
      clarityScore: parsed.data.clarityScore,
      dominantEmotion: parsed.data.dominantEmotion,
      triggerText: parsed.data.triggerText,
      note: parsed.data.note,
      alignmentFeeling: parsed.data.alignmentFeeling,
    },
  });

  const [pairedLog, recentLogs, profile] = await Promise.all([
    prisma.emotionLog.findFirst({
      where: {
        teamMemberId: session.teamMemberId,
        date: selectedDate,
        sessionType: oppositeSession,
      },
      select: {
        emotionScore: true,
        stressScore: true,
        clarityScore: true,
      },
    }),
    prisma.emotionLog.findMany({
      where: {
        teamMemberId: session.teamMemberId,
        date: {
          gte: recommendationWindowStart,
          lte: selectedDate,
        },
      },
      orderBy: [{ date: "asc" }, { sessionType: "asc" }],
      select: {
        emotionScore: true,
        energyScore: true,
        stressScore: true,
        clarityScore: true,
        alignmentFeeling: true,
        dominantEmotion: true,
        triggerText: true,
      },
    }),
    prisma.humanDesignProfile.findUnique({
      where: {
        teamMemberId: session.teamMemberId,
      },
      select: {
        authority: true,
        decisionStyle: true,
        triggerNotes: true,
        emotionalNotes: true,
        type: true,
      },
    }),
  ]);

  const recommendation = generateRecommendation({
    currentLog: {
      emotionScore: log.emotionScore,
      energyScore: log.energyScore,
      stressScore: log.stressScore,
      clarityScore: log.clarityScore,
      alignmentFeeling: log.alignmentFeeling,
      dominantEmotion: log.dominantEmotion,
      triggerText: log.triggerText,
    },
    recentLogs,
    pairedLog,
    profile,
  });

  await prisma.recommendation.upsert({
    where: {
      emotionLogId: log.id,
    },
    update: {
      title: recommendation.title,
      body: recommendation.body,
    },
    create: {
      teamMemberId: session.teamMemberId,
      emotionLogId: log.id,
      title: recommendation.title,
      body: recommendation.body,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/logs");
  revalidatePath("/me");
  revalidatePath(`/members/${session.teamMemberId}`);

  return successState(
    `Log ${parsed.data.sessionType === "MORNING" ? "pagi" : "malam"} berhasil disimpan.`,
  );
}
