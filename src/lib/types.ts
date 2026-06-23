export type ApartmentType = "studio" | "one-bedroom" | "two-bedroom" | "shared";

export type Preference = "mostly-new" | "mostly-used" | "mix";

export type ChecklistCategory =
  | "Sleep"
  | "Work"
  | "Kitchen"
  | "Bathroom"
  | "Cleaning"
  | "Storage"
  | "Living";

export type Priority = "urgent" | "soon" | "nice-to-have";

export type ChecklistStatus = "missing" | "saved" | "bought" | "skipped";

export type ListingRecommendation = "Buy" | "Wait" | "Skip";

export type AppPage = "Dashboard" | "Explore" | "Profile";

export interface OnboardingProfile {
  location: string;
  apartmentType: ApartmentType;
  moveInDate: string;
  totalBudget: number;
  preference: Preference;
  stylePreference: string;
  ownedItems: string[];
}

export interface ChecklistItem {
  id: string;
  name: string;
  category: ChecklistCategory;
  priority: Priority;
  suggestedBudget: number;
  status: ChecklistStatus;
  sourceIds: string[];
}

export interface Listing {
  id: string;
  title: string;
  price: number;
  source: string;
  url: string;
  checklistItemId: string;
  category: ChecklistCategory;
  condition: "new" | "used" | "open-box" | "refurbished" | "unknown" | "N/A";
  logistics: string;
  distance?: number;
  notes?: string;
  savedFrom?: "manual" | "explore";
}

export interface ListingAssessment {
  recommendation: ListingRecommendation;
  explanation: string;
}

export interface ExploreItem {
  id: string;
  title: string;
  price: number;
  source: string;
  url: string;
  checklistItemId: string;
  category: ChecklistCategory;
  condition: Listing["condition"];
  logistics: string;
  notes: string;
}

export interface SavedPlan {
  activePage: AppPage;
  profile: OnboardingProfile;
  checklist: ChecklistItem[];
  listings: Listing[];
}
