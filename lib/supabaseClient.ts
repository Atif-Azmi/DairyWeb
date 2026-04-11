"use client";

import { createBrowserClient, type SupabaseClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function missingEnvMessage() {
  return (
    "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY " +
    "in your environment (e.g. Vercel Project Settings → Environment Variables), then redeploy."
  );
}

function createNoopSupabase(): SupabaseClient {
  const err = () => {
    throw new Error(missingEnvMessage());
  };

  // Minimal stub so importing this module during `next build` / SSR doesn't crash.
  // Real pages still need env vars at runtime in the browser.
  return new Proxy({} as SupabaseClient, {
    get() {
      return err;
    },
  });
}

let cached: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient {
  if (cached) return cached;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[supabaseClient] Missing Supabase public env vars", {
      hasUrl: !!supabaseUrl,
      hasAnon: !!supabaseAnonKey,
    });
    cached = createNoopSupabase();
    return cached;
  }

  // During prerender/build there is no browser; avoid constructing a real client unnecessarily.
  if (typeof window === "undefined") {
    cached = createNoopSupabase();
    return cached;
  }

  cached = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return cached;
}

// Back-compat for existing imports: lazily resolves to a real client in the browser.
export const supabaseClient: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseBrowserClient();
    const value = (client as any)[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});
