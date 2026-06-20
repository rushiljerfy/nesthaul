import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { loadPlanFromSupabase, migrateLocalPlanToSupabase, savePlanToSupabase } from "@/lib/supabase-persistence";
import { useAuth } from "@/lib/useAuth";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NestHaulApp } from "./NestHaulApp";

vi.mock("@/lib/useAuth", () => ({
  useAuth: vi.fn()
}));

vi.mock("@/lib/supabase", () => ({
  createBrowserSupabaseClient: vi.fn()
}));

vi.mock("@/lib/supabase-persistence", () => ({
  loadPlanFromSupabase: vi.fn(),
  migrateLocalPlanToSupabase: vi.fn(),
  savePlanToSupabase: vi.fn()
}));

const mockUseAuth = vi.mocked(useAuth);
const mockCreateBrowserSupabaseClient = vi.mocked(createBrowserSupabaseClient);
const mockLoadPlanFromSupabase = vi.mocked(loadPlanFromSupabase);
const mockMigrateLocalPlanToSupabase = vi.mocked(migrateLocalPlanToSupabase);
const mockSavePlanToSupabase = vi.mocked(savePlanToSupabase);

const supabaseClient = { from: vi.fn() };

const savedSupabasePlan = {
  activePage: "Dashboard",
  profile: {
    location: "Queens, NY",
    apartmentType: "studio",
    moveInDate: "2026-08-01",
    totalBudget: 1800,
    preference: "mix",
    stylePreference: "warm minimal",
    ownedItems: ["mattress"]
  },
  checklist: [
    {
      id: "desk",
      name: "Desk or work table",
      category: "Work",
      priority: "soon",
      suggestedBudget: 125,
      status: "saved",
      sourceIds: ["real-simple-first-apartment"]
    }
  ],
  listings: [
    {
      id: "explore-desk",
      title: "Compact desk",
      price: 95,
      source: "Explore",
      url: "https://example.com/desk",
      checklistItemId: "desk",
      category: "Work",
      condition: "new",
      logistics: "delivery available",
      savedFrom: "explore"
    }
  ]
} as const;

describe("NestHaul app workflow", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    vi.clearAllMocks();
    mockCreateBrowserSupabaseClient.mockReturnValue(supabaseClient as never);
    mockLoadPlanFromSupabase.mockResolvedValue(null);
    mockMigrateLocalPlanToSupabase.mockResolvedValue(null);
    mockSavePlanToSupabase.mockResolvedValue();
    mockUseAuth.mockReturnValue({
      isConfigured: false,
      isLoading: false,
      logout: vi.fn(),
      userId: null,
      userEmail: null
    });
  });

  it("opens directly to Explore with the three page app shell", async () => {
    render(<NestHaulApp />);

    expect(screen.getByRole("button", { name: /^explore$/i })).toHaveAttribute("aria-current", "page");
    expect(screen.getByText(/explore starter picks/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^dashboard$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^explore$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^profile$/i })).toBeInTheDocument();
  });

  it("keeps Dashboard and Profile available from the default Explore start", async () => {
    render(<NestHaulApp />);

    await userEvent.click(screen.getByRole("button", { name: /^dashboard$/i }));

    expect(screen.getByText(/apartment essentials by category/i)).toBeInTheDocument();
    expect(screen.getByText(/compare options before you buy/i)).toBeInTheDocument();
    expect(screen.getByText("Planned spend").parentElement).toHaveTextContent("$0");
    expect(screen.queryByText(/research notes/i)).not.toBeInTheDocument();
    expect(screen.getByText(/sign up to save your plan across devices/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /^profile$/i }));

    expect(screen.getByLabelText(/where are you moving to/i)).toBeInTheDocument();
    expect(screen.getByText(/sign up to save your plan across devices/i)).toBeInTheDocument();
  });

  it("lets logged-out users edit setup answers without restoring them next session", async () => {
    const { unmount } = render(<NestHaulApp />);

    await userEvent.click(screen.getByRole("button", { name: /^profile$/i }));
    await userEvent.clear(screen.getByLabelText(/where are you moving to/i));
    await userEvent.type(screen.getByLabelText(/where are you moving to/i), "Queens, NY");
    await userEvent.type(screen.getByLabelText(/move-in date/i), "2026-08-01");
    await userEvent.clear(screen.getByLabelText(/total budget/i));
    await userEvent.type(screen.getByLabelText(/total budget/i), "1800");
    await userEvent.type(screen.getByLabelText(/style preference/i), "warm minimal");
    await userEvent.click(screen.getByRole("button", { name: /save profile/i }));

    expect(screen.getByText(/profile updated/i)).toBeInTheDocument();

    unmount();
    render(<NestHaulApp />);

    await userEvent.click(screen.getByRole("button", { name: /^profile$/i }));

    expect(screen.getByLabelText(/where are you moving to/i)).toHaveValue("Queens, NY");
    expect(screen.getByLabelText(/total budget/i)).toHaveValue(1800);
    expect(window.localStorage.getItem("nesthaul-plan")).toBeNull();
    expect(window.sessionStorage.getItem("nesthaul-session-plan")).toContain("Queens, NY");
  });

  it("saves Explore items to the Dashboard saved listings", async () => {
    render(<NestHaulApp />);

    const firstExploreItem = screen.getAllByTestId("explore-item")[0];
    const title = within(firstExploreItem).getByRole("heading").textContent;
    await userEvent.click(within(firstExploreItem).getByRole("button", { name: /save to list/i }));

    expect(within(firstExploreItem).getByText(/saved/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /^dashboard$/i }));

    expect(screen.getByText(title ?? "")).toBeInTheDocument();
    expect(screen.getByText(/saved from explore/i)).toBeInTheDocument();
  });

  it("removes saved Dashboard items from UI, Explore saved state, and localStorage", async () => {
    render(<NestHaulApp />);

    const firstExploreItem = screen.getAllByTestId("explore-item")[0];
    const title = within(firstExploreItem).getByRole("heading").textContent ?? "";
    await userEvent.click(within(firstExploreItem).getByRole("button", { name: /save to list/i }));

    await userEvent.click(screen.getByRole("button", { name: /^dashboard$/i }));
    await userEvent.click(screen.getByRole("button", { name: new RegExp(`remove ${title}`, "i") }));

    expect(screen.queryByText(title)).not.toBeInTheDocument();

    await waitFor(() => {
      expect(window.localStorage.getItem("nesthaul-plan")).toBeNull();
    });

    await userEvent.click(screen.getByRole("button", { name: /^explore$/i }));

    const itemAgain = screen.getAllByTestId("explore-item")[0];
    expect(within(itemAgain).getByRole("button", { name: /save to list/i })).toBeEnabled();
  });

  it("renders scrollable Explore carousels with at least seven items per category", async () => {
    render(<NestHaulApp />);

    for (const category of ["Sleep", "Work", "Kitchen", "Bathroom", "Cleaning", "Storage", "Living"]) {
      const group = screen.getByRole("region", { name: category });

      expect(within(group).getAllByTestId("explore-item").length).toBeGreaterThanOrEqual(7);
    }
  });

  it("loads logged-in user data from Supabase and saves changes back", async () => {
    mockUseAuth.mockReturnValue({
      isConfigured: true,
      isLoading: false,
      logout: vi.fn(),
      userId: "user-123",
      userEmail: "rushil@example.com"
    });
    mockLoadPlanFromSupabase.mockResolvedValue(savedSupabasePlan);

    render(<NestHaulApp />);

    await waitFor(() => {
      expect(mockLoadPlanFromSupabase).toHaveBeenCalledWith(supabaseClient, "user-123");
    });

    expect(screen.getByRole("button", { name: /^explore$/i })).toHaveAttribute("aria-current", "page");
    await userEvent.click(screen.getByRole("button", { name: /^dashboard$/i }));
    expect(screen.getByText("Compact desk")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /remove compact desk/i }));

    await waitFor(() => {
      expect(mockSavePlanToSupabase).toHaveBeenLastCalledWith(
        supabaseClient,
        "user-123",
        expect.objectContaining({ listings: [] })
      );
    });
    expect(window.localStorage.getItem("nesthaul-plan:rushil@example.com")).toBeNull();
  });

  it("migrates a session plan to Supabase when a user logs in", async () => {
    window.sessionStorage.setItem("nesthaul-session-plan", JSON.stringify(savedSupabasePlan));
    mockUseAuth.mockReturnValue({
      isConfigured: true,
      isLoading: false,
      logout: vi.fn(),
      userId: "user-123",
      userEmail: "rushil@example.com"
    });
    mockMigrateLocalPlanToSupabase.mockResolvedValue(savedSupabasePlan);

    render(<NestHaulApp />);

    await waitFor(() => {
      expect(mockMigrateLocalPlanToSupabase).toHaveBeenCalledWith(supabaseClient, "user-123", savedSupabasePlan);
    });

    expect(window.sessionStorage.getItem("nesthaul-session-plan")).toBeNull();
  });
});
