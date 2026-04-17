"use client";

import { useActionState } from "react";

import { saveHumanDesignAction } from "@/lib/actions/human-design";
import { getFieldError, initialActionState } from "@/lib/action-state";
import { FieldError } from "@/components/shared/field-error";
import { FormStateAlert } from "@/components/shared/form-state-alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";

type HumanDesignFormProps = {
  teamMemberId: string;
  profile: {
    type: string | null;
    authority: string | null;
    profile: string | null;
    signature: string | null;
    notSelfTheme: string | null;
    emotionalNotes: string | null;
    decisionStyle: string | null;
    triggerNotes: string | null;
    ownerSummaryText: string | null;
    ravechartFileUrl: string | null;
  } | null;
};

export function HumanDesignForm({ teamMemberId, profile }: HumanDesignFormProps) {
  const [state, action] = useActionState(saveHumanDesignAction, initialActionState);

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="teamMemberId" value={teamMemberId} />
      <FormStateAlert state={state} />

      <div className="grid gap-5 md:grid-cols-2">
        <TextField
          id="type"
          label="Tipe"
          name="type"
          defaultValue={profile?.type}
          error={getFieldError(state, "type")}
        />
        <TextField
          id="authority"
          label="Otoritas"
          name="authority"
          defaultValue={profile?.authority}
          error={getFieldError(state, "authority")}
        />
        <TextField
          id="profile"
          label="Profil"
          name="profile"
          defaultValue={profile?.profile}
          error={getFieldError(state, "profile")}
        />
        <TextField
          id="signature"
          label="Signature"
          name="signature"
          defaultValue={profile?.signature}
          error={getFieldError(state, "signature")}
        />
      </div>

      <TextField
        id="notSelfTheme"
        label="Tema not-self"
        name="notSelfTheme"
        defaultValue={profile?.notSelfTheme}
        error={getFieldError(state, "notSelfTheme")}
      />

      <TextAreaField
        id="decisionStyle"
        label="Gaya pengambilan keputusan"
        name="decisionStyle"
        defaultValue={profile?.decisionStyle}
        error={getFieldError(state, "decisionStyle")}
      />
      <TextAreaField
        id="triggerNotes"
        label="Catatan pemicu"
        name="triggerNotes"
        defaultValue={profile?.triggerNotes}
        error={getFieldError(state, "triggerNotes")}
      />
      <TextAreaField
        id="emotionalNotes"
        label="Catatan emosional"
        name="emotionalNotes"
        defaultValue={profile?.emotionalNotes}
        error={getFieldError(state, "emotionalNotes")}
      />
      <TextAreaField
        id="ownerSummaryText"
        label="Ringkasan pemilik"
        name="ownerSummaryText"
        defaultValue={profile?.ownerSummaryText}
        error={getFieldError(state, "ownerSummaryText")}
      />

      <div className="space-y-2">
        <Label htmlFor="ravechartFile">File rave chart (PDF, JPG, PNG, atau WEBP)</Label>
        <Input id="ravechartFile" name="ravechartFile" type="file" accept=".pdf,image/*" />
        {profile?.ravechartFileUrl ? (
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" name="removeCurrentFile" value="true" />
            Hapus file yang saat ini diunggah
          </label>
        ) : null}
      </div>

      <SubmitButton pendingLabel="Menyimpan profil...">Simpan profil Human Design</SubmitButton>
    </form>
  );
}

function TextField({
  id,
  label,
  name,
  defaultValue,
  error,
}: {
  id: string;
  label: string;
  name: string;
  defaultValue?: string | null;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={name} defaultValue={defaultValue ?? ""} />
      <FieldError message={error} />
    </div>
  );
}

function TextAreaField({
  id,
  label,
  name,
  defaultValue,
  error,
}: {
  id: string;
  label: string;
  name: string;
  defaultValue?: string | null;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Textarea id={id} name={name} defaultValue={defaultValue ?? ""} />
      <FieldError message={error} />
    </div>
  );
}
