import { redirect } from "next/navigation";

import type { SessionUser } from "@/lib/session";

export function canAccessMember(session: SessionUser, teamMemberId: string) {
  return session.role === "OWNER" || session.teamMemberId === teamMemberId;
}

export function assertCanAccessMember(session: SessionUser, teamMemberId: string) {
  if (!canAccessMember(session, teamMemberId)) {
    redirect("/dashboard");
  }
}
