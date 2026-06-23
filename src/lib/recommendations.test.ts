import { describe, expect, it } from "vitest";
import { assessListing } from "./recommendations";
import type { ChecklistItem, Listing } from "./types";

const baseChecklist: ChecklistItem[] = [
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
    suggestedBudget: 125,
    status: "bought",
    sourceIds: ["real-simple-first-apartment"]
  },
  {
    id: "rug",
    name: "Area rug",
    category: "Living",
    priority: "nice-to-have",
    suggestedBudget: 80,
    status: "missing",
    sourceIds: ["spruce-first-place-mistakes"]
  }
];

const listing: Listing = {
  id: "listing-1",
  title: "Memory foam mattress",
  price: 275,
  source: "IKEA",
  url: "https://example.com/mattress",
  checklistItemId: "mattress",
  category: "Sleep",
  condition: "new",
  logistics: "delivery available"
};

describe("assessListing", () => {
  it("recommends Buy when an urgent missing item fits budget and total cap", () => {
    expect(assessListing(listing, baseChecklist, 700, 100).recommendation).toBe("Buy");
  });

  it("recommends Wait when useful but above the suggested item budget", () => {
    const result = assessListing({ ...listing, price: 360 }, baseChecklist, 700, 100);

    expect(result.recommendation).toBe("Wait");
    expect(result.explanation).toContain("above the suggested");
  });

  it("recommends Wait for non-urgent useful items that fit the budget", () => {
    const result = assessListing(
      { ...listing, checklistItemId: "rug", category: "Living", price: 70 },
      baseChecklist,
      700,
      100
    );

    expect(result.recommendation).toBe("Wait");
    expect(result.explanation).toContain("not urgent");
  });

  it("recommends Skip when a listing duplicates a bought item", () => {
    const result = assessListing(
      { ...listing, checklistItemId: "desk", category: "Work", price: 75 },
      baseChecklist,
      700,
      100
    );

    expect(result.recommendation).toBe("Skip");
    expect(result.explanation).toContain("already covered");
  });

  it("recommends Skip when a listing pushes the user over budget", () => {
    const result = assessListing(listing, baseChecklist, 300, 100);

    expect(result.recommendation).toBe("Skip");
    expect(result.explanation).toContain("over your total budget");
  });

  it("does not treat a missing listing price as a zero-dollar buy", () => {
    const result = assessListing({ ...listing, price: undefined as unknown as number }, baseChecklist, 700, 100);

    expect(result.recommendation).toBe("Wait");
    expect(result.explanation).toMatch(/enter the listing price/i);
  });
});
