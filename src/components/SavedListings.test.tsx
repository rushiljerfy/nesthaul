import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
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
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reads listing details from a URL before saving", async () => {
    const onAddListing = vi.fn();
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        title: "Queen mattress",
        price: 250,
        source: "ikea.com",
        url: "https://example.com/mattress",
        checklistItemId: "mattress",
        condition: "new",
        logistics: "Delivery available",
        distance: ""
      })
    } as Response);

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

    await userEvent.type(screen.getByLabelText(/listing url/i), "https://example.com/mattress");
    await userEvent.click(screen.getByRole("button", { name: /read listing/i }));

    expect(await screen.findByDisplayValue("Queen mattress")).toBeInTheDocument();
    expect(screen.getByDisplayValue("ikea.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Delivery available")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /save listing/i }));

    expect(onAddListing).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Queen mattress",
        price: 250,
        checklistItemId: "mattress"
      })
    );
  });

  it("requires user-entered price before saving when the reader cannot extract it", async () => {
    const onAddListing = vi.fn();
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        title: "",
        price: null,
        source: "Facebook Marketplace",
        url: "https://www.facebook.com/marketplace/item/1038206661965081/",
        checklistItemId: "mattress",
        condition: null,
        logistics: "",
        distance: ""
      })
    } as Response);

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

    await userEvent.type(screen.getByLabelText(/listing url/i), "https://www.facebook.com/marketplace/item/1038206661965081/");
    await userEvent.click(screen.getByRole("button", { name: /read listing/i }));

    expect(await screen.findByDisplayValue("Facebook Marketplace")).toBeInTheDocument();
    await userEvent.click(await screen.findByRole("button", { name: /save listing/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/add a listing title/i);
    expect(onAddListing).not.toHaveBeenCalled();

    await userEvent.type(screen.getByLabelText(/^title$/i), "Used mattress");
    await userEvent.click(screen.getByRole("button", { name: /save listing/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/enter the real listing price/i);
    expect(onAddListing).not.toHaveBeenCalled();

    await userEvent.type(screen.getByLabelText(/price/i), "75");
    await userEvent.selectOptions(screen.getByLabelText(/condition/i), "used");
    await userEvent.click(screen.getByRole("button", { name: /save listing/i }));

    expect(onAddListing).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Used mattress",
        price: 75,
        condition: "used",
        logistics: "",
        distance: undefined
      })
    );
  });

  it("allows prices with up to two decimal places", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        title: "Apartment couch",
        price: 103.98,
        source: "amazon.com",
        url: "https://example.com/couch",
        checklistItemId: "sofa",
        condition: "N/A",
        logistics: "N/A",
        distance: ""
      })
    } as Response);

    render(
      <SavedListings
        checklist={checklist}
        listings={[]}
        totalBudget={800}
        plannedSpend={0}
        onAddListing={vi.fn()}
        onRemoveListing={vi.fn()}
      />
    );

    await userEvent.type(screen.getByLabelText(/listing url/i), "https://example.com/couch");
    await userEvent.click(screen.getByRole("button", { name: /read listing/i }));

    const price = await screen.findByLabelText(/price/i);

    expect(price).toHaveAttribute("step", "0.01");
    expect(price).toHaveValue(103.98);
  });
});
