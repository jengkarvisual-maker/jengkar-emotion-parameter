import { Alert } from "@/components/ui/alert";
import type { ActionState } from "@/lib/action-state";

type FormStateAlertProps = {
  state: ActionState;
};

export function FormStateAlert({ state }: FormStateAlertProps) {
  if (state.status === "idle" || !state.message) {
    return null;
  }

  return (
    <Alert tone={state.status === "success" ? "success" : "destructive"}>
      {state.message}
    </Alert>
  );
}
