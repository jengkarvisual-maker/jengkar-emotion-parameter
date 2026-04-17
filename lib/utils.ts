import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseDateInput(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

export function formatDateInput(value: Date) {
  return value.toISOString().slice(0, 10);
}

export function formatDate(value: Date | string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(
    "id-ID",
    options ?? {
      dateStyle: "medium",
    },
  ).format(new Date(value));
}

export function formatDateTime(
  value: Date | string,
  options?: Intl.DateTimeFormatOptions,
) {
  return new Intl.DateTimeFormat(
    "id-ID",
    options ?? {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(new Date(value));
}

export function average(values: number[]) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function getInitials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function formatScore(value: number) {
  return `${value.toFixed(1)}/10`;
}
