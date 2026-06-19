import type { ChecklistItem, Listing } from "./types";

export interface DashboardSummary {
  totalBudget: number;
  plannedSpend: number;
  remainingBudget: number;
  essentialsCompleted: number;
  missingUrgentItems: ChecklistItem[];
  savedListings: number;
  bestNextItem?: ChecklistItem;
}

export function calculateDashboardSummary(
  totalBudget: number,
  checklist: ChecklistItem[],
  listings: Listing[]
): DashboardSummary {
  const plannedSpend = checklist
    .filter((item) => item.status === "missing")
    .reduce((sum, item) => sum + item.suggestedBudget, 0);
  const missingUrgentItems = checklist.filter((item) => item.status === "missing" && item.priority === "urgent");

  return {
    totalBudget,
    plannedSpend,
    remainingBudget: totalBudget - plannedSpend,
    essentialsCompleted: checklist.filter((item) => item.status === "bought").length,
    missingUrgentItems,
    savedListings: listings.length,
    bestNextItem:
      missingUrgentItems[0] ??
      checklist.find((item) => item.status === "missing" && item.priority === "soon") ??
      checklist.find((item) => item.status === "missing")
  };
}
