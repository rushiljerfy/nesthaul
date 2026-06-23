import { findChecklistItem } from "./checklist";
import type { ChecklistItem, Listing, ListingAssessment } from "./types";

export function assessListing(
  listing: Listing,
  checklist: ChecklistItem[],
  totalBudget: number,
  plannedSpend: number
): ListingAssessment {
  const targetItem = findChecklistItem(checklist, listing.checklistItemId);

  if (!targetItem) {
    return {
      recommendation: "Skip",
      explanation: "This listing is not tied to a checklist item, so it is hard to justify in the plan."
    };
  }

  if (targetItem.status === "bought" || targetItem.status === "skipped") {
    return {
      recommendation: "Skip",
      explanation: `${targetItem.name} is already covered, so this would duplicate the plan.`
    };
  }

  if (typeof listing.price !== "number" || !Number.isFinite(listing.price)) {
    return {
      recommendation: "Wait",
      explanation: "Enter the listing price before deciding whether it fits the plan."
    };
  }

  if (plannedSpend + listing.price > totalBudget) {
    return {
      recommendation: "Skip",
      explanation: "Buying this would push you over your total budget."
    };
  }

  if (listing.price > targetItem.suggestedBudget * 1.5) {
    return {
      recommendation: "Skip",
      explanation: `This is much higher than the suggested $${targetItem.suggestedBudget} budget for ${targetItem.name}.`
    };
  }

  if (listing.price > targetItem.suggestedBudget) {
    return {
      recommendation: "Wait",
      explanation: `Useful, but it is above the suggested $${targetItem.suggestedBudget} budget for ${targetItem.name}.`
    };
  }

  if (targetItem.priority === "nice-to-have") {
    return {
      recommendation: "Wait",
      explanation: `${targetItem.name} is useful, but it is not urgent for move-in.`
    };
  }

  return {
    recommendation: "Buy",
    explanation: `This fills a ${targetItem.priority} missing item and fits the suggested $${targetItem.suggestedBudget} budget.`
  };
}
