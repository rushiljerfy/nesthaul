import type { SavedPlan } from "./types";

const storageKey = "nesthaul-plan";

function storageKeyForUser(userEmail: string) {
  return `${storageKey}:${userEmail}`;
}

export function loadSavedPlan(userEmail?: string | null): SavedPlan | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (!userEmail) {
    return null;
  }

  const rawPlan = window.localStorage.getItem(storageKeyForUser(userEmail));

  if (!rawPlan) {
    return null;
  }

  try {
    return JSON.parse(rawPlan) as SavedPlan;
  } catch {
    return null;
  }
}

export function savePlan(plan: SavedPlan, userEmail?: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (!userEmail) {
    return;
  }

  window.localStorage.setItem(storageKeyForUser(userEmail), JSON.stringify(plan));
}

export function clearSavedPlan(userEmail?: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (userEmail) {
    window.localStorage.removeItem(storageKeyForUser(userEmail));
    return;
  }

  window.localStorage.removeItem(storageKey);
}
