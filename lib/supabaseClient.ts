"use client";

import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase public env vars", {
    hasUrl: !!supabaseUrl,
    hasAnon: !!supabaseAnonKey,
  });
}

export const supabaseClient = createBrowserClient(
  supabaseUrl ?? "",
  supabaseAnonKey ?? ""
);
