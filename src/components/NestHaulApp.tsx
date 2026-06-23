"use client";

import { useEffect, useMemo, useState } from "react";
import { calculateDashboardSummary } from "@/lib/budget";
import { createMoveInChecklist } from "@/lib/checklist";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { loadPlanFromSupabase, migrateLocalPlanToSupabase, savePlanToSupabase } from "@/lib/supabase-persistence";
import {
  clearSavedPlan,
  clearSessionPlan,
  loadSavedPlan,
  loadSessionPlan,
  saveSessionPlan
} from "@/lib/storage";
import { useAuth } from "@/lib/useAuth";
import type { AppPage, ChecklistItem, ChecklistStatus, Listing, OnboardingProfile, SavedPlan } from "@/lib/types";
import { AppNav } from "./AppNav";
import { DashboardPage } from "./DashboardPage";
import { ExplorePage } from "./ExplorePage";
import { LandingPage } from "./LandingPage";
import { OnboardingForm } from "./OnboardingForm";
import { ProfilePage } from "./ProfilePage";

const defaultProfile: OnboardingProfile = {
  location: "",
  apartmentType: "studio",
  moveInDate: "",
  totalBudget: 0,
  preference: "mix",
  stylePreference: "",
  ownedItems: []
};

const defaultChecklist = createMoveInChecklist();

export function NestHaulApp() {
  const supabaseClient = useMemo(() => createBrowserSupabaseClient(), []);
  const { isLoading: isAuthLoading, logout, userEmail, userId } = useAuth();
  const [stage, setStage] = useState<"landing" | "onboarding" | "app">("app");
  const [activePage, setActivePage] = useState<AppPage>("Explore");
  const [profile, setProfile] = useState<OnboardingProfile | null>(defaultProfile);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => createMoveInChecklist());
  const [listings, setListings] = useState<Listing[]>([]);
  const [hasLoadedSavedPlan, setHasLoadedSavedPlan] = useState(false);
  const [isPlanLoading, setIsPlanLoading] = useState(false);
  const [isSavingPlan, setIsSavingPlan] = useState(false);
  const [persistenceError, setPersistenceError] = useState("");
  const [hasRemotePlan, setHasRemotePlan] = useState<boolean | null>(null);

  const summary = useMemo(
    () => calculateDashboardSummary(profile?.totalBudget ?? 0, checklist, listings),
    [profile?.totalBudget, checklist, listings]
  );

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    let isCancelled = false;

    async function loadPlan() {
      setHasLoadedSavedPlan(false);
      setPersistenceError("");

      if (!userId || !supabaseClient) {
        clearSavedPlan();
        const sessionPlan = loadSessionPlan();

        setProfile(sessionPlan?.profile ?? defaultProfile);
        setChecklist(sessionPlan?.checklist ?? createMoveInChecklist());
        setListings(sessionPlan?.listings ?? []);
        setActivePage(sessionPlan?.activePage ?? "Explore");
        setStage("app");
        setHasRemotePlan(null);
        setHasLoadedSavedPlan(true);
        return;
      }

      setIsPlanLoading(true);

      try {
        const sessionPlan = loadSessionPlan();
        const localPlan = sessionPlan && hasMeaningfulPlanChanges(sessionPlan) ? sessionPlan : loadSavedPlan(userEmail);
        const loadedPlan = localPlan
          ? await migrateLocalPlanToSupabase(supabaseClient, userId, localPlan)
          : await loadPlanFromSupabase(supabaseClient, userId);

        if (isCancelled) {
          return;
        }

        const nextProfile = loadedPlan?.profile ?? defaultProfile;

        if (loadedPlan) {
          setProfile(nextProfile);
          setChecklist(loadedPlan.checklist);
          setListings(loadedPlan.listings);
          setHasRemotePlan(true);
        } else {
          setProfile(nextProfile);
          setChecklist(createMoveInChecklist());
          setListings([]);
          setHasRemotePlan(false);
        }

        clearSessionPlan();
        clearSavedPlan(userEmail);
        setActivePage("Explore");
        setStage(isCompleteProfile(nextProfile) ? "app" : "onboarding");
        setHasLoadedSavedPlan(true);
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setProfile(defaultProfile);
        setChecklist(createMoveInChecklist());
        setListings([]);
        setActivePage("Explore");
        setStage("app");
        setHasRemotePlan(false);
        setPersistenceError(error instanceof Error ? error.message : "Failed to load saved plan.");
        setHasLoadedSavedPlan(true);
      } finally {
        if (!isCancelled) {
          setIsPlanLoading(false);
        }
      }
    }

    loadPlan();

    return () => {
      isCancelled = true;
    };
  }, [isAuthLoading, supabaseClient, userEmail, userId]);
  useEffect(() => {
    if (!hasLoadedSavedPlan || !profile) {
      return;
    }

    if (userId && (!isCompleteProfile(profile) || stage === "onboarding")) {
      return;
    }

    if (!userId || !supabaseClient) {
      saveSessionPlan({ activePage, profile, checklist, listings });
      return;
    }

    const client = supabaseClient;
    const currentUserId = userId;
    const currentProfile = profile;
    let isCancelled = false;

    async function saveRemotePlan() {
      setIsSavingPlan(true);
      setPersistenceError("");

      try {
        await savePlanToSupabase(client, currentUserId, { activePage, profile: currentProfile, checklist, listings });

        if (!isCancelled) {
          setHasRemotePlan(true);
        }
      } catch (error) {
        if (!isCancelled) {
          setPersistenceError(error instanceof Error ? error.message : "Failed to save plan.");
        }
      } finally {
        if (!isCancelled) {
          setIsSavingPlan(false);
        }
      }
    }

    saveRemotePlan();

    return () => {
      isCancelled = true;
    };
  }, [activePage, checklist, hasLoadedSavedPlan, listings, profile, stage, supabaseClient, userId]);

  useEffect(() => {
    if (userId) {
      return;
    }

    if (!userEmail) {
      clearSavedPlan();
    }
  }, [userEmail, userId]);

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

  async function handleLogout() {
    if (userId && supabaseClient && profile) {
      setIsSavingPlan(true);
      setPersistenceError("");

      try {
        await savePlanToSupabase(supabaseClient, userId, { activePage, profile, checklist, listings });
      } catch (error) {
        setPersistenceError(error instanceof Error ? error.message : "Failed to save plan before logging out.");
        setIsSavingPlan(false);
        return;
      }

      setIsSavingPlan(false);
    }

    clearSessionPlan();
    await logout();
    clearSessionPlan();
  }

  return (
    <main className="app-shell">
      {stage === "landing" ? <LandingPage onStart={() => setStage("onboarding")} /> : null}
      {stage === "onboarding" ? (
        <OnboardingForm
          headingEyebrow="Move-in setup"
          headingTitle="Create your move-in profile."
          initialProfile={profile ?? undefined}
          locationLabel="Where are you moving to?"
          onComplete={handleOnboardingComplete}
        />
      ) : null}
      {stage === "app" && profile ? (
        <>
          <AppNav activePage={activePage} onNavigate={setActivePage} onLogout={handleLogout} userEmail={userEmail} />
          {isPlanLoading ? (
            <div className="persistence-message" role="status">
              Loading saved plan...
            </div>
          ) : null}
          {persistenceError ? (
            <div className="form-errors" role="alert">
              <p>{persistenceError}</p>
            </div>
          ) : null}
          {userId && hasRemotePlan === false && !isPlanLoading ? (
            <div className="persistence-message" role="status">
              No saved plan yet. Save your profile or an Explore item to start one.
            </div>
          ) : null}
          {isSavingPlan ? (
            <div className="persistence-message" role="status">
              Saving plan...
            </div>
          ) : null}
          {activePage === "Dashboard" ? (
            <DashboardPage
              profile={profile}
              checklist={checklist}
              listings={listings}
              plannedSpend={summary.plannedSpend}
              onAddListing={addListing}
              onRemoveListing={removeListing}
              onUpdateStatus={updateChecklistStatus}
              showAuthCta={!userEmail}
            />
          ) : null}
          {activePage === "Profile" ? (
            <ProfilePage profile={profile} onSaveProfile={saveProfile} showAuthCta={!userEmail} />
          ) : null}
          {activePage === "Explore" ? <ExplorePage savedListings={listings} onSaveItem={saveExploreItem} /> : null}
        </>
      ) : null}
    </main>
  );
}

function hasMeaningfulPlanChanges(plan: SavedPlan) {
  return (
    plan.listings.length > 0 ||
    plan.profile.location !== defaultProfile.location ||
    plan.profile.apartmentType !== defaultProfile.apartmentType ||
    plan.profile.moveInDate !== defaultProfile.moveInDate ||
    plan.profile.totalBudget !== defaultProfile.totalBudget ||
    plan.profile.preference !== defaultProfile.preference ||
    plan.profile.stylePreference !== defaultProfile.stylePreference ||
    plan.profile.ownedItems.length > 0 ||
    plan.checklist.some((item) => defaultChecklist.find((defaultItem) => defaultItem.id === item.id)?.status !== item.status)
  );
}

function isCompleteProfile(profile: OnboardingProfile) {
  return (
    Boolean(profile.location.trim()) &&
    Boolean(profile.apartmentType) &&
    Boolean(profile.moveInDate) &&
    profile.totalBudget > 0 &&
    Boolean(profile.preference) &&
    Boolean(profile.stylePreference.trim())
  );
}
