"use client";

import { useActionState } from "react";

import { dominantEmotionOptions, alignmentFeelingOptions, sessionTypeOptions } from "@/lib/constants";
import { saveEmotionLogAction } from "@/lib/actions/logs";
import { getFieldError, initialActionState } from "@/lib/action-state";
import { FieldError } from "@/components/shared/field-error";
import { FormStateAlert } from "@/components/shared/form-state-alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";

type EmotionLogFormProps = {
  defaultValues?: {
    date: string;
    sessionType: "MORNING" | "NIGHT";
    emotionScore?: number;
    energyScore?: number;
    stressScore?: number;
    clarityScore?: number;
    dominantEmotion?: string;
    triggerText?: string | null;
    note?: string | null;
    alignmentFeeling?: string;
  };
};

export function EmotionLogForm({ defaultValues }: EmotionLogFormProps) {
  const [state, action] = useActionState(saveEmotionLogAction, initialActionState);

  return (
    <form id="log-form" action={action} className="space-y-5">
      <FormStateAlert state={state} />

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="date">Tanggal</Label>
          <Input
            id="date"
            name="date"
            type="date"
            defaultValue={defaultValues?.date}
            required
          />
          <FieldError message={getFieldError(state, "date")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sessionType">Sesi</Label>
          <Select
            id="sessionType"
            name="sessionType"
            defaultValue={defaultValues?.sessionType ?? "MORNING"}
          >
            {sessionTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <FieldError message={getFieldError(state, "sessionType")} />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <ScoreField
          name="emotionScore"
          label="Skor emosi"
          defaultValue={defaultValues?.emotionScore}
          error={getFieldError(state, "emotionScore")}
        />
        <ScoreField
          name="energyScore"
          label="Skor energi"
          defaultValue={defaultValues?.energyScore}
          error={getFieldError(state, "energyScore")}
        />
        <ScoreField
          name="stressScore"
          label="Skor stres"
          defaultValue={defaultValues?.stressScore}
          error={getFieldError(state, "stressScore")}
        />
        <ScoreField
          name="clarityScore"
          label="Skor kejernihan"
          defaultValue={defaultValues?.clarityScore}
          error={getFieldError(state, "clarityScore")}
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dominantEmotion">Emosi dominan</Label>
          <Select
            id="dominantEmotion"
            name="dominantEmotion"
            defaultValue={defaultValues?.dominantEmotion ?? "CALM"}
          >
            {dominantEmotionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <FieldError message={getFieldError(state, "dominantEmotion")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="alignmentFeeling">Perasaan selaras</Label>
          <Select
            id="alignmentFeeling"
            name="alignmentFeeling"
            defaultValue={defaultValues?.alignmentFeeling ?? "NEUTRAL"}
          >
            {alignmentFeelingOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <FieldError message={getFieldError(state, "alignmentFeeling")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="triggerText">Pemicu atau konteks</Label>
        <Textarea
          id="triggerText"
          name="triggerText"
          defaultValue={defaultValues?.triggerText ?? ""}
          placeholder="Apa yang tampak memengaruhi keadaan Anda?"
        />
        <FieldError message={getFieldError(state, "triggerText")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Catatan</Label>
        <Textarea
          id="note"
          name="note"
          defaultValue={defaultValues?.note ?? ""}
          placeholder="Catatan reflektif apa pun yang ingin Anda simpan bersama check-in ini."
        />
        <FieldError message={getFieldError(state, "note")} />
      </div>

      <SubmitButton pendingLabel="Menyimpan log...">Simpan log emosi</SubmitButton>
    </form>
  );
}

function ScoreField({
  name,
  label,
  defaultValue,
  error,
}: {
  name: string;
  label: string;
  defaultValue?: number;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type="number"
        min={1}
        max={10}
        defaultValue={defaultValue ?? 5}
        required
      />
      <FieldError message={error} />
    </div>
  );
}
