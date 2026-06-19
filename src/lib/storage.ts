import type { SavedPlan } from "./types";

const storageKey = "nesthaul-plan";

export function loadSavedPlan(): SavedPlan | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawPlan = window.localStorage.getItem(storageKey);

  if (!rawPlan) {
    return null;
  }

  try {
    return JSON.parse(rawPlan) as SavedPlan;
  } catch {
    return null;
  }
}

export function savePlan(plan: SavedPlan) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(plan));
}

export function clearSavedPlan() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(storageKey);
}
