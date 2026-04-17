import { PrismaClient } from "@prisma/client";

import { DEMO_MEMBER_PASSWORD, DEMO_OWNER } from "../lib/constants";
import { hashPassword } from "../lib/auth";

const prisma = new PrismaClient();

const teamSeeds = [
  {
    fullName: "Lugas Adepi Bumi",
    email: "lugas.adepi.bumi@emotiontracker.local",
    divisionOrRole: "Operations Coordinator",
    profile: {
      type: "Generator",
      authority: "Sacral",
      profile: "3/5",
      signature: "Satisfaction",
      notSelfTheme: "Frustration",
      decisionStyle:
        "Responding after feeling a clear body yes instead of rushing to force an answer.",
      triggerNotes:
        "Time pressure and unclear expectations can raise internal pressure quickly.",
      emotionalNotes:
        "Energy tends to recover when work feels practical, responsive, and paced well.",
      ownerSummaryText:
        "Usually steady when the task list feels clear. Benefits from quick pauses before reacting to urgent requests.",
    },
  },
  {
    fullName: "Naila Salma",
    email: "naila.salma@emotiontracker.local",
    divisionOrRole: "Marketing Specialist",
    profile: {
      type: "Projector",
      authority: "Emotional",
      profile: "2/4",
      signature: "Success",
      notSelfTheme: "Bitterness",
      decisionStyle:
        "Waiting for emotional clarity and trusted invitations before committing to important choices.",
      triggerNotes:
        "Feeling overlooked or pushed into urgent social responses can create emotional strain.",
      emotionalNotes:
        "Clarity often appears after rest, conversation, and time away from immediate pressure.",
      ownerSummaryText:
        "Works best with context and recognition. Reflection after meetings seems helpful.",
    },
  },
  {
    fullName: "Ilham Nasrudin",
    email: "ilham.nasrudin@emotiontracker.local",
    divisionOrRole: "Finance Admin",
    profile: {
      type: "Manifesting Generator",
      authority: "Sacral",
      profile: "1/3",
      signature: "Satisfaction",
      notSelfTheme: "Frustration",
      decisionStyle:
        "Checking whether the body still feels engaged after the first impulse to move quickly.",
      triggerNotes:
        "Multiple unfinished tasks at once can create mental clutter and impatience.",
      emotionalNotes:
        "Energy can swing when switching context too often without closure.",
      ownerSummaryText:
        "Tends to regain steadiness when priorities are narrowed to one or two important items.",
    },
  },
  {
    fullName: "Sindy Pratiwi",
    email: "sindy.pratiwi@emotiontracker.local",
    divisionOrRole: "Client Relations",
    profile: {
      type: "Projector",
      authority: "Splenic",
      profile: "4/6",
      signature: "Success",
      notSelfTheme: "Bitterness",
      decisionStyle:
        "Listening for the quiet instinctive cue before agreeing to take on more.",
      triggerNotes:
        "Back-to-back conversations without reset time may reduce clarity.",
      emotionalNotes:
        "A shorter pace and space between interactions often support steadiness.",
      ownerSummaryText:
        "Usually thoughtful and observant. Benefits from small buffers between people-facing tasks.",
    },
  },
  {
    fullName: "Miftah Mas'ud",
    email: "miftah.masud@emotiontracker.local",
    divisionOrRole: "Warehouse Lead",
    profile: {
      type: "Generator",
      authority: "Emotional",
      profile: "5/1",
      signature: "Satisfaction",
      notSelfTheme: "Frustration",
      decisionStyle:
        "Giving emotional waves time to settle before making firm commitments.",
      triggerNotes:
        "Unexpected operational changes can create pressure and tighter responses.",
      emotionalNotes:
        "Stability often returns when the next practical step is visible.",
      ownerSummaryText:
        "Responds well to direct priorities and clear handover notes.",
    },
  },
  {
    fullName: "Yongki Pardamean",
    email: "yongki.pardamean@emotiontracker.local",
    divisionOrRole: "Creative Designer",
    profile: {
      type: "Manifestor",
      authority: "Emotional",
      profile: "6/2",
      signature: "Peace",
      notSelfTheme: "Anger",
      decisionStyle:
        "Informing others and allowing the emotional tone to settle before acting at full speed.",
      triggerNotes:
        "Creative interruption and vague feedback loops can feel constricting.",
      emotionalNotes:
        "Independent focus blocks often help energy and clarity return.",
      ownerSummaryText:
        "Usually strongest when expectations are clear and creative time is protected.",
    },
  },
  {
    fullName: "Arif Rahman",
    email: "arif.rahman@emotiontracker.local",
    divisionOrRole: "Sales Support",
    profile: {
      type: "Generator",
      authority: "Sacral",
      profile: "4/6",
      signature: "Satisfaction",
      notSelfTheme: "Frustration",
      decisionStyle:
        "Responding once the body feels grounded rather than saying yes too quickly.",
      triggerNotes:
        "Heavy follow-up volume without visible progress may increase frustration.",
      emotionalNotes:
        "Momentum tends to improve after a short reset and clearer ordering of tasks.",
      ownerSummaryText:
        "Steadier when targets are broken into smaller checkpoints.",
    },
  },
  {
    fullName: "Agung Kusuma Wulandari",
    email: "agung.kusuma.wulandari@emotiontracker.local",
    divisionOrRole: "People Operations",
    profile: {
      type: "Reflector",
      authority: "Lunar",
      profile: "1/3",
      signature: "Surprise",
      notSelfTheme: "Disappointment",
      decisionStyle:
        "Letting bigger decisions breathe over time and observing the surrounding environment first.",
      triggerNotes:
        "Absorbing team tension too quickly may make the day feel heavier than expected.",
      emotionalNotes:
        "Perspective often improves when there is enough time and space to decompress.",
      ownerSummaryText:
        "Sensitive to atmosphere. Quiet observation can be more useful than urgent conclusions.",
    },
  },
  {
    fullName: "Nuzulul Lia",
    email: "nuzulul.lia@emotiontracker.local",
    divisionOrRole: "Admin Support",
    profile: {
      type: "Manifesting Generator",
      authority: "Sacral",
      profile: "2/5",
      signature: "Satisfaction",
      notSelfTheme: "Frustration",
      decisionStyle:
        "Checking whether the immediate response still feels true after the first burst of energy.",
      triggerNotes:
        "Repeated interruptions while finishing routine work can create pressure.",
      emotionalNotes:
        "Steadiness usually improves when the workspace feels organized and calm.",
      ownerSummaryText:
        "Often consistent with routine. Responds well to a clear start and finish for each task.",
    },
  },
];

async function main() {
  await prisma.recommendation.deleteMany();
  await prisma.emotionLog.deleteMany();
  await prisma.humanDesignProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.teamMember.deleteMany();

  await prisma.user.create({
    data: {
      email: DEMO_OWNER.email,
      passwordHash: await hashPassword(DEMO_OWNER.password),
      role: "OWNER",
      activeStatus: true,
    },
  });

  const memberPasswordHash = await hashPassword(DEMO_MEMBER_PASSWORD);
  const createdMembers: Array<{ id: string; fullName: string; profile: typeof teamSeeds[number]["profile"] }> = [];

  for (const seed of teamSeeds) {
    const member = await prisma.teamMember.create({
      data: {
        fullName: seed.fullName,
        email: seed.email,
        divisionOrRole: seed.divisionOrRole,
        activeStatus: true,
      },
    });

    await prisma.user.create({
      data: {
        email: seed.email,
        passwordHash: memberPasswordHash,
        role: "MEMBER",
        activeStatus: true,
        teamMemberId: member.id,
      },
    });

    await prisma.humanDesignProfile.create({
      data: {
        teamMemberId: member.id,
        ...seed.profile,
      },
    });

    createdMembers.push({
      id: member.id,
      fullName: seed.fullName,
      profile: seed.profile,
    });
  }

  console.log("Seed completed.");
  console.log(`Owner login: ${DEMO_OWNER.email} / ${DEMO_OWNER.password}`);
  console.log(`Member password for all seeded members: ${DEMO_MEMBER_PASSWORD}`);
  console.log("No dummy emotion logs were created.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
