import type { AlignmentFeeling, DominantEmotion } from "@/lib/types";

import { average } from "@/lib/utils";

type RecommendationContext = {
  currentLog: {
    emotionScore: number;
    energyScore: number;
    stressScore: number;
    clarityScore: number;
    alignmentFeeling: AlignmentFeeling;
    dominantEmotion: DominantEmotion;
    triggerText: string | null;
  };
  recentLogs: Array<
    {
      emotionScore: number;
      energyScore: number;
      stressScore: number;
      clarityScore: number;
      alignmentFeeling: AlignmentFeeling;
      dominantEmotion: DominantEmotion;
    }
  >;
  pairedLog?: { emotionScore: number; stressScore: number; clarityScore: number } | null;
  profile?: {
    authority: string | null;
    decisionStyle: string | null;
    triggerNotes: string | null;
    emotionalNotes: string | null;
    type: string | null;
  } | null;
};

type RecommendationResult = {
  title: string;
  body: string;
};

export function generateRecommendation({
  currentLog,
  recentLogs,
  pairedLog,
  profile,
}: RecommendationContext): RecommendationResult {
  const weeklyLogs = [...recentLogs];
  const lastThreeLogs = weeklyLogs.slice(-3);

  const weeklyEmotion = average(weeklyLogs.map((log) => log.emotionScore));
  const weeklyStress = average(weeklyLogs.map((log) => log.stressScore));
  const weeklyClarity = average(weeklyLogs.map((log) => log.clarityScore));
  const weeklyEnergy = average(weeklyLogs.map((log) => log.energyScore));
  const weeklyAlignment = averageAlignment(
    weeklyLogs.map((log) => log.alignmentFeeling),
  );

  const lastThreeEmotion = average(lastThreeLogs.map((log) => log.emotionScore));
  const lastThreeStress = average(lastThreeLogs.map((log) => log.stressScore));
  const lastThreeClarity = average(lastThreeLogs.map((log) => log.clarityScore));
  const lastThreeEnergy = average(lastThreeLogs.map((log) => log.energyScore));
  const lastThreeAlignment = averageAlignment(
    lastThreeLogs.map((log) => log.alignmentFeeling),
  );
  const recentVolatility = calculateVolatility(lastThreeLogs.map((log) => log.emotionScore));
  const weeklyVolatility = calculateVolatility(weeklyLogs.map((log) => log.emotionScore));
  const pairedDifference = pairedLog
    ? Math.abs(currentLog.emotionScore - pairedLog.emotionScore)
    : 0;
  const stressShiftFromWeek = lastThreeStress - weeklyStress;
  const clarityShiftFromWeek = lastThreeClarity - weeklyClarity;
  const energyShiftFromWeek = lastThreeEnergy - weeklyEnergy;
  const emotionShiftFromWeek = lastThreeEmotion - weeklyEmotion;

  const reflectiveSentences: string[] = [];
  let title = "Refleksi Lembut";

  if (
    currentLog.stressScore >= 8 ||
    lastThreeStress >= 7 ||
    stressShiftFromWeek >= 1.2 ||
    currentLog.dominantEmotion === "PRESSURED"
  ) {
    title = "Tekanan Mungkin Sedang Meningkat";
    reflectiveSentences.push(
      "Beberapa check-in terakhir Anda memberi kesan bahwa tekanan mungkin sedang meningkat sedikit lebih tinggi dibanding pola mingguan yang lebih luas.",
      "Sedikit jeda sebelum merespons situasi yang menuntut atau keputusan penting mungkin terasa lebih mendukung saat ini.",
    );
  } else if (
    currentLog.energyScore <= 4 ||
    lastThreeEnergy <= 4.5 ||
    energyShiftFromWeek <= -1 ||
    currentLog.dominantEmotion === "TIRED" ||
    currentLog.dominantEmotion === "EMPTY"
  ) {
    title = "Ada Ruang Untuk Pemulihan";
    reflectiveSentences.push(
      "Tiga log terakhir Anda mengarah pada energi yang lebih rendah dibanding rata-rata mingguan terbaru.",
      "Ritme yang lebih ringan, prioritas yang lebih sederhana, dan sedikit waktu pemulihan tambahan mungkin terasa lebih mendukung daripada terus memaksa diri.",
    );
  } else if (
    currentLog.alignmentFeeling === "NOT_ALIGNED" ||
    lastThreeAlignment < 0 ||
    clarityShiftFromWeek <= -1
  ) {
    title = "Perhatikan Ketidaksesuaian Ini";
    reflectiveSentences.push(
      "Mungkin ada jarak antara apa yang sedang terjadi di sekitar Anda dan apa yang terasa selaras dalam beberapa check-in terakhir.",
      "Pengamatan mungkin lebih berguna hari ini daripada memaksakan kepastian.",
    );
  } else if (
    lastThreeStress <= weeklyStress &&
    lastThreeClarity >= weeklyClarity &&
    recentVolatility <= 1.5 &&
    lastThreeAlignment >= 0.33 &&
    currentLog.alignmentFeeling === "ALIGNED"
  ) {
    title = "Jendela Yang Lebih Stabil";
    reflectiveSentences.push(
      "Tiga log terakhir Anda terlihat relatif stabil dibanding rata-rata mingguan terbaru.",
      "Ini mungkin waktu yang mendukung untuk refleksi, perencanaan yang lembut, atau percakapan yang lebih membumi tentang prioritas.",
    );
  } else {
    reflectiveSentences.push(
      "Pola terbaru Anda terlihat campuran, dengan beberapa sinyal berbeda yang muncul di tiga log terakhir dan gambaran minggu yang lebih luas.",
      "Jeda singkat untuk memperhatikan apa yang memengaruhi keadaan Anda mungkin membantu Anda merespons dengan lebih jernih.",
    );
  }

  if (currentLog.clarityScore <= 4 || lastThreeClarity <= 4.5) {
    reflectiveSentences.push(
      "Kejernihan tampak sedikit menurun saat ini, jadi memberi keputusan lebih banyak waktu mungkin terasa lebih stabil daripada bertindak terlalu cepat.",
    );
  }

  if (stressShiftFromWeek >= 1) {
    reflectiveSentences.push(
      "Dibanding rata-rata 7 hari Anda, stres terbaru terlihat sedikit lebih tinggi, sehingga langkah-langkah kecil mungkin terasa lebih mudah dijalani.",
    );
  }

  if (emotionShiftFromWeek <= -1) {
    reflectiveSentences.push(
      "Skor emosi terbaru Anda juga terlihat lebih rendah daripada rata-rata mingguan yang lebih luas, dan ini mungkin layak diamati dengan lembut.",
    );
  }

  if (recentVolatility >= 2.5 || weeklyVolatility >= 2.8 || pairedDifference >= 3) {
    reflectiveSentences.push(
      "Tampaknya juga ada perubahan emosi yang cukup terlihat dalam pola terbaru, yang mungkin layak diamati sebelum menarik kesimpulan.",
    );
  }

  if (currentLog.triggerText) {
    reflectiveSentences.push(
      `Anda menyebutkan "${truncate(currentLog.triggerText, 72)}" sebagai pemicu, dan ini mungkin berguna untuk ditinjau kembali dengan rasa ingin tahu, bukan penilaian.`,
    );
  }

  if (profile?.authority?.toLowerCase().includes("emotional")) {
    reflectiveSentences.push(
      "Catatan Human Design Anda memberi kesan bahwa kejernihan emosional mungkin muncul seiring waktu, sehingga menunggu momen yang lebih tenang sebelum memutuskan bisa terasa mendukung.",
    );
  } else if (profile?.decisionStyle) {
    reflectiveSentences.push(
      `Ringkasan Human Design Anda mengarah pada ${lowerFirst(profile.decisionStyle)} sebagai gaya pengambilan keputusan yang membantu, jadi mungkin ada baiknya kembali ke pendekatan itu hari ini.`,
    );
  }

  if (weeklyAlignment <= -0.2) {
    reflectiveSentences.push(
      "Dalam 7 hari terakhir, keselarasan terlihat sedikit menegang, sehingga refleksi yang lebih lambat mungkin lebih berguna daripada kesimpulan yang terburu-buru.",
    );
  }

  if (profile?.triggerNotes) {
    reflectiveSentences.push(
      `Profil Anda juga menyoroti ${lowerFirst(truncate(profile.triggerNotes, 96))}, yang mungkin relevan jika pola ini terus berulang.`,
    );
  } else if (profile?.emotionalNotes) {
    reflectiveSentences.push(
      `Catatan dari ringkasan Human Design Anda memberi kesan ${lowerFirst(truncate(profile.emotionalNotes, 96))}.`,
    );
  }

  return {
    title,
    body: reflectiveSentences.join(" "),
  };
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

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).trim()}...`;
}

function lowerFirst(value: string) {
  return value.charAt(0).toLowerCase() + value.slice(1);
}

function calculateVolatility(values: number[]) {
  if (values.length <= 1) {
    return 0;
  }

  return average(
    values.slice(1).map((value, index) => Math.abs(value - values[index])),
  );
}
