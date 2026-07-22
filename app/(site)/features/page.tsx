import Link from "next/link";
import type { Metadata } from "next";

import Section from "../../../components/marketing/Section";
import { FEATURE_SECTIONS, MODES, PROJECT_STATE } from "../../../lib/site-content";

export const metadata: Metadata = {
  title: "Features",
  description:
    "NexCoder's agentic loop, structural safety, auto-context, skills, persistent memory, and context management - in detail.",
};

export default function FeaturesPage() {
  return (
    <>
      <section className="border-b border-line bg-panel px-5 py-16">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-violet">Features</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
            An agent you can trust with your working tree.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
            NexCoder is built so the safe path is the default path: checkpoints before every
            mutation, permission gates before every command, and read-only modes that are
            structurally incapable of writing.
          </p>
        </div>
      </section>

      <Section
        title="The core"
        subtitle="Everything below ships in both the desktop IDE and the terminal CLI."
      >
        <div className="grid gap-5 md:grid-cols-2">
          {FEATURE_SECTIONS.map((feature) => (
            <article key={feature.title} className="rounded-3xl border border-line bg-panel p-6 shadow-soft">
              <h3 className="text-lg font-semibold text-ink">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{feature.body}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section
        id="modes"
        title="Modes"
        subtitle="Six policy profiles over one engine. Full-access modes get the complete toolset behind permission gates; read-only modes simply never receive mutating tools."
        className="bg-shell"
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {MODES.map((mode) => (
            <article
              key={mode.id}
              className="rounded-2xl border border-line bg-gradient-to-br from-white via-shell to-panel p-5 shadow-soft"
            >
              <p
                className={`text-xs font-semibold uppercase tracking-[0.3em] ${
                  mode.kind === "Read-only" ? "text-accent-blue" : "text-accent-violet"
                }`}
              >
                {mode.kind}
              </p>
              <h3 className="mt-3 text-xl font-semibold">{mode.name}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{mode.description}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section
        title="Per-project state"
        subtitle="Everything the agent knows about a project lives in a .nexcoder/ directory you can read, version, and delete."
      >
        <div className="overflow-x-auto rounded-3xl border border-line bg-panel shadow-soft">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                <th className="px-6 py-4">Path</th>
                <th className="px-6 py-4">Contents</th>
              </tr>
            </thead>
            <tbody>
              {PROJECT_STATE.map((row) => (
                <tr key={row.path} className="border-b border-line/60 last:border-0">
                  <td className="px-6 py-4 font-mono text-xs text-ink">.nexcoder/{row.path}</td>
                  <td className="px-6 py-4 text-muted">{row.contents}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-10">
          <Link
            href="/download"
            className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Get NexCoder
          </Link>
        </div>
      </Section>
    </>
  );
}
