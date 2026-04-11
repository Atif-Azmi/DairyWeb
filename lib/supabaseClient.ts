"use client";

import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export type BrowserSupabaseClient = ReturnType<typeof createBrowserClient>;

function missingEnvMessage() {
  return (
    "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY " +
    "in your environment (e.g. Vercel Project Settings → Environment Variables), then redeploy."
  );
}

function createNoopSupabase(): BrowserSupabaseClient {
  const err = () => {
    throw new Error(missingEnvMessage());
  };

  // Minimal stub so importing this module during `next build` / SSR doesn't crash
  // when public env vars are not available at build time.
  return new Proxy({} as BrowserSupabaseClient, {
    get() {
      return err;
    },
  });
}

function createRealSupabase(): BrowserSupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[supabaseClient] Missing Supabase public env vars", {
      hasUrl: !!supabaseUrl,
      hasAnon: !!supabaseAnonKey,
    });
    return createNoopSupabase();
  }

  if (typeof window === "undefined") {
    return createNoopSupabase();
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Important: do NOT call createBrowserClient with empty strings at module scope.
// Vercel builds can prerender client components without your env vars unless you add them.
export const supabaseClient: BrowserSupabaseClient = createRealSupabase();
