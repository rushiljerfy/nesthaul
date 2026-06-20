"use client";

import { useEffect, useMemo, useState } from "react";
import { calculateDashboardSummary } from "@/lib/budget";
import { createMoveInChecklist } from "@/lib/checklist";
import { loadSavedPlan, savePlan } from "@/lib/storage";
import type { AppPage, ChecklistItem, ChecklistStatus, Listing, OnboardingProfile } from "@/lib/types";
import { AppNav } from "./AppNav";
import { DashboardPage } from "./DashboardPage";
import { ExplorePage } from "./ExplorePage";
import { LandingPage } from "./LandingPage";
import { OnboardingForm } from "./OnboardingForm";
import { ProfilePage } from "./ProfilePage";

export function NestHaulApp() {
  const [stage, setStage] = useState<"landing" | "onboarding" | "app">("landing");
  const [activePage, setActivePage] = useState<AppPage>("Dashboard");
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [hasLoadedSavedPlan, setHasLoadedSavedPlan] = useState(false);

  const summary = useMemo(
    () => calculateDashboardSummary(profile?.totalBudget ?? 0, checklist, listings),
    [profile?.totalBudget, checklist, listings]
  );

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const savedPlan = loadSavedPlan();

    if (savedPlan) {
      setProfile(savedPlan.profile);
      setChecklist(savedPlan.checklist);
      setListings(savedPlan.listings);
      setActivePage(savedPlan.activePage);
      setStage("app");
    }

    setHasLoadedSavedPlan(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!hasLoadedSavedPlan || !profile) {
      return;
    }

    savePlan({ activePage, profile, checklist, listings });
  }, [activePage, checklist, hasLoadedSavedPlan, listings, profile]);

  function handleOnboardingComplete(nextProfile: OnboardingProfile) {
    setProfile(nextProfile);
    setChecklist(createMoveInChecklist(nextProfile.ownedItems));
    setActivePage("Dashboard");
    setStage("app");
  }

  function updateChecklistStatus(itemId: string, status: ChecklistStatus) {
    setChecklist((current) => current.map((item) => (item.id === itemId ? { ...item, status } : item)));
  }

  function addListing(listing: Listing) {
    setListings((current) => [...current, listing]);
    updateChecklistStatus(listing.checklistItemId, "saved");
  }

  function removeListing(listingId: string) {
    const removedListing = listings.find((listing) => listing.id === listingId);
    const remainingListings = listings.filter((listing) => listing.id !== listingId);

    setListings(remainingListings);

    if (!removedListing || remainingListings.some((listing) => listing.checklistItemId === removedListing.checklistItemId)) {
      return;
    }

    setChecklist((current) =>
      current.map((item) =>
        item.id === removedListing.checklistItemId && item.status === "saved" ? { ...item, status: "missing" } : item
      )
    );
  }

  function saveExploreItem(item: Parameters<React.ComponentProps<typeof ExplorePage>["onSaveItem"]>[0]) {
    setListings((current) => {
      if (current.some((listing) => listing.id === item.id)) {
        return current;
      }

      return [
        ...current,
        {
          id: item.id,
          title: item.title,
          price: item.price,
          source: item.source,
          url: item.url,
          checklistItemId: item.checklistItemId,
          category: item.category,
          condition: item.condition,
          logistics: item.logistics,
          notes: item.notes,
          savedFrom: "explore"
        }
      ];
    });
    updateChecklistStatus(item.checklistItemId, "saved");
  }

  function saveProfile(nextProfile: OnboardingProfile) {
    setProfile(nextProfile);
    setChecklist((current) =>
      current.map((item) =>
        nextProfile.ownedItems.some((ownedItem) => item.name.toLowerCase().includes(ownedItem.toLowerCase()))
          ? { ...item, status: "bought" }
          : item
      )
    );
  }

  return (
    <main className="app-shell">
      {stage === "landing" ? <LandingPage onStart={() => setStage("onboarding")} /> : null}
      {stage === "onboarding" ? <OnboardingForm onComplete={handleOnboardingComplete} /> : null}
      {stage === "app" && profile ? (
        <>
          <AppNav activePage={activePage} onNavigate={setActivePage} />
          {activePage === "Dashboard" ? (
            <DashboardPage
              profile={profile}
              checklist={checklist}
              listings={listings}
              plannedSpend={summary.plannedSpend}
              onAddListing={addListing}
              onRemoveListing={removeListing}
              onUpdateStatus={updateChecklistStatus}
            />
          ) : null}
          {activePage === "Profile" ? <ProfilePage profile={profile} onSaveProfile={saveProfile} /> : null}
          {activePage === "Explore" ? <ExplorePage savedListings={listings} onSaveItem={saveExploreItem} /> : null}
        </>
      ) : null}
    </main>
  );
}
