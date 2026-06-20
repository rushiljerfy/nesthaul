"use client";

import type { ChecklistItem, ChecklistStatus, Listing, OnboardingProfile } from "@/lib/types";
import { ChecklistManager } from "./ChecklistManager";
import { Dashboard } from "./Dashboard";
import { SavedListings } from "./SavedListings";

interface DashboardPageProps {
  profile: OnboardingProfile;
  checklist: ChecklistItem[];
  listings: Listing[];
  plannedSpend: number;
  onAddListing: (listing: Listing) => void;
  onRemoveListing: (listingId: string) => void;
  onUpdateStatus: (itemId: string, status: ChecklistStatus) => void;
}

export function DashboardPage({
  profile,
  checklist,
  listings,
  plannedSpend,
  onAddListing,
  onRemoveListing,
  onUpdateStatus
}: DashboardPageProps) {
  return (
    <>
      <Dashboard profile={profile} checklist={checklist} listings={listings} />
      <SavedListings
        checklist={checklist}
        listings={listings}
        totalBudget={profile.totalBudget}
        plannedSpend={plannedSpend}
        onAddListing={onAddListing}
        onRemoveListing={onRemoveListing}
      />
      <ChecklistManager checklist={checklist} onUpdateStatus={onUpdateStatus} />
    </>
  );
}
