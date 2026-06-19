import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { OnboardingForm } from "./OnboardingForm";

describe("OnboardingForm", () => {
  it("validates required fields before creating a plan", async () => {
    const onComplete = vi.fn();
    render(<OnboardingForm onComplete={onComplete} />);

    await userEvent.click(screen.getByRole("button", { name: /create my plan/i }));

    expect(await screen.findByText(/location is required/i)).toBeInTheDocument();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("submits a complete onboarding profile", async () => {
    const onComplete = vi.fn();
    render(<OnboardingForm onComplete={onComplete} />);

    await userEvent.type(screen.getByLabelText(/location/i), "Brooklyn, NY");
    await userEvent.selectOptions(screen.getByLabelText(/apartment type/i), "studio");
    await userEvent.type(screen.getByLabelText(/move-in date/i), "2026-08-01");
    await userEvent.type(screen.getByLabelText(/total budget/i), "1500");
    await userEvent.selectOptions(screen.getByLabelText(/new\/used preference/i), "mix");
    await userEvent.type(screen.getByLabelText(/style preference/i), "warm minimal");
    await userEvent.type(screen.getByLabelText(/items already owned/i), "mattress, towels");
    await userEvent.click(screen.getByRole("button", { name: /create my plan/i }));

    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        location: "Brooklyn, NY",
        apartmentType: "studio",
        totalBudget: 1500,
        ownedItems: ["mattress", "towels"]
      })
    );
  });
});
