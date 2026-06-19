import { describe, expect, it } from "vitest";
import { calculateDashboardSummary } from "./budget";
import type { ChecklistItem, Listing } from "./types";

const checklist: ChecklistItem[] = [
  {
    id: "mattress",
    name: "Mattress",
    category: "Sleep",
    priority: "urgent",
    suggestedBudget: 300,
    status: "missing",
    sourceIds: ["real-simple-first-apartment"]
  },
  {
    id: "desk",
    name: "Desk or work table",
    category: "Work",
    priority: "soon",
    suggestedBudget: 120,
    status: "bought",
    sourceIds: ["real-simple-first-apartment"]
  },
  {
    id: "sofa",
    name: "Small sofa or loveseat",
    category: "Living",
    priority: "nice-to-have",
    suggestedBudget: 250,
    status: "saved",
    sourceIds: ["architectural-digest-first-apartment"]
  }
];

const listings: Listing[] = [
  {
    id: "listing-1",
    title: "Used loveseat",
    price: 180,
    source: "Facebook Marketplace",
    url: "https://example.com/loveseat",
    checklistItemId: "sofa",
    category: "Living",
    condition: "used",
    logistics: "pickup"
  }
];

describe("calculateDashboardSummary", () => {
  it("summarizes planned spend, remaining budget, completion, urgent gaps, and next item", () => {
    const summary = calculateDashboardSummary(700, checklist, listings);

    expect(summary.totalBudget).toBe(700);
    expect(summary.plannedSpend).toBe(300);
    expect(summary.remainingBudget).toBe(400);
    expect(summary.essentialsCompleted).toBe(1);
    expect(summary.missingUrgentItems.map((item) => item.name)).toEqual(["Mattress"]);
    expect(summary.savedListings).toBe(1);
    expect(summary.bestNextItem?.name).toBe("Mattress");
  });
});
