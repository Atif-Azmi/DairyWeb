"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { supabaseClient } from "@/lib/supabaseClient";
import { useI18n } from "@/components/i18n/LanguageProvider";

export default function AppHeader() {
  const [email, setEmail] = useState<string | null>(null);
  const { lang, setLang, t } = useI18n();

  useEffect(() => {
    let cancelled = false;
    supabaseClient.auth.getUser().then(({ data: { user } }) => {
      if (!cancelled) setEmail(user?.email ?? null);
    });
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-end gap-3 border-b border-border bg-white/95 px-4 backdrop-blur md:px-8">
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as "en" | "hi")}
        className="h-9 rounded-md border border-border bg-white px-2 text-sm"
        aria-label={t("header.language")}
      >
        <option value="en">{t("lang.english")}</option>
        <option value="hi">{t("lang.hindi")}</option>
      </select>
      <Link
        href="/settings"
        className="flex max-w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-foreground hover:bg-secondary/70"
      >
        <UserCircleIcon className="h-8 w-8 shrink-0 text-primary" aria-hidden />
        <span className="truncate">{email ?? t("common.profile")}</span>
      </Link>
    </header>
  );
}
