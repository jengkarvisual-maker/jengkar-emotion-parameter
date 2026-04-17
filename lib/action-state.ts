import { ZodError } from "zod";

export type ActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const initialActionState: ActionState = {
  status: "idle",
};

export function successState(message: string): ActionState {
  return {
    status: "success",
    message,
  };
}

export function errorState(
  message: string,
  fieldErrors?: Record<string, string[] | undefined>,
): ActionState {
  return {
    status: "error",
    message,
    fieldErrors,
  };
}

export function zodErrorState(error: ZodError): ActionState {
  const flattened = error.flatten();

  return {
    status: "error",
    message: flattened.formErrors[0] ?? "Silakan periksa kembali field yang ditandai.",
    fieldErrors: flattened.fieldErrors,
  };
}

export function getFieldError(state: ActionState, field: string) {
  return state.fieldErrors?.[field]?.[0];
}
