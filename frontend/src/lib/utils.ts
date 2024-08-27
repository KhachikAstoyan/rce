import { type ClassValue, clsx } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";
import { dataTypeLabelMap } from "./constants/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatDate(date: string) {
  return format(new Date(date), "MMM dd, yyyy HH:mm");
}

export function formatMillisecondsString(ms: string) {
  const msNum = parseFloat(ms);
  return `${msNum.toFixed(2)} ms`;
}

export function isOnPath(path: string) {
  return window.location.pathname === path;
}

export function getTypeLabel(dataType: string) {
  return dataTypeLabelMap[dataType] || dataType;
}
