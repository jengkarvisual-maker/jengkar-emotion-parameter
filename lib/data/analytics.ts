import type { AlignmentFeeling, DominantEmotion, SessionType } from "@/lib/types";

import { average, formatDate, formatDateInput } from "@/lib/utils";

export type LogWithRecommendation = {
  id: string;
  date: Date;
  sessionType: SessionType;
  emotionScore: number;
  energyScore: number;
  stressScore: number;
  clarityScore: number;
  triggerText: string | null;
  note: string | null;
  alignmentFeeling: AlignmentFeeling;
  dominantEmotion: DominantEmotion;
  createdAt: Date;
  updatedAt: Date;
  recommendation?: {
    id: string;
    title: string;
    body: string;
    createdAt: Date;
  } | null;
};

export function buildMemberTimeline(logs: LogWithRecommendation[]) {
  return [...logs]
    .sort(sortLogs)
    .slice(-20)
    .map((log) => ({
      label: `${formatDate(log.date, { month: "short", day: "numeric" })} ${log.sessionType === "MORNING" ? "AM" : "PM"}`,
      emotion: log.emotionScore,
      energy: log.energyScore,
      stress: log.stressScore,
      clarity: log.clarityScore,
      sessionType: log.sessionType,
    }));
}

export function buildMorningNightComparison(
  logs: LogWithRecommendation[],
  days: number,
  anchorDate: Date = new Date(),
) {
  const recentKeys = buildRecentDateKeys(days, anchorDate);
  const keyed = new Map<string, { morning: number | null; night: number | null }>();

  for (const key of recentKeys) {
    keyed.set(key, { morning: null, night: null });
  }

  for (const log of logs) {
    const key = formatDateInput(log.date);

    if (!keyed.has(key)) {
      continue;
    }

    const entry = keyed.get(key)!;

    if (log.sessionType === "MORNING") {
      entry.morning = log.emotionScore;
    } else {
      entry.night = log.emotionScore;
    }
  }

  return recentKeys.map((key) => {
    const entry = keyed.get(key)!;

    return {
      label: formatDate(key, { month: "short", day: "numeric" }),
      morning: entry.morning,
      night: entry.night,
      difference:
        entry.morning !== null && entry.night !== null
          ? Math.abs(entry.night - entry.morning)
          : null,
    };
  });
}

export function buildDailyAverageTrend(
  logs: LogWithRecommendation[],
  days: number,
  anchorDate: Date = new Date(),
) {
  const recentKeys = buildRecentDateKeys(days, anchorDate);
  const grouped = new Map<
    string,
    { emotion: number[]; stress: number[]; clarity: number[]; energy: number[] }
  >();

  for (const key of recentKeys) {
    grouped.set(key, { emotion: [], stress: [], clarity: [], energy: [] });
  }

  for (const log of logs) {
    const key = formatDateInput(log.date);
    const bucket = grouped.get(key);

    if (!bucket) {
      continue;
    }

    bucket.emotion.push(log.emotionScore);
    bucket.stress.push(log.stressScore);
    bucket.clarity.push(log.clarityScore);
    bucket.energy.push(log.energyScore);
  }

  return recentKeys.map((key) => {
    const bucket = grouped.get(key)!;

    return {
      label: formatDate(key, { month: "short", day: "numeric" }),
      emotion: bucket.emotion.length ? average(bucket.emotion) : null,
      stress: bucket.stress.length ? average(bucket.stress) : null,
      clarity: bucket.clarity.length ? average(bucket.clarity) : null,
      energy: bucket.energy.length ? average(bucket.energy) : null,
    };
  });
}

export function calculateConsistency(logs: LogWithRecommendation[]) {
  if (logs.length <= 1) {
    return Number.POSITIVE_INFINITY;
  }

  const sorted = [...logs].sort(sortLogs);
  const deltas = sorted
    .slice(1)
    .map((log, index) => Math.abs(log.emotionScore - sorted[index].emotionScore));

  return average(deltas);
}

export function calculateStabilityIndex(logs: LogWithRecommendation[]) {
  if (logs.length < 3) {
    return null;
  }

  const consistency = calculateConsistency(logs);
  const averageStress = average(logs.map((log) => log.stressScore));
  const averageClarity = average(logs.map((log) => log.clarityScore));
  const alignmentScore = averageAlignment(logs.map((log) => log.alignmentFeeling));

  const raw =
    88 -
    consistency * 18 -
    Math.max(averageStress - 5, 0) * 7 +
    Math.max(averageClarity - 5, 0) * 6 +
    alignmentScore * 8;

  return clamp(Math.round(raw), 0, 100);
}

export function calculateFluctuationScore(logs: LogWithRecommendation[]) {
  if (logs.length <= 1) {
    return null;
  }

  const sorted = [...logs].sort(sortLogs);
  const jumps = sorted
    .slice(1)
    .map((log, index) => Math.abs(log.emotionScore - sorted[index].emotionScore));
  const averageStress = average(sorted.map((log) => log.stressScore));
  const maximumJump = jumps.length ? Math.max(...jumps) : 0;
  const averageJump = average(jumps);

  const raw =
    averageJump * 18 + maximumJump * 7 + Math.max(averageStress - 4.5, 0) * 6;

  return clamp(Math.round(raw), 0, 100);
}

export function collectRecentRecommendations(logs: LogWithRecommendation[], limit = 5) {
  return [...logs]
    .filter((log) => log.recommendation)
    .sort((a, b) => {
      const left = a.recommendation?.createdAt?.getTime() ?? 0;
      const right = b.recommendation?.createdAt?.getTime() ?? 0;
      return right - left;
    })
    .slice(0, limit)
    .map((log) => ({
      id: log.recommendation!.id,
      title: log.recommendation!.title,
      body: log.recommendation!.body,
      createdAt: log.recommendation!.createdAt,
      date: log.date,
      sessionType: log.sessionType,
    }));
}

export function getTodayLogStatus(logs: LogWithRecommendation[]) {
  const todayKey = formatDateInput(new Date());
  const todayLogs = logs.filter((log) => formatDateInput(log.date) === todayKey);

  return {
    todayLogs,
    morning: todayLogs.find((log) => log.sessionType === "MORNING") ?? null,
    night: todayLogs.find((log) => log.sessionType === "NIGHT") ?? null,
  };
}

export function getLatestLog(logs: LogWithRecommendation[]) {
  return [...logs].sort(sortLogs).at(-1) ?? null;
}

export function findPairedDifference(logs: LogWithRecommendation[]) {
  const today = getTodayLogStatus(logs);

  if (!today.morning || !today.night) {
    return null;
  }

  return Math.abs(today.night.emotionScore - today.morning.emotionScore);
}

function buildRecentDateKeys(days: number, anchorDate: Date = new Date()) {
  const keys: string[] = [];
  const anchor = new Date(anchorDate);

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(anchor);
    date.setUTCDate(date.getUTCDate() - offset);
    keys.push(formatDateInput(date));
  }

  return keys;
}

function sortLogs(
  a: Pick<LogWithRecommendation, "date" | "sessionType">,
  b: Pick<LogWithRecommendation, "date" | "sessionType">,
) {
  const dateDelta = a.date.getTime() - b.date.getTime();

  if (dateDelta !== 0) {
    return dateDelta;
  }

  return sessionOrder(a.sessionType) - sessionOrder(b.sessionType);
}

function sessionOrder(value: SessionType) {
  return value === "MORNING" ? 0 : 1;
}

function averageAlignment(values: AlignmentFeeling[]) {
  if (!values.length) {
    return 0;
  }

  const score = values.reduce((sum, value) => {
    if (value === "ALIGNED") {
      return sum + 1;
    }

    if (value === "NOT_ALIGNED") {
      return sum - 1;
    }

    return sum;
  }, 0);

  return score / values.length;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
