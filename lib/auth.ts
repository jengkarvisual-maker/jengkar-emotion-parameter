import { compare, hash } from "bcryptjs";

import { prisma } from "@/lib/prisma";
import {
  clearSession,
  createSession,
  getSession,
  requireMemberSession,
  requireOwnerSession,
  requireSession,
  SESSION_COOKIE_NAME,
  signSessionToken,
  type SessionUser,
  verifySessionToken,
} from "@/lib/session";

export async function hashPassword(value: string) {
  return hash(value, 12);
}

export async function verifyPassword(value: string, passwordHash: string) {
  return compare(value, passwordHash);
}

export async function authenticateUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: { teamMember: true },
  });

  if (!user || !user.activeStatus) {
    return null;
  }

  if (user.role === "MEMBER") {
    if (!user.teamMemberId || !user.teamMember || !user.teamMember.activeStatus) {
      return null;
    }
  }

  const passwordMatches = await verifyPassword(password, user.passwordHash);

  if (!passwordMatches) {
    return null;
  }

  return {
    userId: user.id,
    email: user.email,
    role: user.role,
    teamMemberId: user.teamMemberId ?? null,
  } satisfies SessionUser;
}

export async function getCurrentUserRecord() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      teamMember: {
        include: {
          humanDesignProfile: true,
        },
      },
    },
  });

  if (!user || !user.activeStatus) {
    await clearSession();
    return null;
  }

  if (
    user.role === "MEMBER" &&
    (!user.teamMember ||
      !user.teamMember.activeStatus ||
      user.teamMemberId !== user.teamMember.id)
  ) {
    await clearSession();
    return null;
  }

  return user;
}

export {
  clearSession,
  createSession,
  getSession,
  requireMemberSession,
  requireOwnerSession,
  requireSession,
  SESSION_COOKIE_NAME,
  signSessionToken,
  verifySessionToken,
};
