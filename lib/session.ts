import { type JWTPayload, SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role } from "@/lib/types";

export const SESSION_COOKIE_NAME = "emotion-tracker-session";

const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

type SessionTokenPayload = JWTPayload & {
  userId: string;
  email: string;
  role: Role;
  teamMemberId?: string | null;
};

export type SessionUser = {
  userId: string;
  email: string;
  role: Role;
  teamMemberId: string | null;
};

function getAuthSecret() {
  const value = process.env.AUTH_SECRET;

  if (!value) {
    throw new Error("AUTH_SECRET is missing.");
  }

  return new TextEncoder().encode(value);
}

export async function signSessionToken(user: SessionUser) {
  return new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getAuthSecret());
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getAuthSecret());
    const data = payload as SessionTokenPayload;

    if (!data.userId || !data.email || !data.role) {
      return null;
    }

    return {
      userId: data.userId,
      email: data.email,
      role: data.role,
      teamMemberId: data.teamMemberId ?? null,
    } satisfies SessionUser;
  } catch {
    return null;
  }
}

export async function createSession(user: SessionUser) {
  const cookieStore = await cookies();
  const token = await signSessionToken(user);

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}

export async function requireSession() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function requireOwnerSession() {
  const session = await requireSession();

  if (session.role !== "OWNER") {
    redirect("/dashboard");
  }

  return session;
}

export async function requireMemberSession(): Promise<
  SessionUser & { role: "MEMBER"; teamMemberId: string }
> {
  const session = await requireSession();

  if (session.role !== "MEMBER" || !session.teamMemberId) {
    redirect("/dashboard");
  }

  return {
    ...session,
    role: "MEMBER",
    teamMemberId: session.teamMemberId,
  };
}
