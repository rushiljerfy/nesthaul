"use client";

import type { ChecklistItem, ChecklistStatus, Listing, OnboardingProfile } from "@/lib/types";
import { AuthCta } from "./AuthCta";
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
  showAuthCta?: boolean;
}

export function DashboardPage({
  profile,
  checklist,
  listings,
  plannedSpend,
  onAddListing,
  onRemoveListing,
  onUpdateStatus,
  showAuthCta = false
}: DashboardPageProps) {
  return (
    <>
      {showAuthCta ? <AuthCta /> : null}
      <Dashboard profile={profile} checklist={checklist} listings={listings} />
      <ChecklistManager checklist={checklist} onUpdateStatus={onUpdateStatus} />
      <SavedListings
        checklist={checklist}
        listings={listings}
        totalBudget={profile.totalBudget}
        plannedSpend={plannedSpend}
        onAddListing={onAddListing}
        onRemoveListing={onRemoveListing}
      />
    </>
  );
}
