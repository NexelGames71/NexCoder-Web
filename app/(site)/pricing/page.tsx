import Link from "next/link";
import type { Metadata } from "next";

import PricingPlans from "../../../components/marketing/PricingPlans";
import Section from "../../../components/marketing/Section";
import { PRICING_FEATURE_ROWS } from "../../../lib/site-content";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "NexCoder pricing for daily and weekly AI coding usage, Agent Mesh, teams, and enterprise deployments.",
  alternates: { canonical: "/pricing" },
};

const usagePrinciples = [
  {
    title: "Starter resets daily",
    body: "Starter includes daily usage only. That allowance resets every 24 hours.",
  },
  {
    title: "Paid plans reset faster",
    body: "Plus, Pro, and Premium include daily usage that refreshes every 5 hours.",
  },
  {
    title: "Weekly usage lasts 7 days",
    body: "Paid plans also include a weekly usage bank that resets every 7 days.",
  },
];

const usageExamples = [
  ["Ask or Scan", "Light code questions, summaries, repository mapping", "Low"],
  ["Agent, Edit, Debug", "Multi-step changes, test runs, repair loops", "Medium"],
  ["Deep Thinker", "Deeper reasoning and complex architecture work", "High"],
  ["Agent Mesh", "Coordinated explorer, implementation, test, and review units", "Variable"],
];

export default function PricingPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-[#050505] px-4 py-12 text-white sm:px-6 md:py-20">
        <div className="docs-hero-grid absolute inset-0" aria-hidden />
        <div className="pricing-meter absolute inset-x-0 bottom-0 h-px" aria-hidden />
        <div className="relative mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-center">
            <div className="pricing-rise">
              <p className="inline-flex rounded-full border border-accent-cyan/40 bg-accent-blue/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-accent-cyan">
                Pricing
              </p>
              <h1 className="mt-6 max-w-4xl text-3xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
                Daily and weekly usage for serious AI coding.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
                NexCoder plans are built around usage windows users can understand: Starter
                gets a simple daily reset, while paid plans add faster daily refreshes and a
                7-day weekly usage bank.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/download"
                  className="inline-flex justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-shell transition hover:-translate-y-0.5 hover:bg-white/90"
                >
                  Download NexCoder
                </Link>
                <a
                  href="#plans"
                  className="inline-flex justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-white/10"
                >
                  Compare plans
                </a>
              </div>
            </div>

            <div className="pricing-rise pricing-delay-2 rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_24px_90px_rgba(34,201,255,0.12)] backdrop-blur sm:p-5">
              <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <p className="text-sm font-semibold text-white">Usage reset model</p>
                  <p className="mt-1 text-xs text-white/50">Daily and weekly allowances</p>
                </div>
                <span className="rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-3 py-1 text-xs font-semibold text-accent-cyan">
                  Resets
                </span>
              </div>
              <div className="mt-5 space-y-3">
                {usagePrinciples.map((item, index) => (
                  <article
                    key={item.title}
                    className="pricing-rise rounded-lg border border-white/10 bg-[#0b0b10] p-4 transition hover:-translate-y-1 hover:border-accent-cyan/35 hover:bg-white/[0.06]"
                    style={{ animationDelay: `${120 + index * 90}ms` }}
                  >
                    <h2 className="text-sm font-semibold text-white">{item.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-white/60">{item.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <PricingPlans />

      <Section
        id="usage"
        title="How usage works"
        subtitle="NexCoder uses two reset windows: daily usage for regular flow and weekly usage for heavier bursts."
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="rounded-lg border border-line bg-panel p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-ink">What consumes usage?</h3>
            <p className="mt-3 text-sm leading-7 text-muted">
              Ask, Scan, Agent, Edit, Debug, Plan, vision, Deep Thinker, and Agent Mesh all
              count against plan usage. Starter only has daily usage. Plus, Pro, Premium, and
              team plans include daily and weekly allowances.
            </p>
            <div className="mt-6 grid gap-3">
              {usageExamples.map(([name, body, level]) => (
                <div key={name} className="rounded-lg border border-line bg-shell p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-medium text-ink">{name}</p>
                    <span className="w-fit rounded-full border border-line px-3 py-1 text-xs text-muted">
                      {level} usage
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-line bg-gradient-to-br from-accent-blue/15 via-panel to-accent-violet/10 p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-ink">Recommended product rules</h3>
            <ul className="mt-4 space-y-4 text-sm leading-6 text-muted">
              <li className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-accent-blue" aria-hidden />
                Show daily remaining, weekly remaining, and the next reset time in the AI panel.
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-accent-cyan" aria-hidden />
                Starter should stop at its daily limit and reset after 24 hours.
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-accent-violet" aria-hidden />
                Paid plans should refresh daily usage every 5 hours and weekly usage every 7 days.
              </li>
            </ul>
            <div className="mt-6 rounded-lg border border-white/10 bg-shell/80 p-4">
              <p className="text-sm font-semibold text-ink">Launch note</p>
              <p className="mt-2 text-sm leading-6 text-muted">
                Final public unit counts should be adjusted after real telemetry shows median
                and high-end usage per mode.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section
        title="Compare limits"
        subtitle="Starter has daily usage only. Paid plans include both daily and weekly usage windows."
        className="bg-shell"
      >
        <div className="overflow-x-auto rounded-lg border border-line bg-panel shadow-soft">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                <th className="px-5 py-4">Feature</th>
                <th className="px-5 py-4">Starter</th>
                <th className="px-5 py-4">Plus</th>
                <th className="px-5 py-4">Pro</th>
                <th className="px-5 py-4">Premium</th>
                <th className="px-5 py-4">Business Standard</th>
                <th className="px-5 py-4">Business Plus</th>
              </tr>
            </thead>
            <tbody>
              {PRICING_FEATURE_ROWS.map((row) => (
                <tr key={row[0]} className="border-b border-line/60 last:border-0">
                  {row.map((cell, index) => (
                    <td
                      key={`${row[0]}-${index}`}
                      className={`px-5 py-4 ${index === 0 ? "font-medium text-ink" : "text-muted"}`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <section className="px-4 py-12 sm:px-6 md:py-16">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 rounded-lg border border-line bg-panel p-6 shadow-soft md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-cyan">
              Ready to build
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink md:text-3xl">
              Download NexCoder and start on Starter.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
              Upgrade when you need weekly usage, faster daily resets, team controls, or enterprise security.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/download"
              className="inline-flex justify-center rounded-full bg-ink px-6 py-3 text-sm font-semibold text-shell transition hover:-translate-y-0.5 hover:opacity-90"
            >
              Start free
            </Link>
            <Link
              href="/docs"
              className="inline-flex justify-center rounded-full border border-ink/20 px-6 py-3 text-sm font-medium text-ink transition hover:-translate-y-0.5 hover:bg-ink hover:text-shell"
            >
              Read docs
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
