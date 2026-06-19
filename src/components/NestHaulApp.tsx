"use client";

import { useMemo, useState } from "react";
import { calculateDashboardSummary } from "@/lib/budget";
import { createMoveInChecklist } from "@/lib/checklist";
import { sourceNotes } from "@/lib/source-notes";
import type { ChecklistItem, ChecklistStatus, Listing, OnboardingProfile } from "@/lib/types";
import { ChecklistManager } from "./ChecklistManager";
import { Dashboard } from "./Dashboard";
import { LandingPage } from "./LandingPage";
import { OnboardingForm } from "./OnboardingForm";
import { SavedListings } from "./SavedListings";

export function NestHaulApp() {
  const [stage, setStage] = useState<"landing" | "onboarding" | "dashboard">("landing");
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);

  const summary = useMemo(
    () => calculateDashboardSummary(profile?.totalBudget ?? 0, checklist, listings),
    [profile?.totalBudget, checklist, listings]
  );

  function handleOnboardingComplete(nextProfile: OnboardingProfile) {
    setProfile(nextProfile);
    setChecklist(createMoveInChecklist(nextProfile.ownedItems));
    setStage("dashboard");
  }

  function updateChecklistStatus(itemId: string, status: ChecklistStatus) {
    setChecklist((current) => current.map((item) => (item.id === itemId ? { ...item, status } : item)));
  }

  return (
    <main className="app-shell">
      {stage === "landing" ? <LandingPage onStart={() => setStage("onboarding")} /> : null}
      {stage === "onboarding" ? <OnboardingForm onComplete={handleOnboardingComplete} /> : null}
      {stage === "dashboard" && profile ? (
        <>
          <Dashboard profile={profile} checklist={checklist} listings={listings} />
          <ChecklistManager checklist={checklist} onUpdateStatus={updateChecklistStatus} />
          <SavedListings
            checklist={checklist}
            listings={listings}
            totalBudget={profile.totalBudget}
            plannedSpend={summary.plannedSpend}
            onAddListing={(listing) => {
              setListings((current) => [...current, listing]);
              updateChecklistStatus(listing.checklistItemId, "saved");
            }}
          />
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
      ) : null}
    </main>
  );
}
