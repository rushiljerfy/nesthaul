import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AuthForm } from "./AuthForm";

describe("AuthForm", () => {
  it("submits login credentials to Supabase auth", async () => {
    const signInWithPassword = vi.fn().mockResolvedValue({ error: null });
    render(
      <AuthForm
        mode="login"
        supabaseClient={{ auth: { signInWithPassword } }}
      />
    );

    await userEvent.type(screen.getByLabelText(/email/i), "rushil@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "password123");
    await userEvent.click(screen.getByRole("button", { name: /log in/i }));

    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "rushil@example.com",
      password: "password123"
    });
  });

  it("submits signup credentials to Supabase auth", async () => {
    const signUp = vi.fn().mockResolvedValue({ error: null });
    render(
      <AuthForm
        mode="signup"
        supabaseClient={{ auth: { signUp } }}
      />
    );

    await userEvent.type(screen.getByLabelText(/email/i), "rushil@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "password123");
    await userEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(signUp).toHaveBeenCalledWith({
      email: "rushil@example.com",
      password: "password123"
    });
  });
});
