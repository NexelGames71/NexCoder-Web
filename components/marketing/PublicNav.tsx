"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BRAND, NAV_LINKS } from "../../lib/site-content";
import { createClient, isSupabaseConfigured } from "../../lib/supabase/client";

export default function PublicNav() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) =>
      setEmail(session?.user?.email ?? null),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signOut() {
    if (isSupabaseConfigured()) await createClient().auth.signOut();
    setEmail(null);
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-shell/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight text-ink">
          <img src="/nexcoder-logo.png" alt="" className="h-8 w-8 object-contain" />
          {BRAND.name}
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted transition hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {email ? (
            <>
              <Link href="/account" className="text-sm text-muted transition hover:text-ink">
                Account
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition hover:border-ink/30"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-muted transition hover:text-ink">
                Sign in
              </Link>
              <Link
                href="/download"
                className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-shell transition hover:opacity-90"
              >
                Get NexCoder
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-lg border border-line px-3 py-2 text-sm md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
        >
          Menu
        </button>
      </div>

      {open ? (
        <div className="border-t border-line bg-panel px-5 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-ink"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {email ? (
              <>
                <Link href="/account" className="text-sm text-ink" onClick={() => setOpen(false)}>
                  Account
                </Link>
                <button
                  type="button"
                  onClick={signOut}
                  className="rounded-full border border-line px-4 py-2 text-center text-sm font-medium text-ink"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-ink" onClick={() => setOpen(false)}>
                  Sign in
                </Link>
                <Link
                  href="/download"
                  className="rounded-full bg-ink px-4 py-2 text-center text-sm font-medium text-shell"
                  onClick={() => setOpen(false)}
                >
                  Get NexCoder
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
