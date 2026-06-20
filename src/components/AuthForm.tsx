"use client";

import { FormEvent, useMemo, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase";

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
    title: "Log in to NestHaul.",
    button: "Log in",
    success: "You are logged in."
  },
  signup: {
    eyebrow: "Create account",
    title: "Sign up for NestHaul.",
    button: "Sign up",
    success: "Account created. Check your email if confirmation is enabled."
  }
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function AuthForm({ mode, supabaseClient }: AuthFormProps) {
  const client = useMemo(() => supabaseClient ?? createBrowserSupabaseClient(), [supabaseClient]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modeCopy = copy[mode];

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
        mode === "login"
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
    } catch {
      setError("Authentication failed. Check your Supabase settings and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="section-shell auth-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{modeCopy.eyebrow}</p>
          <h2>{modeCopy.title}</h2>
        </div>
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
        <label>
          Email
          <input
            autoComplete="email"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>
        <label>
          Password
          <input
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={6}
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>
        <button className="primary-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Working..." : modeCopy.button}
        </button>
      </form>
    </section>
  );
}
