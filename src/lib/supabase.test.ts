import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { createBrowserSupabaseClient, isSupabaseConfigured } from "./supabase";

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({ auth: {} }))
}));

describe("Supabase client config", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it("uses only the public Supabase URL and anon key", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://nesthaul.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "public-anon-key");

    expect(isSupabaseConfigured()).toBe(true);
    expect(createBrowserSupabaseClient()).toEqual({ auth: {} });
    expect(createClient).toHaveBeenCalledWith("https://nesthaul.supabase.co", "public-anon-key");
  });

  it("does not create a client from placeholders or missing values", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "your_project_url");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "your_anon_or_publishable_key");

    expect(isSupabaseConfigured()).toBe(false);
    expect(createBrowserSupabaseClient()).toBeNull();
    expect(createClient).not.toHaveBeenCalled();
  });
});
