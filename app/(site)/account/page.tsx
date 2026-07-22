import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "../../../lib/supabase/server";

export const metadata: Metadata = {
  title: "Account",
  description: "Manage your NexCoder account, plan, and usage.",
};

type Profile = { full_name: string | null; plan: string | null; usage_count: number | null };

export default async function AccountPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/account");

  // The profiles table is optional until the schema SQL is applied.
  let profile: Profile | null = null;
  let profileMissing = false;
  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, plan, usage_count")
    .eq("id", user.id)
    .maybeSingle();
  if (error) profileMissing = true;
  else profile = data;

  const plan = profile?.plan ?? "free";
  const usage = profile?.usage_count ?? 0;

  return (
    <section className="px-5 py-16">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-violet">Account</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          {profile?.full_name ? `Welcome, ${profile.full_name}.` : "Your account"}
        </h1>
        <p className="mt-2 text-sm text-muted">{user.email}</p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <div className="rounded-3xl border border-line bg-panel p-6 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Plan</p>
            <p className="mt-2 text-2xl font-semibold capitalize text-ink">{plan}</p>
            <p className="mt-3 text-sm leading-6 text-muted">
              Subscriptions unlock at launch. You will be able to upgrade and manage billing here.
            </p>
            <button
              type="button"
              disabled
              className="mt-4 cursor-not-allowed rounded-full border border-line px-5 py-2 text-sm font-medium text-muted"
            >
              Manage subscription (coming soon)
            </button>
          </div>

          <div className="rounded-3xl border border-line bg-panel p-6 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Usage this period</p>
            <p className="mt-2 text-2xl font-semibold text-ink">{usage.toLocaleString()}</p>
            <p className="mt-3 text-sm leading-6 text-muted">
              Agent runs and tokens will be tracked here against your plan limits.
            </p>
          </div>
        </div>

        {profileMissing && (
          <p className="mt-6 rounded-2xl border border-line bg-shell px-4 py-3 text-sm text-muted">
            Profile storage isn&apos;t set up yet. Apply <code className="rounded bg-line px-1.5 py-0.5 text-xs text-ink">supabase/schema.sql</code>{" "}
            in the Supabase SQL editor to enable plan &amp; usage tracking.
          </p>
        )}

        <form action="/auth/signout" method="post" className="mt-10">
          <button
            type="submit"
            className="rounded-full border border-line px-6 py-3 text-sm font-medium text-ink transition hover:border-ink/30"
          >
            Sign out
          </button>
        </form>
      </div>
    </section>
  );
}
