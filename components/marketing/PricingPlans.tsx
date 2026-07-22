"use client";

import Link from "next/link";
import { useState } from "react";

import { PRICING_PLANS, TEAM_PRICING_PLANS } from "../../lib/site-content";

type BillingPeriod = "monthly" | "yearly";

function displayPrice(plan: { price: string; annualPrice?: string }, billing: BillingPeriod) {
  if (billing === "yearly" && plan.annualPrice) return plan.annualPrice;
  return plan.price;
}

function displayPeriod(plan: { period: string; annualPrice?: string }, billing: BillingPeriod) {
  if (plan.period === "forever" || plan.period === "contract") return plan.period;
  if (billing === "yearly" && plan.annualPrice) return "per month, billed yearly";
  return plan.period;
}

function billedNote(plan: { annualPrice?: string }, billing: BillingPeriod) {
  if (!plan.annualPrice) return null;
  return billing === "yearly" ? "Save with yearly billing" : `${plan.annualPrice}/mo with yearly billing`;
}

function planHref(href: string, billing: BillingPeriod) {
  if (!href.startsWith("/signup") && !href.startsWith("/api/checkout/polar")) return href;
  const separator = href.includes("?") ? "&" : "?";
  return `${href}${separator}billing=${billing}`;
}

export default function PricingPlans() {
  const [billing, setBilling] = useState<BillingPeriod>("monthly");

  return (
    <>
      <section id="plans" className="border-b border-line px-4 py-12 sm:px-6 md:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-violet">
                Individual plans
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink md:text-3xl">
                Pick the usage window that matches your workflow.
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted md:text-base">
                Prices are launch targets. Starter gets daily usage only; paid plans add both
                daily and weekly usage.
              </p>
            </div>

            <div className="w-full rounded-full border border-line bg-panel p-1 sm:w-auto" aria-label="Billing period">
              <div className="grid grid-cols-2 gap-1">
                {(["monthly", "yearly"] as const).map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => setBilling(period)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      billing === period
                        ? "bg-ink text-shell shadow-soft"
                        : "text-muted hover:bg-shell hover:text-ink"
                    }`}
                    aria-pressed={billing === period}
                  >
                    {period === "monthly" ? "Monthly" : "Yearly"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-4">
            {PRICING_PLANS.map((plan, index) => (
              <article
                key={plan.id}
                className={`pricing-rise flex min-w-0 flex-col rounded-lg border p-5 shadow-soft transition hover:-translate-y-1 ${
                  plan.featured
                    ? "border-accent-cyan/60 bg-gradient-to-b from-accent-blue/20 via-panel to-panel"
                    : "border-line bg-panel"
                }`}
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-cyan">
                    {plan.eyebrow}
                  </p>
                  {plan.featured ? (
                    <span className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-shell">
                      Best start
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-4 text-2xl font-semibold text-ink">{plan.name}</h3>
                <div className="mt-4">
                  <span className="text-4xl font-semibold tracking-tight text-ink">
                    {displayPrice(plan, billing)}
                  </span>
                  <span className="ml-2 text-sm text-muted">{displayPeriod(plan, billing)}</span>
                </div>
                {billedNote(plan, billing) ? (
                  <p className="mt-2 text-sm text-muted">{billedNote(plan, billing)}</p>
                ) : (
                  <p className="mt-2 text-sm text-muted">{plan.usage}</p>
                )}
                {billedNote(plan, billing) ? <p className="mt-2 text-sm text-accent-cyan">{plan.usage}</p> : null}
                <p className="mt-4 min-h-[72px] text-sm leading-6 text-muted">{plan.description}</p>
                <Link
                  href={planHref(plan.href, billing)}
                  className={`mt-6 inline-flex justify-center rounded-full px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5 ${
                    plan.featured
                      ? "bg-ink text-shell hover:opacity-90"
                      : "border border-ink/20 text-ink hover:bg-ink hover:text-shell"
                  }`}
                >
                  {plan.cta}
                </Link>
                <div className="mt-6 border-t border-line pt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Benefits</p>
                  <ul className="mt-4 space-y-3 text-sm text-muted">
                    {plan.benefits.map((benefit) => (
                      <li key={benefit} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-accent-cyan" aria-hidden />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-6 border-t border-line pt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Usage limits</p>
                  <ul className="mt-4 space-y-2 text-sm text-muted">
                    {plan.limits.map((limit) => (
                      <li key={limit}>{limit}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 bg-shell">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-ink md:text-3xl">
              Teams and enterprise
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted md:text-base">
              Business plans add administration, shared controls, pooled usage, team privacy,
              and BugGuard-backed review workflows.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {TEAM_PRICING_PLANS.map((plan) => (
              <article key={plan.name} className="pricing-rise rounded-lg border border-line bg-panel p-6 shadow-soft">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-violet">
                      {plan.name === "Enterprise" ? "For organizations" : "For businesses"}
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold text-ink">{plan.name}</h3>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-3xl font-semibold text-ink">{displayPrice(plan, billing)}</p>
                    <p className="mt-1 text-sm text-muted">{displayPeriod(plan, billing)}</p>
                    {billedNote(plan, billing) ? (
                      <p className="mt-1 text-sm text-accent-cyan">{billedNote(plan, billing)}</p>
                    ) : null}
                  </div>
                </div>
                <p className="mt-5 text-sm leading-7 text-muted">{plan.description}</p>
                <p className="mt-4 rounded-lg border border-line bg-shell p-3 text-sm font-medium text-ink">
                  {plan.usage}
                </p>
                <ul className="mt-5 space-y-3 text-sm text-muted">
                  {plan.benefits.map((benefit) => (
                    <li key={benefit} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-accent-violet" aria-hidden />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={planHref(plan.href, billing)}
                  className="mt-6 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-semibold text-shell transition hover:-translate-y-0.5 hover:opacity-90"
                >
                  {plan.name === "Enterprise" ? "Contact sales" : "Start business plan"}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
