"use client";

import { useActionState } from "react";

import { changePasswordAction } from "@/lib/actions/auth";
import { getFieldError, initialActionState } from "@/lib/action-state";
import { FieldError } from "@/components/shared/field-error";
import { FormStateAlert } from "@/components/shared/form-state-alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";

export function PasswordForm() {
  const [state, action] = useActionState(changePasswordAction, initialActionState);

  return (
    <form action={action} className="space-y-5">
      <FormStateAlert state={state} />

      <div className="space-y-2">
        <Label htmlFor="currentPassword">Kata sandi saat ini</Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />
        <FieldError message={getFieldError(state, "currentPassword")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">Kata sandi baru</Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
        />
        <FieldError message={getFieldError(state, "newPassword")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Konfirmasi kata sandi baru</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
        />
        <FieldError message={getFieldError(state, "confirmPassword")} />
      </div>

      <SubmitButton pendingLabel="Memperbarui...">Perbarui kata sandi</SubmitButton>
    </form>
  );
}
