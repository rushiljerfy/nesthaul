"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { Button, Card, FormField, TextInput } from "./ui";

type AuthMode = "login" | "signup";

interface AuthFormClient {
  auth: {
    signInWithPassword?: (credentials: { email: string; password: string }) => Promise<{ error: { message: string } | null }>;
    signUp?: (credentials: { email: string; password: string }) => Promise<{ error: { message: string } | null }>;
  };
}

interface AuthFormProps {
  mode: AuthMode;
  supabaseClient?: AuthFormClient | null;
}

const copy = {
  login: {
    eyebrow: "Welcome back",
    title: "Log in to keep planning.",
    body: "Pick up your saved checklist, budget, and listings.",
    button: "Log in",
    success: "You are logged in."
  },
  signup: {
    eyebrow: "Create account",
    title: "Start your move-in plan.",
    body: "Save your setup answers and compare items across devices.",
    button: "Sign up",
    success: "Account created. Check your email if confirmation is enabled."
  }
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function AuthForm({ mode, supabaseClient }: AuthFormProps) {
  const router = useRouter();
  const client = useMemo(() => supabaseClient ?? createBrowserSupabaseClient(), [supabaseClient]);
  const [activeMode, setActiveMode] = useState<AuthMode>(mode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modeCopy = copy[activeMode];

  function switchMode(nextMode: AuthMode) {
    setActiveMode(nextMode);
    setError(null);
    setStatus(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus(null);

    if (!client) {
      setError("Add your public Supabase URL and anon key to .env.local, then restart the app.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      const credentials = { email: email.trim(), password };
      const result =
        activeMode === "login"
          ? client.auth.signInWithPassword
            ? await client.auth.signInWithPassword(credentials)
            : { error: { message: "Login is not available." } }
          : client.auth.signUp
            ? await client.auth.signUp(credentials)
            : { error: { message: "Signup is not available." } };

      if (result.error) {
        setError(result.error.message);
        return;
      }

      setStatus(modeCopy.success);

      if (activeMode === "login") {
        router.push("/");
      }
    } catch {
      setError("Authentication failed. Check your Supabase settings and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="auth-page">
      <Card className="auth-card">
        <Link className="wordmark" href="/">
          NestHaul
        </Link>
        <div className="auth-heading">
          <p className="eyebrow">{modeCopy.eyebrow}</p>
          <h1>{modeCopy.title}</h1>
          <p>{modeCopy.body}</p>
        </div>

        {error ? (
          <div className="form-errors" role="alert">
            <p>{error}</p>
          </div>
        ) : null}
        {status ? (
          <div className="success-message" role="status">
            {status}
          </div>
        ) : null}

        <form className="auth-form" noValidate onSubmit={handleSubmit}>
          <div className="auth-mode-switch" aria-label="Authentication options">
            <button
              aria-label="Show log in form"
              aria-pressed={activeMode === "login"}
              type="button"
              onClick={() => switchMode("login")}
            >
              Log in
            </button>
            <button
              aria-label="Show sign up form"
              aria-pressed={activeMode === "signup"}
              type="button"
              onClick={() => switchMode("signup")}
            >
              Sign up
            </button>
          </div>
          <FormField label="Email">
            <TextInput
              autoComplete="email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </FormField>
          <FormField label="Password">
            <TextInput
              autoComplete={activeMode === "login" ? "current-password" : "new-password"}
              minLength={6}
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </FormField>
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? "Working..." : modeCopy.button}
          </Button>
        </form>
      </Card>
    </section>
  );
}
