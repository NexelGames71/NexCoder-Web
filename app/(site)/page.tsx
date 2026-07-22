import Link from "next/link";
import type { Metadata } from "next";

import AppFrame from "../../components/marketing/AppFrame";
import CodeBlock from "../../components/marketing/CodeBlock";
import Section from "../../components/marketing/Section";
import { HOME_FEATURES, MODES } from "../../lib/site-content";

export const metadata: Metadata = {
  title: "NexCoder - Agentic Coding IDE for the Nexa Ecosystem",
  description:
    "NexCoder is a production-grade agentic coding IDE: one agentic engine behind six chat modes and a terminal CLI, with checkpoint-backed edits, skills, and local-first models.",
};

export default function HomePage() {
  return (
    <>
      <section className="overflow-hidden border-b border-line bg-[#050505] px-5 py-12 text-white md:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(420px,1fr)] lg:items-center">
          <div>
            <p className="inline-flex rounded-full border border-accent-cyan/40 bg-accent-blue/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-accent-cyan">
              One engine. Every surface.
            </p>
            <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-tight md:text-6xl">
              The agentic coding IDE that verifies its own work.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-white/70">
              NexCoder plans with a visible todo list, edits files with checkpoint-backed
              revert, asks before running commands, and checks the result. Six chat modes
              and a terminal CLI - all thin policy profiles over the same agentic core.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/download"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:bg-white/90"
              >
                Get NexCoder
              </Link>
              <Link
                href="/features"
                className="rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Explore features
              </Link>
            </div>
            <dl className="mt-10 grid gap-3 text-sm text-white/70 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <dt className="text-xs uppercase tracking-[0.18em] text-white/40">Modes</dt>
                <dd className="mt-2 font-semibold text-white">Agent, Ask, Edit, Debug, Review, Scan</dd>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <dt className="text-xs uppercase tracking-[0.18em] text-white/40">Runtime</dt>
                <dd className="mt-2 font-semibold text-white">Local GGUF or hosted endpoint</dd>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <dt className="text-xs uppercase tracking-[0.18em] text-white/40">Safety</dt>
                <dd className="mt-2 font-semibold text-white">Checkpoints + permission gates</dd>
              </div>
            </dl>
          </div>

          <div className="relative">
            <div
              className="absolute -inset-8 rounded-[40px] bg-gradient-to-br from-accent-blue/25 to-accent-violet/25 blur-3xl"
              aria-hidden
            />
            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0b10] shadow-[0_32px_120px_rgba(80,70,255,0.25)]">
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-white/15" aria-hidden />
                <span className="h-3 w-3 rounded-full bg-white/15" aria-hidden />
                <span className="h-3 w-3 rounded-full bg-white/15" aria-hidden />
                <span className="ml-3 text-xs font-medium text-white/50">nexcoder - agent mode</span>
              </div>
              <img
                src="/media/cli-demo.gif"
                alt="The NexCoder CLI: typing a task command, then the agent plans, asks permission, runs the tests, and reports the run verified."
                className="block w-full"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-line px-5 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-violet">See it in action</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink md:text-3xl">
              A full IDE with the agent built in.
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted md:text-base">
              Editor, file tree, terminal, and an always-present agent panel that plans, edits,
              and reports back - watching your active file the whole time.
            </p>
          </div>
          <AppFrame
            src="/media/nexcoder-editor.png"
            alt="The NexCoder IDE: file tree, Python editor, and the agent panel showing a plan with progress checkmarks and a files-changed summary."
            label="NexCoder - editor + agent"
          />
        </div>
      </section>

      <Section
        title="Built for real work, not demos"
        subtitle="Direct file edits with revert, structural safety, auto-context, retrieval, skills, and hard context guarantees - in the desktop IDE and the CLI."
      >
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {HOME_FEATURES.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="group relative overflow-hidden rounded-3xl border border-line bg-panel p-6 shadow-soft transition hover:-translate-y-1 hover:border-ink/30"
            >
              <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100" aria-hidden>
                <div className="h-full w-full bg-gradient-to-br from-accent-blue/5 via-accent-cyan/10 to-accent-violet/10" />
              </div>
              <div className="relative">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">{feature.title}</p>
                <p className="mt-2 text-base font-semibold text-ink">{feature.description}</p>
                <span className="mt-6 inline-flex items-center text-sm font-medium text-ink/70">
                  Explore <span className="ml-2 text-lg">-&gt;</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <Section
        title="Six modes, one engine"
        subtitle="Every mode is a thin policy profile - system prompt, tool subset, turn budget - over the same v2 agentic core. Read-only modes never even receive mutating tools."
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

      <section className="px-5 py-16">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-violet">Agent Mesh</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink md:text-3xl">
              One goal, a team of specialists.
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted md:text-base">
              For bigger jobs, an orchestrator decomposes your goal into bounded work units and
              hands them to specialist agents - Explorer, Implementation, Test, and Review - then
              verifies the combined result. You watch the whole plan unfold, inspect any node, and
              cancel at any time.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-muted">
              <li className="flex gap-3">
                <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-accent-blue" aria-hidden />
                Bounded work units keep each agent focused and reviewable.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-accent-cyan" aria-hidden />
                A live timeline and per-node inspector show exactly what happened.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-accent-violet" aria-hidden />
                One click cancels the run - queued units simply never start.
              </li>
            </ul>
          </div>
          <AppFrame
            src="/media/nexcoder-agent-mesh.png"
            alt="NexCoder Agent Mesh: an orchestrator node branching into Explorer, Implementation, Test, and Review agents, with a live inspector and timeline."
            label="NexCoder - Agent Mesh"
          />
        </div>
      </section>

      <Section
        title="The same agent in your terminal"
        subtitle="Everything the IDE agent can do, scriptable from the shell - interactive permission prompts, full-auto mode, mode profiles, skills, and JSONL event streams."
        className="bg-shell"
      >
        <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
          <CodeBlock
            className="min-w-0"
            code={`nexcoder --project C:\\MyApp "fix the failing test"\nnexcoder --auto --project C:\\MyApp "build a landing page"\nnexcoder --mode review --project C:\\MyApp "review the auth module"\nnexcoder "/commit group and commit my changes"`}
          />
          <div>
            <p className="text-sm leading-7 text-muted">
              The CLI shares sessions, checkpoints, permissions, memory, and skills with the
              desktop app through the per-project <code className="rounded bg-line px-1.5 py-0.5 text-xs text-ink">.nexcoder/</code> directory.
              Start a task in the IDE, continue it from the terminal - or wire the JSONL
              event stream into CI.
            </p>
            <Link href="/cli" className="mt-6 inline-block text-sm font-medium text-ink underline underline-offset-4">
              See the CLI agent -&gt;
            </Link>
          </div>
        </div>
      </Section>

      <Section
        title="Local-first by design"
        subtitle="Run fully offline against a local GGUF model server, or point at the hosted NexCoder endpoint - switching is config-only."
        className="bg-shell"
      >
        <div className="grid gap-5 lg:grid-cols-3">
          <article className="rounded-3xl border border-line bg-panel p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-ink">Your code stays local</h3>
            <p className="mt-3 text-sm leading-6 text-muted">
              Relevant-code retrieval ranks files and snippets on your machine. Repository
              content never has to leave it.
            </p>
          </article>
          <article className="rounded-3xl border border-line bg-panel p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-ink">Consumer-GPU friendly</h3>
            <p className="mt-3 text-sm leading-6 text-muted">
              The NexCoder MoE coding model (3B active) runs on 32GB RAM plus a consumer GPU by
              housing the KV cache in system RAM.
            </p>
          </article>
          <article className="rounded-3xl border border-line bg-panel p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-ink">Hosted when you want it</h3>
            <p className="mt-3 text-sm leading-6 text-muted">
              Production clients default to the hosted, OpenAI-compatible NexCoder endpoint.
              No local model required - just an API key in your .env.
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
