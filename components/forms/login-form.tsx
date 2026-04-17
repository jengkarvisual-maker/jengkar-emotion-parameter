"use client";
import { useActionState } from "react";

import { FieldError } from "@/components/shared/field-error";
import { FormStateAlert } from "@/components/shared/form-state-alert";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
import { getFieldError, initialActionState } from "@/lib/action-state";
import { loginAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

export function LoginForm() {
  const [state, action] = useActionState(loginAction, initialActionState);

  return (
    <div className="max-w-xl">
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
                placeholder="nama@perusahaan.com"
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

            <div className="flex flex-wrap items-center gap-3">
              <SubmitButton className="min-w-36" pendingLabel="Sedang masuk...">
                Masuk
              </SubmitButton>
              <p className={cn(buttonVariants({ variant: "ghost" }), "pointer-events-none px-0 text-muted-foreground")}>
                Butuh akses? Hubungi admin internal tim Anda.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
