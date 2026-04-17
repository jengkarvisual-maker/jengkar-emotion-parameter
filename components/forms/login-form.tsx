"use client";

import Link from "next/link";
import { useActionState } from "react";

import { FieldError } from "@/components/shared/field-error";
import { FormStateAlert } from "@/components/shared/form-state-alert";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
import { DEMO_MEMBER_PASSWORD, DEMO_OWNER } from "@/lib/constants";
import { getFieldError, initialActionState } from "@/lib/action-state";
import { loginAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

export function LoginForm() {
  const [state, action] = useActionState(loginAction, initialActionState);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <Card className="overflow-hidden">
        <CardHeader className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/80">
            Selamat datang kembali
          </p>
          <CardTitle className="font-serif text-4xl">Masuk untuk melanjutkan pelacakan pola.</CardTitle>
          <CardDescription className="max-w-xl text-sm leading-6">
            Check-in emosi harian, konteks Human Design, dan rekomendasi reflektif untuk tim internal kecil.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-5">
            <FormStateAlert state={state} />

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="owner@emotiontracker.local"
                autoComplete="email"
                required
              />
              <FieldError message={getFieldError(state, "email")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Kata sandi</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Masukkan kata sandi Anda"
                autoComplete="current-password"
                required
              />
              <FieldError message={getFieldError(state, "password")} />
            </div>

            <div className="flex flex-wrap gap-3">
              <SubmitButton className="min-w-36" pendingLabel="Sedang masuk...">
                Masuk
              </SubmitButton>
              <Link
                href="mailto:owner@emotiontracker.local"
                className={cn(buttonVariants({ variant: "ghost" }))}
              >
                Butuh akses?
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-primary/15 bg-primary/5">
        <CardHeader>
          <CardTitle>Kredensial demo</CardTitle>
          <CardDescription>
            Akun-akun ini disediakan melalui seed untuk setup lokal dan peninjauan internal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 text-sm">
          <div className="space-y-2 rounded-2xl border border-border/70 bg-background/85 p-4">
            <p className="font-semibold">Pemilik</p>
            <p className="text-muted-foreground">{DEMO_OWNER.email}</p>
            <p className="font-mono text-sm">{DEMO_OWNER.password}</p>
          </div>
          <div className="space-y-2 rounded-2xl border border-border/70 bg-background/85 p-4">
            <p className="font-semibold">Anggota</p>
            <p className="text-muted-foreground">
              Setiap anggota seed memiliki email masing-masing.
            </p>
            <p className="font-mono text-sm">{DEMO_MEMBER_PASSWORD}</p>
          </div>
          <p className="leading-6 text-muted-foreground">
            Mesin rekomendasi pada V1 hanya berbasis aturan. Bahasa yang digunakan lembut dan reflektif serta tidak melakukan interpretasi medis atau psikologis.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
