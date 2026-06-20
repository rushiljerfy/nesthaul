"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createBrowserSupabaseClient, isSupabaseConfigured } from "./supabase";

function emailFromUser(user: User | null | undefined) {
  return user?.email ?? null;
}

export function useAuth() {
  const client = useMemo(() => createBrowserSupabaseClient(), []);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(client));

  useEffect(() => {
    if (!client) {
      return;
    }

    let isMounted = true;

    client.auth.getSession().then(({ data }) => {
      if (!isMounted) {
        return;
      }

      setUserEmail(emailFromUser(data.session?.user));
      setUserId(data.session?.user.id ?? null);
      setIsLoading(false);
    });

    const { data } = client.auth.onAuthStateChange((_event, session) => {
      setUserEmail(emailFromUser(session?.user));
      setUserId(session?.user.id ?? null);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, [client]);

  async function logout() {
    if (!client) {
      setUserEmail(null);
      return;
    }

    await client.auth.signOut();
    setUserId(null);
    setUserEmail(null);
  }

  return {
    isConfigured: isSupabaseConfigured(),
    isLoading,
    logout,
    userId,
    userEmail
  };
}
