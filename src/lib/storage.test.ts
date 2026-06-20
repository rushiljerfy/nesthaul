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

  it("saves and loads the complete working plan for a logged-in user", () => {
    savePlan(savedPlan, "rushil@example.com");

    expect(loadSavedPlan("rushil@example.com")).toEqual(savedPlan);
  });

  it("does not save or load a plan without a logged-in user", () => {
    savePlan(savedPlan);

    expect(loadSavedPlan()).toBeNull();
    expect(window.localStorage.getItem("nesthaul-plan")).toBeNull();
  });

  it("returns null for missing or invalid saved data", () => {
    expect(loadSavedPlan("rushil@example.com")).toBeNull();

    window.localStorage.setItem("nesthaul-plan:rushil@example.com", "{not-json");

    expect(loadSavedPlan("rushil@example.com")).toBeNull();
  });
});
