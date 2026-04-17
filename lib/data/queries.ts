import { prisma } from "@/lib/prisma";
import { average, formatDateInput, parseDateInput } from "@/lib/utils";
import type { AlignmentFeeling, DominantEmotion, SessionType } from "@/lib/types";
import {
  buildDailyAverageTrend,
  buildMemberTimeline,
  buildMorningNightComparison,
  calculateFluctuationScore,
  calculateStabilityIndex,
  collectRecentRecommendations,
  findPairedDifference,
  getLatestLog,
  getTodayLogStatus,
  type LogWithRecommendation,
} from "@/lib/data/analytics";

export type LogPageEntry = {
  id: string;
  teamMemberId: string;
  date: Date;
  sessionType: SessionType;
  emotionScore: number;
  energyScore: number;
  stressScore: number;
  clarityScore: number;
  alignmentFeeling: AlignmentFeeling;
  dominantEmotion: DominantEmotion;
  triggerText: string | null;
  note: string | null;
  teamMember: {
    id: string;
    fullName: string;
    divisionOrRole: string;
  };
  recommendation: {
    id: string;
    title: string;
    body: string;
  } | null;
};

export type LogFilterMember = {
  id: string;
  fullName: string;
};

type HumanDesignProfileSnapshot = {
  type: string | null;
  authority: string | null;
  profile: string | null;
  signature: string | null;
  notSelfTheme: string | null;
  emotionalNotes: string | null;
  decisionStyle: string | null;
  triggerNotes: string | null;
  ravechartFileUrl: string | null;
  ownerSummaryText: string | null;
};

type DashboardMember = {
  id: string;
  fullName: string;
  email: string;
  divisionOrRole: string;
  activeStatus: boolean;
  humanDesignProfile: HumanDesignProfileSnapshot | null;
  emotionLogs: LogWithRecommendation[];
};

type MembersPageRecord = DashboardMember & {
  user: {
    id: string;
    email: string;
  } | null;
};

function getDaysAgo(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

function getRecentWindow(days: number) {
  return {
    gte: getDaysAgo(days - 1),
  };
}

function startOfUtcDay(value: Date = new Date()) {
  const date = new Date(value);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

function getInclusiveDateWindow(start: Date, end: Date) {
  return {
    gte: start,
    lte: end,
  };
}

function tryParseDateInput(value?: string) {
  if (!value) {
    return null;
  }

  const parsed = parseDateInput(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

export function resolveDateRange(
  startDate?: string,
  endDate?: string,
  fallbackDays = 30,
) {
  const today = startOfUtcDay();
  let end = tryParseDateInput(endDate) ?? today;

  if (end > today) {
    end = today;
  }

  let start = tryParseDateInput(startDate);

  if (!start) {
    start = new Date(end);
    start.setUTCDate(start.getUTCDate() - (fallbackDays - 1));
  }

  if (start > end) {
    [start, end] = [end, start];
  }

  const days =
    Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  return {
    start,
    end,
    startInput: formatDateInput(start),
    endInput: formatDateInput(end),
    days: Math.max(days, 1),
  };
}

export async function getOwnerDashboardData(
  selectedMemberId?: string,
  filters?: {
    startDate?: string;
    endDate?: string;
  },
) {
  const dateRange = resolveDateRange(filters?.startDate, filters?.endDate, 30);
  const today = startOfUtcDay();

  const [members, todayLogs, recentWeekLogs]: [
    DashboardMember[],
    Array<{
      teamMemberId: string;
      sessionType: SessionType;
      emotionScore: number;
      stressScore: number;
      teamMember: {
        id: string;
        fullName: string;
        divisionOrRole: string;
        activeStatus: boolean;
      };
    }>,
    Array<LogWithRecommendation & { teamMemberId: string }>,
  ] = await Promise.all([
    prisma.teamMember.findMany({
      orderBy: { fullName: "asc" },
      include: {
        humanDesignProfile: true,
        emotionLogs: {
          where: {
            date: getInclusiveDateWindow(dateRange.start, dateRange.end),
          },
          orderBy: [{ date: "asc" }, { sessionType: "asc" }],
          include: {
            recommendation: true,
          },
        },
      },
    }),
    prisma.emotionLog.findMany({
      where: {
        date: today,
      },
      select: {
        teamMemberId: true,
        sessionType: true,
        emotionScore: true,
        stressScore: true,
        teamMember: {
          select: {
            id: true,
            fullName: true,
            divisionOrRole: true,
            activeStatus: true,
          },
        },
      },
    }),
    prisma.emotionLog.findMany({
      where: {
        date: getRecentWindow(7),
      },
      orderBy: [{ date: "asc" }, { sessionType: "asc" }],
      select: {
        teamMemberId: true,
        id: true,
        date: true,
        sessionType: true,
        emotionScore: true,
        energyScore: true,
        stressScore: true,
        clarityScore: true,
        triggerText: true,
        note: true,
        alignmentFeeling: true,
        dominantEmotion: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  const selectedMember =
    members.find((member) => member.id === selectedMemberId) ?? members[0] ?? null;
  const activeMembers = members.filter((member) => member.activeStatus);
  const todayLogsByMember = new Map<
    string,
    {
      morning: number | null;
      night: number | null;
      teamMember: {
        id: string;
        fullName: string;
        divisionOrRole: string;
        activeStatus: boolean;
      };
    }
  >();

  for (const log of todayLogs) {
    if (!log.teamMember.activeStatus) {
      continue;
    }

    const existing =
      todayLogsByMember.get(log.teamMemberId) ??
      {
        morning: null,
        night: null,
        teamMember: log.teamMember,
      };

    if (log.sessionType === "MORNING") {
      existing.morning = log.emotionScore;
    } else {
      existing.night = log.emotionScore;
    }

    todayLogsByMember.set(log.teamMemberId, existing);
  }

  const morningFilledToday = activeMembers.filter((member) =>
    todayLogsByMember.get(member.id)?.morning != null,
  );
  const nightFilledToday = activeMembers.filter((member) =>
    todayLogsByMember.get(member.id)?.night != null,
  );
  const notFilledToday = activeMembers.filter(
    (member) => !todayLogsByMember.has(member.id),
  );
  const activeTodayLogs = todayLogs.filter((log) => log.teamMember.activeStatus);
  const recentWeekLogsByMember = new Map<string, LogWithRecommendation[]>();

  for (const member of activeMembers) {
    recentWeekLogsByMember.set(member.id, []);
  }

  for (const log of recentWeekLogs) {
    const existing = recentWeekLogsByMember.get(log.teamMemberId);

    if (!existing) {
      continue;
    }

    existing.push(log);
  }

  const fluctuationCandidates = activeMembers
    .map((member) => {
      const todayStatus = todayLogsByMember.get(member.id);

      if (!todayStatus || todayStatus.morning === null || todayStatus.night === null) {
        return null;
      }

      return {
        id: member.id,
        fullName: member.fullName,
        difference: Math.abs(todayStatus.night - todayStatus.morning),
      };
    })
    .filter((value): value is NonNullable<typeof value> => Boolean(value))
    .sort((left, right) => right.difference - left.difference);

  const mostStableMember = activeMembers
    .map((member) => {
      const recent = recentWeekLogsByMember.get(member.id) ?? [];
      const stabilityIndex = calculateStabilityIndex(recent);

      if (stabilityIndex === null) {
        return null;
      }

      return {
        id: member.id,
        fullName: member.fullName,
        score: stabilityIndex,
      };
    })
    .filter((value): value is NonNullable<typeof value> => Boolean(value))
    .sort((left, right) => right.score - left.score)[0] ?? null;

  const teamTrend = buildDailyAverageTrend(
    members.flatMap((member) => member.emotionLogs),
    dateRange.days,
    dateRange.end,
  );

  return {
    dateRange,
    activeMembers: members.filter((member) => member.activeStatus).length,
    members: members.map((member) => {
      const latestLog = getLatestLog(member.emotionLogs);
      const emotionValues = member.emotionLogs.map((log) => log.emotionScore);
      const stressValues = member.emotionLogs.map((log) => log.stressScore);
      const todayStatus = todayLogsByMember.get(member.id);

      return {
        id: member.id,
        fullName: member.fullName,
        email: member.email,
        divisionOrRole: member.divisionOrRole,
        activeStatus: member.activeStatus,
        humanDesignType: member.humanDesignProfile?.type ?? null,
        latestLogAt: latestLog?.createdAt ?? null,
        todayMorning: todayStatus?.morning != null,
        todayNight: todayStatus?.night != null,
        logsInRange: member.emotionLogs.length,
        averageEmotionInRange: emotionValues.length ? average(emotionValues) : null,
        averageStressInRange: stressValues.length ? average(stressValues) : null,
        stabilityIndex: calculateStabilityIndex(member.emotionLogs),
        fluctuationScore: calculateFluctuationScore(member.emotionLogs),
      };
    }),
    morningFilledToday: morningFilledToday.map((member) => ({
      id: member.id,
      fullName: member.fullName,
      divisionOrRole: member.divisionOrRole,
    })),
    nightFilledToday: nightFilledToday.map((member) => ({
      id: member.id,
      fullName: member.fullName,
      divisionOrRole: member.divisionOrRole,
    })),
    notFilledToday: notFilledToday.map((member) => ({
      id: member.id,
      fullName: member.fullName,
      divisionOrRole: member.divisionOrRole,
    })),
    highestFluctuationToday: fluctuationCandidates[0] ?? null,
    mostStableMember,
    averageEmotionToday: activeTodayLogs.length
      ? average(activeTodayLogs.map((log) => log.emotionScore))
      : null,
    averageStressToday: activeTodayLogs.length
      ? average(activeTodayLogs.map((log) => log.stressScore))
      : null,
    teamTrend,
    selectedMember: selectedMember
      ? {
          id: selectedMember.id,
          fullName: selectedMember.fullName,
          divisionOrRole: selectedMember.divisionOrRole,
          email: selectedMember.email,
          humanDesignProfile: selectedMember.humanDesignProfile,
          logsInRange: selectedMember.emotionLogs.length,
          stabilityIndex: calculateStabilityIndex(selectedMember.emotionLogs),
          fluctuationScore: calculateFluctuationScore(selectedMember.emotionLogs),
          timeline: buildMemberTimeline(selectedMember.emotionLogs),
          trendRange: buildDailyAverageTrend(
            selectedMember.emotionLogs,
            dateRange.days,
            dateRange.end,
          ),
          trend7: buildDailyAverageTrend(selectedMember.emotionLogs, 7),
          morningNight: buildMorningNightComparison(
            selectedMember.emotionLogs,
            Math.min(dateRange.days, 14),
            dateRange.end,
          ),
          recentRecommendations: collectRecentRecommendations(selectedMember.emotionLogs),
        }
      : null,
  };
}

export async function getMemberDashboardData(teamMemberId: string) {
  const member = await prisma.teamMember.findUnique({
    where: { id: teamMemberId },
    include: {
      humanDesignProfile: true,
      emotionLogs: {
        where: {
          date: getRecentWindow(30),
        },
        orderBy: [{ date: "asc" }, { sessionType: "asc" }],
        include: {
          recommendation: true,
        },
      },
    },
  });

  if (!member) {
    return null;
  }

  const todayStatus = getTodayLogStatus(member.emotionLogs);
  const recentSevenLogs = member.emotionLogs.filter((log) => log.date >= getDaysAgo(6));

  return {
    member,
    todayStatus,
    pairedDifference: findPairedDifference(member.emotionLogs),
    trend7: buildDailyAverageTrend(member.emotionLogs, 7),
    trend30: buildDailyAverageTrend(member.emotionLogs, 30),
    timeline: buildMemberTimeline(member.emotionLogs),
    morningNight: buildMorningNightComparison(member.emotionLogs, 7),
    stabilityIndex: calculateStabilityIndex(recentSevenLogs),
    fluctuationScore: calculateFluctuationScore(recentSevenLogs),
    recommendations: collectRecentRecommendations(member.emotionLogs),
  };
}

export async function getMembersPageData() {
  const members: MembersPageRecord[] = await prisma.teamMember.findMany({
    orderBy: { fullName: "asc" },
    include: {
      user: true,
      humanDesignProfile: true,
      emotionLogs: {
        where: {
          date: getRecentWindow(7),
        },
        orderBy: [{ date: "asc" }, { sessionType: "asc" }],
        include: {
          recommendation: true,
        },
      },
    },
  });

  return members.map((member) => {
    const latestLog = getLatestLog(member.emotionLogs);
    const recommendations = collectRecentRecommendations(member.emotionLogs, 1);

    return {
      id: member.id,
      fullName: member.fullName,
      email: member.email,
      divisionOrRole: member.divisionOrRole,
      activeStatus: member.activeStatus,
      userEmail: member.user?.email ?? member.email,
      humanDesignReady: Boolean(
        member.humanDesignProfile?.type || member.humanDesignProfile?.authority,
      ),
      latestLogAt: latestLog?.createdAt ?? null,
      latestRecommendation: recommendations[0] ?? null,
      averageEmotion7: member.emotionLogs.length
        ? average(member.emotionLogs.map((log) => log.emotionScore))
        : null,
    };
  });
}

export async function getMemberDetailData(memberId: string) {
  const member: MembersPageRecord | null = await prisma.teamMember.findUnique({
    where: { id: memberId },
    include: {
      user: true,
      humanDesignProfile: true,
      emotionLogs: {
        where: {
          date: getRecentWindow(30),
        },
        orderBy: [{ date: "asc" }, { sessionType: "asc" }],
        include: {
          recommendation: true,
        },
      },
    },
  });

  if (!member) {
    return null;
  }

  const emotionValues = member.emotionLogs.map((log) => log.emotionScore);
  const stressValues = member.emotionLogs.map((log) => log.stressScore);
  const clarityValues = member.emotionLogs.map((log) => log.clarityScore);

  return {
    member,
    timeline: buildMemberTimeline(member.emotionLogs),
    trend7: buildDailyAverageTrend(member.emotionLogs, 7),
    trend30: buildDailyAverageTrend(member.emotionLogs, 30),
    morningNight: buildMorningNightComparison(member.emotionLogs, 7),
    recommendations: collectRecentRecommendations(member.emotionLogs),
    pairedDifference: findPairedDifference(member.emotionLogs),
    averages: {
      emotion: emotionValues.length ? average(emotionValues) : null,
      stress: stressValues.length ? average(stressValues) : null,
      clarity: clarityValues.length ? average(clarityValues) : null,
    },
  };
}

export async function getLogsPageData(options: {
  role: "OWNER" | "MEMBER";
  teamMemberId?: string | null;
  memberId?: string | null;
  sessionType?: "MORNING" | "NIGHT" | null;
  startDate?: string;
  endDate?: string;
}): Promise<{
  logs: LogPageEntry[];
  members: LogFilterMember[];
  dateRange: ReturnType<typeof resolveDateRange>;
}> {
  const dateRange = resolveDateRange(
    options.startDate,
    options.endDate,
    options.role === "OWNER" ? 14 : 30,
  );
  const where =
    options.role === "OWNER"
      ? {
          date: getInclusiveDateWindow(dateRange.start, dateRange.end),
          ...(options.memberId ? { teamMemberId: options.memberId } : {}),
          ...(options.sessionType ? { sessionType: options.sessionType } : {}),
        }
      : {
          teamMemberId: options.teamMemberId!,
          date: getInclusiveDateWindow(dateRange.start, dateRange.end),
        };

  const logs: LogPageEntry[] = await prisma.emotionLog.findMany({
    where,
    orderBy: [{ date: "desc" }, { sessionType: "asc" }],
    include: {
      teamMember: true,
      recommendation: true,
    },
  });

  const members: LogFilterMember[] =
    options.role === "OWNER"
      ? await prisma.teamMember.findMany({
          orderBy: { fullName: "asc" },
          select: {
            id: true,
            fullName: true,
          },
        })
      : [];

  return {
    logs,
    members,
    dateRange,
  };
}

export async function getMePageData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      teamMember: {
        include: {
          humanDesignProfile: true,
          emotionLogs: {
            where: {
              date: getRecentWindow(30),
            },
            orderBy: [{ date: "asc" }, { sessionType: "asc" }],
            include: {
              recommendation: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  if (!user.teamMember) {
    const memberCount = await prisma.teamMember.count();
    const logCount = await prisma.emotionLog.count();

    return {
      user,
      memberCount,
      logCount,
      timeline: [],
      recommendations: [],
    };
  }

  return {
    user,
    timeline: buildMemberTimeline(user.teamMember.emotionLogs as LogWithRecommendation[]),
    trend30: buildDailyAverageTrend(user.teamMember.emotionLogs as LogWithRecommendation[], 30),
    recommendations: collectRecentRecommendations(
      user.teamMember.emotionLogs as LogWithRecommendation[],
    ),
  };
}
