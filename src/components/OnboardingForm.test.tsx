import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { OnboardingForm } from "./OnboardingForm";

describe("OnboardingForm", () => {
  it("validates required fields before creating a plan", async () => {
    const onComplete = vi.fn();
    render(<OnboardingForm onComplete={onComplete} />);

    await userEvent.click(screen.getByRole("button", { name: /next/i }));

    expect(await screen.findByText(/location is required/i)).toBeInTheDocument();
    expect(screen.getByText(/total budget must be greater than 0/i)).toBeInTheDocument();
    expect(screen.getByText(/new\/used preference is required/i)).toBeInTheDocument();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("submits a profile from the multi-step onboarding flow", async () => {
    const onComplete = vi.fn();
    render(<OnboardingForm onComplete={onComplete} />);

    await userEvent.type(screen.getByLabelText(/where are you moving to/i), "Brooklyn, NY");
    await userEvent.type(screen.getByLabelText(/total budget/i), "1500");
    await userEvent.selectOptions(screen.getByLabelText(/new\/used preference/i), "mix");
    await userEvent.click(screen.getByRole("button", { name: /next/i }));
    await userEvent.click(screen.getByLabelText(/mattress/i));
    await userEvent.type(screen.getByLabelText(/other/i), "towels");
    await userEvent.click(screen.getByRole("button", { name: /continue/i }));
    await userEvent.selectOptions(screen.getByLabelText(/apartment type/i), "studio");
    await userEvent.type(screen.getByLabelText(/move-in date/i), "2026-08-01");
    await userEvent.type(screen.getByLabelText(/style preference/i), "warm minimal");
    await userEvent.click(screen.getByRole("button", { name: /create my plan/i }));

    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        location: "Brooklyn, NY",
        apartmentType: "studio",
        totalBudget: 1500,
        ownedItems: ["Mattress", "towels"]
      })
    );
  });

  it("allows optional setup fields to be skipped", async () => {
    const onComplete = vi.fn();
    render(<OnboardingForm onComplete={onComplete} />);

    await userEvent.type(screen.getByLabelText(/where are you moving to/i), "Queens, NY");
    await userEvent.type(screen.getByLabelText(/total budget/i), "1200");
    await userEvent.selectOptions(screen.getByLabelText(/new\/used preference/i), "mostly-used");
    await userEvent.click(screen.getByRole("button", { name: /next/i }));
    await userEvent.click(screen.getByRole("button", { name: /continue/i }));
    await userEvent.click(screen.getByRole("button", { name: /create my plan/i }));

    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        apartmentType: "studio",
        location: "Queens, NY",
        moveInDate: "",
        stylePreference: "",
        totalBudget: 1200
      })
    );
  });
});
