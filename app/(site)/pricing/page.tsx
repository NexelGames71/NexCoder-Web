import Link from "next/link";
import type { Metadata } from "next";

import Section from "../../../components/marketing/Section";
import {
  PRICING_FEATURE_ROWS,
  PRICING_PLANS,
  TEAM_PRICING_PLANS,
} from "../../../lib/site-content";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "NexCoder pricing for local-first coding, hosted AI credits, Agent Mesh, teams, and enterprise deployments.",
  alternates: { canonical: "/pricing" },
};

const usagePrinciples = [
  {
    title: "Local stays unlimited",
    body: "Local GGUF models and bring-your-own OpenAI-compatible endpoints do not consume NexCoder-hosted credits.",
  },
  {
    title: "Hosted usage is credit based",
    body: "Ask, Agent, Edit, Debug, Plan, vision, Deep Thinker, and Agent Mesh consume credits based on hosted model usage.",
  },
  {
    title: "Overage is opt-in",
    body: "Paid plans can add extra usage, but surprise billing should stay off until the user or admin enables it.",
  },
];

const creditExamples = [
  ["Ask or Scan", "Light code questions, summaries, repository mapping", "Low"],
  ["Agent, Edit, Debug", "Multi-step changes, test runs, repair loops", "Medium"],
  ["Deep Thinker", "Long-context reasoning and complex architecture work", "High"],
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
                Start local. Scale into hosted agent power when you need it.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
                NexCoder is priced around the way agentic coding actually works: unlimited local
                and BYO usage, predictable hosted AI credits, and higher limits for deeper agent
                runs.
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
                  <p className="text-sm font-semibold text-white">Hosted usage model</p>
                  <p className="mt-1 text-xs text-white/50">Built for predictable agent costs</p>
                </div>
                <span className="rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-3 py-1 text-xs font-semibold text-accent-cyan">
                  Credits
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

      <section id="plans" className="border-b border-line px-4 py-12 sm:px-6 md:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-violet">
                Individual plans
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink md:text-3xl">
                Pick the hosted capacity that matches your workflow.
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted md:text-base">
                Prices are launch targets. Local and BYO model workflows remain available on
                every plan.
              </p>
            </div>
            <p className="rounded-full border border-line bg-panel px-4 py-2 text-sm text-muted">
              Annual prices shown where available
            </p>
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
                  <span className="text-4xl font-semibold tracking-tight text-ink">{plan.price}</span>
                  <span className="ml-2 text-sm text-muted">{plan.period}</span>
                </div>
                {plan.annualPrice ? (
                  <p className="mt-2 text-sm text-muted">{plan.annualPrice}/mo billed annually</p>
                ) : (
                  <p className="mt-2 text-sm text-muted">{plan.credits}</p>
                )}
                {plan.annualPrice ? <p className="mt-2 text-sm text-accent-cyan">{plan.credits}</p> : null}
                <p className="mt-4 min-h-[72px] text-sm leading-6 text-muted">{plan.description}</p>
                <Link
                  href={plan.href}
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

      <Section
        title="Teams and enterprise"
        subtitle="Team plans add administration, shared controls, and pooled usage. Enterprise adds the security and deployment controls larger organizations expect."
        className="bg-shell"
      >
        <div className="grid gap-5 lg:grid-cols-2">
          {TEAM_PRICING_PLANS.map((plan) => (
            <article key={plan.name} className="pricing-rise rounded-lg border border-line bg-panel p-6 shadow-soft">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-violet">
                    {plan.name === "Team" ? "For teams" : "For organizations"}
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold text-ink">{plan.name}</h3>
                </div>
                <div className="sm:text-right">
                  <p className="text-3xl font-semibold text-ink">{plan.price}</p>
                  <p className="mt-1 text-sm text-muted">{plan.period}</p>
                  {plan.annualPrice ? <p className="mt-1 text-sm text-accent-cyan">{plan.annualPrice}/mo annual</p> : null}
                </div>
              </div>
              <p className="mt-5 text-sm leading-7 text-muted">{plan.description}</p>
              <p className="mt-4 rounded-lg border border-line bg-shell p-3 text-sm font-medium text-ink">
                {plan.credits}
              </p>
              <Link
                href={plan.href}
                className="mt-6 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-semibold text-shell transition hover:-translate-y-0.5 hover:opacity-90"
              >
                {plan.name === "Enterprise" ? "Contact sales" : "Start team plan"}
              </Link>
            </article>
          ))}
        </div>
      </Section>

      <Section
        id="usage"
        title="How usage works"
        subtitle="Credits give NexCoder enough room to support stronger hosted models without hiding the cost of long agent sessions."
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="rounded-lg border border-line bg-panel p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-ink">What consumes credits?</h3>
            <p className="mt-3 text-sm leading-7 text-muted">
              Hosted model calls consume credits. Local model calls and BYO endpoints do not.
              Agent Mesh is billed from the combined hosted model usage of each work unit, so
              large goals should show an estimate before they start.
            </p>
            <div className="mt-6 grid gap-3">
              {creditExamples.map(([name, body, level]) => (
                <div key={name} className="rounded-lg border border-line bg-shell p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-medium text-ink">{name}</p>
                    <span className="w-fit rounded-full border border-line px-3 py-1 text-xs text-muted">
                      {level} credit use
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
                Show credits remaining, reset date, and estimated usage before Deep Thinker or Agent Mesh starts.
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-accent-cyan" aria-hidden />
                Stop Free runs at the monthly limit instead of allowing overage.
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-accent-violet" aria-hidden />
                Let paid users and team admins set monthly spend caps before additional usage is allowed.
              </li>
            </ul>
            <div className="mt-6 rounded-lg border border-white/10 bg-shell/80 p-4">
              <p className="text-sm font-semibold text-ink">Launch note</p>
              <p className="mt-2 text-sm leading-6 text-muted">
                Final public limits should be adjusted after real hosted telemetry shows median
                and high-end token usage per mode.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section
        title="Compare limits"
        subtitle="Hosted limits apply to NexCoder-hosted models. Local and BYO usage remains controlled by your own hardware or provider account."
        className="bg-shell"
      >
        <div className="overflow-x-auto rounded-lg border border-line bg-panel shadow-soft">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                <th className="px-5 py-4">Feature</th>
                <th className="px-5 py-4">Free</th>
                <th className="px-5 py-4">Plus</th>
                <th className="px-5 py-4">Pro</th>
                <th className="px-5 py-4">Premium</th>
                <th className="px-5 py-4">Team / Enterprise</th>
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
        <p className="mt-4 text-xs leading-5 text-muted">
          * 200k context depends on the selected hosted model. Some models support smaller windows.
        </p>
      </Section>

      <section className="px-4 py-12 sm:px-6 md:py-16">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 rounded-lg border border-line bg-panel p-6 shadow-soft md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent-cyan">
              Ready to build
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink md:text-3xl">
              Download NexCoder and start on the Free plan.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
              Upgrade only when you want more hosted model capacity, team controls, or enterprise security.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/download"
              className="inline-flex justify-center rounded-full bg-ink px-6 py-3 text-sm font-semibold text-shell transition hover:-translate-y-0.5 hover:opacity-90"
            >
              Download free
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
