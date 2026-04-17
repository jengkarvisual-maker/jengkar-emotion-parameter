import { redirect } from "next/navigation";

import { LoginForm } from "@/components/forms/login-form";
import { getSession } from "@/lib/auth";
import { APP_NAME } from "@/lib/constants";

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl items-center px-4 py-10 lg:px-8">
      <div className="w-full space-y-8">
        <div className="max-w-3xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">
            {APP_NAME}
          </p>
          <h1 className="font-serif text-4xl leading-tight text-balance md:text-6xl">
            Pelacak reflektif kesejahteraan tim untuk input emosi harian.
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
            Dirancang untuk tim internal kecil guna memantau pola, membandingkannya dengan ringkasan Human Design, dan meninjau rekomendasi yang lembut tanpa mengubah pengalaman ini menjadi diagnosis atau penilaian mutlak.
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
