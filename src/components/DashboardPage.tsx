"use client";

import { sourceNotes } from "@/lib/source-notes";
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
  onUpdateStatus: (itemId: string, status: ChecklistStatus) => void;
}

export function DashboardPage({
  profile,
  checklist,
  listings,
  plannedSpend,
  onAddListing,
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
      />
      <ChecklistManager checklist={checklist} onUpdateStatus={onUpdateStatus} />
      <section className="source-strip">
        <p className="eyebrow">Research notes</p>
        <div>
          {sourceNotes.map((source) => (
            <a href={source.url} key={source.id} target="_blank" rel="noreferrer" title={source.note}>
              {source.title}
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
