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
    <div className="space-y-5">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          if (block.level === 1) return null;
          const Tag = block.level === 2 ? "h2" : "h3";
          return (
            <Tag
              key={`${block.id}-${index}`}
              id={block.id}
              className={`scroll-mt-28 font-semibold tracking-tight text-ink ${
                block.level === 2 ? "pt-6 text-2xl md:text-3xl" : "pt-3 text-xl"
              }`}
            >
              {block.text}
            </Tag>
          );
        }

        if (block.type === "paragraph") {
          return (
            <p key={index} className="max-w-3xl text-sm leading-7 text-muted md:text-base">
              {renderInline(block.text)}
            </p>
          );
        }

        if (block.type === "list") {
          const ListTag = block.ordered ? "ol" : "ul";
          return (
            <ListTag key={index} className="grid gap-3">
              {block.items.map((item, itemIndex) => (
                <li
                  key={item}
                  className="flex gap-3 rounded-2xl border border-line/70 bg-shell/70 p-4 text-sm leading-6 text-muted"
                >
                  {block.ordered ? (
                    <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full border border-line bg-panel text-xs font-semibold text-ink">
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
          <pre key={index} className="overflow-x-auto rounded-2xl border border-line bg-shell p-4 text-xs leading-6 text-ink">
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
      <section className="overflow-hidden border-b border-line bg-[#050505] px-5 py-14 text-white md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-center">
            <div>
              <p className="inline-flex rounded-full border border-accent-cyan/40 bg-accent-blue/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-accent-cyan">
                Documentation
              </p>
              <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight md:text-6xl">
                {primary?.title || "NexCoder Documentation"}
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/70">
                {primary?.description ||
                  "User documentation loaded from Markdown files in the docs/documentation directory."}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {sections[0] ? (
                  <a
                    href={`#${sections[0].id}`}
                    className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-shell transition hover:bg-white/90"
                  >
                    Start reading
                  </a>
                ) : null}
                <Link
                  href="/download"
                  className="rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  Get NexCoder
                </Link>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_24px_90px_rgba(34,201,255,0.12)] backdrop-blur">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-sm font-semibold text-white">Choose your path</p>
                  <p className="mt-1 text-xs text-white/50">A safer flow for AI coding</p>
                </div>
                <span className="rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-3 py-1 text-xs font-semibold text-accent-cyan">
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
                    className="group flex gap-4 rounded-2xl border border-white/10 bg-[#0b0b10] p-4 transition hover:-translate-y-0.5 hover:border-accent-cyan/35 hover:bg-white/[0.06]"
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
        <section className="border-b border-line bg-shell px-5 py-8">
          <div className="mx-auto grid max-w-6xl gap-3 md:grid-cols-2 lg:grid-cols-4">
            {featuredSections.map((section, index) => (
              <a
                key={`featured-${section.id}`}
                href={`#${section.id}`}
                className="group rounded-2xl border border-line bg-panel p-4 transition hover:-translate-y-1 hover:border-ink/30 hover:bg-[#181820]"
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

      <section className="px-5 py-12">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <nav className="rounded-3xl border border-line bg-panel p-4 shadow-soft" aria-label="Documentation sections">
              <p className="px-3 text-xs font-semibold uppercase tracking-[0.24em] text-muted">
                Sections
              </p>
              <div className="mt-3 flex flex-col gap-1">
                {sections.map((section) => (
                  <a
                    key={`${section.documentTitle}-${section.id}`}
                    href={`#${section.id}`}
                    className="rounded-2xl border border-transparent px-3 py-2 text-sm text-muted transition hover:border-line hover:bg-shell hover:text-ink"
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
                  className="rounded-3xl border border-line bg-panel p-6 shadow-soft transition hover:border-ink/20 md:p-8"
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

            <article className="rounded-3xl border border-line bg-gradient-to-br from-accent-blue/15 via-panel to-accent-violet/10 p-6 shadow-soft md:p-8">
              <h2 className="text-2xl font-semibold tracking-tight text-ink">
                Ready to use NexCoder?
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted md:text-base">
                Download the desktop app, open a project folder, and start with a
                read-only scan before approving file changes.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/download"
                  className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-shell transition hover:opacity-90"
                >
                  Get NexCoder
                </Link>
                <Link
                  href="/features"
                  className="rounded-full border border-ink/20 px-6 py-3 text-sm font-medium text-ink transition hover:bg-ink hover:text-shell"
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
