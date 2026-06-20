import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AppNav } from "./AppNav";

describe("AppNav auth display", () => {
  it("shows logged-out account links when no user email exists", () => {
    render(<AppNav activePage="Dashboard" onNavigate={vi.fn()} />);

    expect(screen.getByRole("link", { name: /log in/i })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: /sign up/i })).toHaveAttribute("href", "/signup");
  });

  it("shows the user email and logout button when logged in", async () => {
    const onLogout = vi.fn();
    render(
      <AppNav
        activePage="Dashboard"
        onNavigate={vi.fn()}
        userEmail="rushil@example.com"
        onLogout={onLogout}
      />
    );

    expect(screen.getByText("rushil@example.com")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /log out/i }));

    expect(onLogout).toHaveBeenCalled();
  });
});
