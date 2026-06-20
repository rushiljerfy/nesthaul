import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SavedListings } from "./SavedListings";
import type { ChecklistItem } from "@/lib/types";

const checklist: ChecklistItem[] = [
  {
    id: "mattress",
    name: "Mattress",
    category: "Sleep",
    priority: "urgent",
    suggestedBudget: 300,
    status: "missing",
    sourceIds: ["real-simple-first-apartment"]
  }
];

describe("SavedListings", () => {
  it("adds a listing with basic validation and recommendation details", async () => {
    const onAddListing = vi.fn();
    render(
      <SavedListings
        checklist={checklist}
        listings={[]}
        totalBudget={800}
        plannedSpend={0}
        onAddListing={onAddListing}
        onRemoveListing={vi.fn()}
      />
    );

    await userEvent.type(screen.getByLabelText(/title/i), "Queen mattress");
    await userEvent.type(screen.getByLabelText(/price/i), "250");
    await userEvent.type(screen.getByLabelText(/source/i), "IKEA");
    await userEvent.type(screen.getByLabelText(/url/i), "https://example.com/mattress");
    await userEvent.selectOptions(screen.getByLabelText(/category\/checklist item/i), "mattress");
    await userEvent.selectOptions(screen.getByLabelText(/condition/i), "new");
    await userEvent.type(screen.getByLabelText(/delivery or pickup/i), "delivery");
    await userEvent.click(screen.getByRole("button", { name: /save listing/i }));

    expect(onAddListing).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Queen mattress",
        price: 250,
        checklistItemId: "mattress"
      })
    );
  });
});
