import type { Metadata } from "next";
import Link from "next/link";

import { getMarkdownDocuments, type MarkdownBlock } from "../../../lib/markdown-docs";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "User documentation for NexCoder: getting started, workspace navigation, AI modes, plans, agent runs, permissions, privacy, and troubleshooting.",
};

function renderInline(text: string) {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={index} className="rounded bg-shell px-1.5 py-0.5 text-xs text-ink">
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

function MarkdownContent({ blocks }: { blocks: MarkdownBlock[] }) {
  return (
    <div className="space-y-4 sm:space-y-5">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          if (block.level === 1) return null;
          const Tag = block.level === 2 ? "h2" : "h3";
          return (
            <Tag
              key={`${block.id}-${index}`}
              id={block.id}
              className={`scroll-mt-28 font-semibold tracking-tight text-ink ${
                block.level === 2 ? "pt-5 text-2xl sm:pt-6 md:text-3xl" : "pt-3 text-lg sm:text-xl"
              }`}
            >
              {block.text}
            </Tag>
          );
        }

        if (block.type === "paragraph") {
          return (
            <p key={index} className="max-w-3xl text-sm leading-7 text-muted sm:text-base">
              {renderInline(block.text)}
            </p>
          );
        }

        if (block.type === "list") {
          const ListTag = block.ordered ? "ol" : "ul";
          return (
            <ListTag key={index} className="grid gap-2.5 sm:gap-3">
              {block.items.map((item, itemIndex) => (
                <li
                  key={item}
                  className="group flex gap-3 rounded-2xl border border-line/70 bg-shell/70 p-3.5 text-sm leading-6 text-muted transition hover:-translate-y-0.5 hover:border-accent-cyan/25 hover:bg-shell sm:p-4"
                >
                  {block.ordered ? (
                    <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full border border-line bg-panel text-xs font-semibold text-ink transition group-hover:border-accent-cyan/35">
                      {itemIndex + 1}
                    </span>
                  ) : (
                    <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-accent-cyan" aria-hidden />
                  )}
                  <span>{renderInline(item)}</span>
                </li>
              ))}
            </ListTag>
          );
        }

        return (
          <pre key={index} className="overflow-x-auto rounded-2xl border border-line bg-shell p-3 text-xs leading-6 text-ink sm:p-4">
            <code>{block.code}</code>
          </pre>
        );
      })}
    </div>
  );
}

export default function DocsPage() {
  const documents = getMarkdownDocuments();
  const primary = documents[0];
  const sections = documents.flatMap((document) =>
    document.sections.map((section) => ({
      ...section,
      documentTitle: document.title,
    })),
  );
  const featuredSections = sections.slice(0, 4);

  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-[#050505] px-4 py-12 text-white sm:px-6 md:py-20">
        <div className="docs-hero-grid absolute inset-0" aria-hidden />
        <div className="docs-scanline absolute inset-x-0 top-0 h-px" aria-hidden />
        <div className="relative mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-center">
            <div className="docs-fade-up">
              <p className="inline-flex rounded-full border border-accent-cyan/40 bg-accent-blue/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-accent-cyan">
                Documentation
              </p>
              <h1 className="mt-6 max-w-4xl text-3xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
                {primary?.title || "NexCoder Documentation"}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
                {primary?.description ||
                  "User documentation loaded from Markdown files in the docs/documentation directory."}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {sections[0] ? (
                  <a
                    href={`#${sections[0].id}`}
                    className="inline-flex justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-shell transition hover:-translate-y-0.5 hover:bg-white/90"
                  >
                    Start reading
                  </a>
                ) : null}
                <Link
                  href="/download"
                  className="inline-flex justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-white/10"
                >
                  Get NexCoder
                </Link>
              </div>
            </div>

            <div className="docs-fade-up docs-delay-2 rounded-[24px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_24px_90px_rgba(34,201,255,0.12)] backdrop-blur sm:rounded-[28px] sm:p-5">
              <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">Choose your path</p>
                  <p className="mt-1 text-xs text-white/50">A safer flow for AI coding</p>
                </div>
                <span className="w-fit rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-3 py-1 text-xs font-semibold text-accent-cyan">
                  Live workflow
                </span>
              </div>
              <div className="mt-5 space-y-3">
                {[
                  ["01", "Read", "Learn the workspace and modes before changing code."],
                  ["02", "Plan", "Use approval-gated plans for broad or risky changes."],
                  ["03", "Verify", "Review diffs, run checks, and commit intentionally."],
                ].map(([step, title, body], index) => (
                  <div
                    key={step}
                    className={`docs-fade-up docs-delay-${index + 3} group flex gap-3 rounded-2xl border border-white/10 bg-[#0b0b10] p-3.5 transition hover:-translate-y-1 hover:border-accent-cyan/35 hover:bg-white/[0.06] sm:gap-4 sm:p-4`}
                  >
                    <span className="relative flex h-9 w-9 flex-none items-center justify-center rounded-full border border-white/15 bg-white/[0.05] text-xs font-semibold text-white">
                      {step}
                      {index === 0 ? (
                        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-accent-cyan animate-pulse" />
                      ) : null}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">{title}</p>
                      <p className="mt-1 text-sm leading-6 text-white/60">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {featuredSections.length ? (
        <section className="border-b border-line bg-shell px-4 py-6 sm:px-6 sm:py-8">
          <div className="mx-auto grid max-w-6xl grid-flow-col auto-cols-[minmax(210px,1fr)] gap-3 overflow-x-auto pb-2 sm:grid-flow-row sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-4">
            {featuredSections.map((section, index) => (
              <a
                key={`featured-${section.id}`}
                href={`#${section.id}`}
                className={`docs-fade-up docs-delay-${index + 1} group rounded-2xl border border-line bg-panel p-4 transition hover:-translate-y-1 hover:border-ink/30 hover:bg-[#181820]`}
              >
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-violet">
                  0{index + 1}
                </span>
                <p className="mt-3 text-sm font-semibold text-ink">{section.title}</p>
                <p className="mt-2 text-xs leading-5 text-muted">
                  Jump to this section
                  <span className="ml-1 inline-block transition group-hover:translate-x-1">-&gt;</span>
                </p>
              </a>
            ))}
          </div>
        </section>
      ) : null}

      <section className="px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <nav className="rounded-3xl border border-line bg-panel p-3 shadow-soft sm:p-4" aria-label="Documentation sections">
              <p className="px-3 text-xs font-semibold uppercase tracking-[0.24em] text-muted">
                Sections
              </p>
              <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0 lg:pb-0">
                {sections.map((section) => (
                  <a
                    key={`${section.documentTitle}-${section.id}`}
                    href={`#${section.id}`}
                    className="flex-none rounded-full border border-line bg-shell px-3 py-2 text-sm text-muted transition hover:-translate-y-0.5 hover:border-accent-cyan/30 hover:text-ink lg:rounded-2xl lg:border-transparent lg:bg-transparent lg:hover:border-line lg:hover:bg-shell"
                  >
                    {section.title}
                  </a>
                ))}
              </div>
            </nav>
          </aside>

          <div className="space-y-6">
            {documents.length ? (
              documents.map((document) => (
                <article
                  key={document.slug}
                  className="docs-fade-up rounded-3xl border border-line bg-panel p-5 shadow-soft transition hover:border-ink/20 sm:p-6 md:p-8"
                >
                  <MarkdownContent blocks={document.blocks} />
                </article>
              ))
            ) : (
              <article className="rounded-3xl border border-line bg-panel p-6 shadow-soft md:p-8">
                <h2 className="text-2xl font-semibold tracking-tight text-ink">
                  No documentation files found
                </h2>
                <p className="mt-3 text-sm leading-7 text-muted">
                  Add Markdown files to <code className="rounded bg-shell px-1.5 py-0.5 text-xs text-ink">docs/documentation</code> to populate this page.
                </p>
              </article>
            )}

            <article className="docs-fade-up rounded-3xl border border-line bg-gradient-to-br from-accent-blue/15 via-panel to-accent-violet/10 p-5 shadow-soft sm:p-6 md:p-8">
              <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                Ready to use NexCoder?
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted md:text-base">
                Download the desktop app, open a project folder, and start with a
                read-only scan before approving file changes.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/download"
                  className="inline-flex justify-center rounded-full bg-ink px-6 py-3 text-sm font-semibold text-shell transition hover:-translate-y-0.5 hover:opacity-90"
                >
                  Get NexCoder
                </Link>
                <Link
                  href="/features"
                  className="inline-flex justify-center rounded-full border border-ink/20 px-6 py-3 text-sm font-medium text-ink transition hover:-translate-y-0.5 hover:bg-ink hover:text-shell"
                >
                  Explore features
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
