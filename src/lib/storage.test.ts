import { beforeEach, describe, expect, it } from "vitest";
import { loadSavedPlan, savePlan } from "./storage";
import type { SavedPlan } from "./types";

const profile = {
  location: "Brooklyn, NY",
  apartmentType: "studio",
  moveInDate: "2026-08-01",
  totalBudget: 1500,
  preference: "mix",
  stylePreference: "warm minimal",
  ownedItems: ["mattress"]
} satisfies SavedPlan["profile"];

const savedPlan: SavedPlan = {
  activePage: "Explore",
  profile,
  checklist: [
    {
      id: "mattress",
      name: "Mattress",
      category: "Sleep",
      priority: "urgent",
      suggestedBudget: 300,
      status: "bought",
      sourceIds: ["real-simple-first-apartment"]
    }
  ],
  listings: [
    {
      id: "explore-mattress",
      title: "Budget mattress",
      price: 250,
      source: "Explore",
      url: "https://example.com/mattress",
      checklistItemId: "mattress",
      category: "Sleep",
      condition: "new",
      logistics: "delivery available"
    }
  ]
};

describe("NestHaul localStorage persistence", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("saves and loads the complete working plan", () => {
    savePlan(savedPlan);

    expect(loadSavedPlan()).toEqual(savedPlan);
  });

  it("returns null for missing or invalid saved data", () => {
    expect(loadSavedPlan()).toBeNull();

    window.localStorage.setItem("nesthaul-plan", "{not-json");

    expect(loadSavedPlan()).toBeNull();
  });
});
