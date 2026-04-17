"use client";

import { useActionState } from "react";

import { saveMemberAction } from "@/lib/actions/members";
import { getFieldError, initialActionState } from "@/lib/action-state";
import { FieldError } from "@/components/shared/field-error";
import { FormStateAlert } from "@/components/shared/form-state-alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";

type MemberFormProps = {
  defaultValues?: {
    id: string;
    fullName: string;
    email: string;
    divisionOrRole: string;
    activeStatus: boolean;
  };
  mode: "create" | "edit";
};

export function MemberForm({ defaultValues, mode }: MemberFormProps) {
  const [state, action] = useActionState(saveMemberAction, initialActionState);

  return (
    <form action={action} className="space-y-5">
      {defaultValues ? <input type="hidden" name="id" value={defaultValues.id} /> : null}
      <FormStateAlert state={state} />

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${mode}-fullName`}>Nama lengkap</Label>
          <Input
            id={`${mode}-fullName`}
            name="fullName"
            defaultValue={defaultValues?.fullName}
            required
          />
          <FieldError message={getFieldError(state, "fullName")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${mode}-email`}>Email</Label>
          <Input
            id={`${mode}-email`}
            name="email"
            type="email"
            defaultValue={defaultValues?.email}
            required
          />
          <FieldError message={getFieldError(state, "email")} />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${mode}-divisionOrRole`}>Divisi atau peran</Label>
          <Input
            id={`${mode}-divisionOrRole`}
            name="divisionOrRole"
            defaultValue={defaultValues?.divisionOrRole}
            required
          />
          <FieldError message={getFieldError(state, "divisionOrRole")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${mode}-activeStatus`}>Status</Label>
          <Select
            id={`${mode}-activeStatus`}
            name="activeStatus"
            defaultValue={defaultValues?.activeStatus === false ? "false" : "true"}
          >
            <option value="true">Aktif</option>
            <option value="false">Nonaktif</option>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${mode}-initialPassword`}>
          {mode === "create" ? "Kata sandi awal" : "Reset kata sandi (opsional)"}
        </Label>
        <Input
          id={`${mode}-initialPassword`}
          name="initialPassword"
          type="password"
          placeholder={mode === "create" ? "Atur kata sandi anggota" : "Kosongkan untuk mempertahankan kata sandi saat ini"}
        />
        <FieldError message={getFieldError(state, "initialPassword")} />
      </div>

      <SubmitButton pendingLabel={mode === "create" ? "Membuat..." : "Menyimpan..."}>
        {mode === "create" ? "Buat anggota" : "Simpan perubahan anggota"}
      </SubmitButton>
    </form>
  );
}
