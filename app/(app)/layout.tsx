import { getAuthenticatedUser } from "@/lib/actions/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getAuthenticatedUser();
  const displayName = user.teamMember?.fullName ?? "Pemilik";

  return (
    <div className="min-h-screen lg:flex">
      <Sidebar role={user.role} email={user.email} name={displayName} />
      <main className="flex-1">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-4 lg:px-8 lg:py-8">
          <Topbar />
          {children}
        </div>
      </main>
    </div>
  );
}
