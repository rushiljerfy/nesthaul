import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { NestHaulApp } from "./NestHaulApp";

async function completeOnboarding() {
  await userEvent.click(screen.getByRole("button", { name: /build a move-in plan/i }));
  await userEvent.type(screen.getByLabelText(/location/i), "Brooklyn, NY");
  await userEvent.selectOptions(screen.getByLabelText(/apartment type/i), "studio");
  await userEvent.type(screen.getByLabelText(/move-in date/i), "2026-08-01");
  await userEvent.type(screen.getByLabelText(/total budget/i), "1500");
  await userEvent.selectOptions(screen.getByLabelText(/new\/used preference/i), "mix");
  await userEvent.type(screen.getByLabelText(/style preference/i), "warm minimal");
  await userEvent.type(screen.getByLabelText(/items already owned/i), "mattress");
  await userEvent.click(screen.getByRole("button", { name: /create my plan/i }));
}

describe("NestHaul app workflow", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("creates a three page app after onboarding and keeps checklist/listings on Dashboard", async () => {
    render(<NestHaulApp />);

    await completeOnboarding();

    expect(screen.getByRole("button", { name: /^dashboard$/i })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: /^explore$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^profile$/i })).toBeInTheDocument();
    expect(screen.getByText(/apartment essentials by category/i)).toBeInTheDocument();
    expect(screen.getByText(/compare options before you buy/i)).toBeInTheDocument();
    expect(screen.queryByText(/research notes/i)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /^explore$/i }));

    expect(screen.getByText(/explore starter picks/i)).toBeInTheDocument();
    expect(screen.queryByText(/apartment essentials by category/i)).not.toBeInTheDocument();
  });

  it("lets users edit setup answers on Profile and persists them", async () => {
    const { unmount } = render(<NestHaulApp />);

    await completeOnboarding();
    await userEvent.click(screen.getByRole("button", { name: /^profile$/i }));
    expect(screen.getByLabelText(/where are you moving to/i)).toBeInTheDocument();
    await userEvent.clear(screen.getByLabelText(/where are you moving to/i));
    await userEvent.type(screen.getByLabelText(/where are you moving to/i), "Queens, NY");
    await userEvent.clear(screen.getByLabelText(/total budget/i));
    await userEvent.type(screen.getByLabelText(/total budget/i), "1800");
    await userEvent.click(screen.getByRole("button", { name: /save profile/i }));

    expect(screen.getByText(/profile updated/i)).toBeInTheDocument();

    unmount();
    render(<NestHaulApp />);

    expect(screen.getByText(/Queens, NY/i)).toBeInTheDocument();
    expect(screen.getByText("$1,800")).toBeInTheDocument();
  });

  it("saves Explore items to the Dashboard saved listings", async () => {
    render(<NestHaulApp />);

    await completeOnboarding();
    await userEvent.click(screen.getByRole("button", { name: /^explore$/i }));

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

    await completeOnboarding();
    await userEvent.click(screen.getByRole("button", { name: /^explore$/i }));

    const firstExploreItem = screen.getAllByTestId("explore-item")[0];
    const title = within(firstExploreItem).getByRole("heading").textContent ?? "";
    await userEvent.click(within(firstExploreItem).getByRole("button", { name: /save to list/i }));

    await userEvent.click(screen.getByRole("button", { name: /^dashboard$/i }));
    await userEvent.click(screen.getByRole("button", { name: new RegExp(`remove ${title}`, "i") }));

    expect(screen.queryByText(title)).not.toBeInTheDocument();

    await waitFor(() => {
      expect(window.localStorage.getItem("nesthaul-plan")).not.toContain(title);
    });

    await userEvent.click(screen.getByRole("button", { name: /^explore$/i }));

    const itemAgain = screen.getAllByTestId("explore-item")[0];
    expect(within(itemAgain).getByRole("button", { name: /save to list/i })).toBeEnabled();
  });

  it("renders scrollable Explore carousels with at least seven items per category", async () => {
    render(<NestHaulApp />);

    await completeOnboarding();
    await userEvent.click(screen.getByRole("button", { name: /^explore$/i }));

    for (const category of ["Sleep", "Work", "Kitchen", "Bathroom", "Cleaning", "Storage", "Living"]) {
      const group = screen.getByRole("region", { name: category });

      expect(within(group).getAllByTestId("explore-item").length).toBeGreaterThanOrEqual(7);
    }
  });
});
