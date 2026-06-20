import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthForm } from "./AuthForm";

const pushMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock
  })
}));

describe("AuthForm", () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

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
    await userEvent.click(screen.getByRole("button", { name: /^log in$/i }));

    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "rushil@example.com",
      password: "password123"
    });
    expect(pushMock).toHaveBeenCalledWith("/");
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
    await userEvent.click(screen.getByRole("button", { name: /^sign up$/i }));

    expect(signUp).toHaveBeenCalledWith({
      email: "rushil@example.com",
      password: "password123"
    });
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("lets users switch between login and signup on the same page", async () => {
    const signUp = vi.fn().mockResolvedValue({ error: null });
    render(
      <AuthForm
        mode="login"
        supabaseClient={{ auth: { signUp } }}
      />
    );

    expect(screen.getByRole("button", { name: /^log in$/i })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /show sign up form/i }));
    await userEvent.type(screen.getByLabelText(/email/i), "rushil@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "password123");
    await userEvent.click(screen.getByRole("button", { name: /^sign up$/i }));

    expect(signUp).toHaveBeenCalledWith({
      email: "rushil@example.com",
      password: "password123"
    });
  });

  it("blocks signup when the email is not valid", async () => {
    const signUp = vi.fn().mockResolvedValue({ error: null });
    render(<AuthForm mode="signup" supabaseClient={{ auth: { signUp } }} />);

    await userEvent.type(screen.getByLabelText(/email/i), "rushil");
    await userEvent.type(screen.getByLabelText(/password/i), "password123");
    await userEvent.click(screen.getByRole("button", { name: /^sign up$/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/valid email/i);
    expect(signUp).not.toHaveBeenCalled();
  });
});
