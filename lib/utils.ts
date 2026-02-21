import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function isMac() {
  if (typeof navigator === "undefined") {
    return false;
  }
  return navigator.platform.toLowerCase().includes("mac");
}

export function formatRelativeHours(iso: string) {
  const created = new Date(iso).getTime();
  const diffMs = Date.now() - created;
  if (diffMs < 60_000) return "just now";
  const hours = Math.floor(diffMs / (60 * 60 * 1000));
  if (hours < 1) {
    const mins = Math.floor(diffMs / (60 * 1000));
    return `${mins}m ago`;
  }
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
