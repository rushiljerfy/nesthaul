import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppPage, ChecklistItem, Listing, OnboardingProfile, SavedPlan } from "./types";

type DatabaseClient = Pick<SupabaseClient, "from">;

type MovePlanRow = {
  user_id: string;
  active_page: AppPage;
  location: string;
  apartment_type: OnboardingProfile["apartmentType"];
  move_in_date: string;
  total_budget: number | string;
  preference: OnboardingProfile["preference"];
  style_preference: string;
  owned_items: string[];
};

type ChecklistItemRow = {
  id: string;
  user_id: string;
  name: string;
  category: ChecklistItem["category"];
  priority: ChecklistItem["priority"];
  suggested_budget: number | string;
  status: ChecklistItem["status"];
  source_ids: string[];
};

type SavedListingRow = {
  id: string;
  user_id: string;
  title: string;
  price: number | string;
  source: string;
  url: string;
  checklist_item_id: string;
  category: Listing["category"];
  condition: Listing["condition"];
  logistics: string;
  distance?: number | string | null;
  notes?: string | null;
  saved_from?: Listing["savedFrom"] | null;
};

type ExploreSavedItemRow = {
  id: string;
  user_id: string;
  checklist_item_id: string;
  category: Listing["category"];
};

interface QueryResult<T> {
  data: T;
  error: { message: string } | null;
}

export async function loadPlanFromSupabase(client: DatabaseClient, userId: string): Promise<SavedPlan | null> {
  const planResult = await client.from("move_plans").select("*").eq("user_id", userId).maybeSingle();

  throwIfSupabaseError(planResult.error);

  if (!planResult.data) {
    return null;
  }

  const [checklistResult, listingsResult] = await Promise.all([
    client.from("checklist_items").select("*").eq("user_id", userId),
    client.from("saved_listings").select("*").eq("user_id", userId)
  ]);

  throwIfSupabaseError(checklistResult.error);
  throwIfSupabaseError(listingsResult.error);

  return {
    activePage: planResult.data.active_page,
    profile: profileFromRow(planResult.data),
    checklist: (checklistResult.data ?? []).map(checklistFromRow),
    listings: (listingsResult.data ?? []).map(listingFromRow)
  };
}

export async function savePlanToSupabase(client: DatabaseClient, userId: string, plan: SavedPlan): Promise<void> {
  const planRow = movePlanToRow(userId, plan);
  const planResult = await client.from("move_plans").upsert(planRow as never, { onConflict: "user_id" });

  throwIfSupabaseError(planResult.error);

  await replaceRows(client, "checklist_items", userId, plan.checklist.map((item) => checklistToRow(userId, item)));
  await replaceRows(client, "saved_listings", userId, plan.listings.map((listing) => listingToRow(userId, listing)));
  await replaceRows(
    client,
    "explore_saved_items",
    userId,
    plan.listings.filter((listing) => listing.savedFrom === "explore").map((listing) => exploreSavedToRow(userId, listing))
  );
}

export async function migrateLocalPlanToSupabase(
  client: DatabaseClient,
  userId: string,
  localPlan: SavedPlan | null
): Promise<SavedPlan | null> {
  const remotePlan = await loadPlanFromSupabase(client, userId);

  if (!localPlan) {
    return remotePlan;
  }

  await savePlanToSupabase(client, userId, localPlan);

  return localPlan;
}

async function replaceRows<T>(client: DatabaseClient, table: string, userId: string, rows: T[]) {
  const deleteResult = await client.from(table).delete().eq("user_id", userId);

  throwIfSupabaseError(deleteResult.error);

  if (rows.length === 0) {
    return;
  }

  const insertResult = await client.from(table).insert(rows as never);

  throwIfSupabaseError(insertResult.error);
}

function throwIfSupabaseError(error: { message: string } | null | undefined) {
  if (error) {
    throw new Error(error.message);
  }
}

function movePlanToRow(userId: string, plan: SavedPlan): MovePlanRow {
  return {
    user_id: userId,
    active_page: plan.activePage,
    location: plan.profile.location,
    apartment_type: plan.profile.apartmentType,
    move_in_date: plan.profile.moveInDate,
    total_budget: plan.profile.totalBudget,
    preference: plan.profile.preference,
    style_preference: plan.profile.stylePreference,
    owned_items: plan.profile.ownedItems
  };
}

function profileFromRow(row: MovePlanRow): OnboardingProfile {
  return {
    location: row.location,
    apartmentType: row.apartment_type,
    moveInDate: row.move_in_date,
    totalBudget: Number(row.total_budget),
    preference: row.preference,
    stylePreference: row.style_preference,
    ownedItems: row.owned_items ?? []
  };
}

function checklistToRow(userId: string, item: ChecklistItem): ChecklistItemRow {
  return {
    id: item.id,
    user_id: userId,
    name: item.name,
    category: item.category,
    priority: item.priority,
    suggested_budget: item.suggestedBudget,
    status: item.status,
    source_ids: item.sourceIds
  };
}

function checklistFromRow(row: ChecklistItemRow): ChecklistItem {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    priority: row.priority,
    suggestedBudget: Number(row.suggested_budget),
    status: row.status,
    sourceIds: row.source_ids ?? []
  };
}

function listingToRow(userId: string, listing: Listing): SavedListingRow {
  return {
    id: listing.id,
    user_id: userId,
    title: listing.title,
    price: listing.price,
    source: listing.source,
    url: listing.url,
    checklist_item_id: listing.checklistItemId,
    category: listing.category,
    condition: listing.condition,
    logistics: listing.logistics,
    distance: listing.distance ?? null,
    notes: listing.notes ?? null,
    saved_from: listing.savedFrom ?? null
  };
}

function listingFromRow(row: SavedListingRow): Listing {
  return {
    id: row.id,
    title: row.title,
    price: Number(row.price),
    source: row.source,
    url: row.url,
    checklistItemId: row.checklist_item_id,
    category: row.category,
    condition: row.condition,
    logistics: row.logistics,
    distance: row.distance === null || row.distance === undefined ? undefined : Number(row.distance),
    notes: row.notes ?? undefined,
    savedFrom: row.saved_from ?? undefined
  };
}

function exploreSavedToRow(userId: string, listing: Listing): ExploreSavedItemRow {
  return {
    id: listing.id,
    user_id: userId,
    checklist_item_id: listing.checklistItemId,
    category: listing.category
  };
}

export type { DatabaseClient, QueryResult };
