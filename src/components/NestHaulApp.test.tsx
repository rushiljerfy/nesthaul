import { render, screen, within } from "@testing-library/react";
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

    await userEvent.click(screen.getByRole("button", { name: /^explore$/i }));

    expect(screen.getByText(/explore starter picks/i)).toBeInTheDocument();
    expect(screen.queryByText(/apartment essentials by category/i)).not.toBeInTheDocument();
  });

  it("lets users edit setup answers on Profile and persists them", async () => {
    const { unmount } = render(<NestHaulApp />);

    await completeOnboarding();
    await userEvent.click(screen.getByRole("button", { name: /^profile$/i }));
    await userEvent.clear(screen.getByLabelText(/location/i));
    await userEvent.type(screen.getByLabelText(/location/i), "Queens, NY");
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
});
