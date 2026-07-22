import Link from "next/link";
import type { Metadata } from "next";

import CodeBlock from "../../../components/marketing/CodeBlock";
import Section from "../../../components/marketing/Section";
import { CLI_EXAMPLES } from "../../../lib/site-content";

export const metadata: Metadata = {
  title: "CLI Agent",
  description:
    "The NexCoder terminal CLI: the full agentic engine with permission prompts, mode profiles, skills, and machine-readable JSONL events.",
};

export default function CliPage() {
  return (
    <>
      <section className="border-b border-line bg-[#050505] px-5 py-16 text-white">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-cyan">CLI agent</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
              The whole engine, from your shell.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/70">
              The CLI is not a lite version - it is the same agentic core as the IDE with a
              terminal policy profile. Same sessions, same checkpoints, same skills, same
              safety rules.
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b10] shadow-[0_24px_90px_rgba(80,70,255,0.22)]">
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-white/15" aria-hidden />
              <span className="h-3 w-3 rounded-full bg-white/15" aria-hidden />
              <span className="h-3 w-3 rounded-full bg-white/15" aria-hidden />
              <span className="ml-3 text-xs font-medium text-white/50">nexcoder - agent mode</span>
            </div>
            <img
              src="/media/cli-demo.gif"
              alt="The NexCoder CLI startup splash and an agent run: typing a task, the session panel, then plan, permission prompt, and a verified result."
              className="block w-full"
            />
          </div>
        </div>
      </section>

      <Section
        title="Everyday commands"
        subtitle="Interactive by default: the agent asks before each command, and [a]lways adds it to the project allowlist."
      >
        <div className="grid gap-5 md:grid-cols-2">
          {CLI_EXAMPLES.map((example) => (
            <article key={example.title} className="min-w-0 rounded-3xl border border-line bg-panel p-6 shadow-soft">
              <h3 className="text-lg font-semibold text-ink">{example.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{example.caption}</p>
              <CodeBlock code={example.code} className="mt-4" />
            </article>
          ))}
        </div>
      </Section>

      <Section
        title="Built for automation"
        subtitle="Full-auto mode drops the prompts but still denies risky commands. The JSONL flag turns every run into a machine-readable event stream."
        className="bg-shell"
      >
        <div className="grid gap-5 lg:grid-cols-3">
          <article className="rounded-3xl border border-line bg-panel p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-ink">--auto</h3>
            <p className="mt-3 text-sm leading-6 text-muted">
              No command prompts for unattended runs. The risky-command denylist stays
              active no matter what.
            </p>
          </article>
          <article className="rounded-3xl border border-line bg-panel p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-ink">--mode</h3>
            <p className="mt-3 text-sm leading-6 text-muted">
              agent, ask, edit, debug, review, or scan - pick the policy profile that fits
              the job, including read-only profiles for CI review gates.
            </p>
          </article>
          <article className="rounded-3xl border border-line bg-panel p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-ink">--jsonl</h3>
            <p className="mt-3 text-sm leading-6 text-muted">
              Compact JSONL events for every step of a run - plans, edits, commands,
              verification - ready to pipe into your tooling.
            </p>
          </article>
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/download"
            className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Get NexCoder
          </Link>
          <Link
            href="/features"
            className="rounded-full border border-ink/20 px-6 py-3 text-sm font-medium text-ink transition hover:bg-ink hover:text-white"
          >
            All features
          </Link>
        </div>
      </Section>
    </>
  );
}
