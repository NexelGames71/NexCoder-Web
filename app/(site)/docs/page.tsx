import type { Metadata } from "next";
import Link from "next/link";

import { getMarkdownDocuments, type MarkdownBlock } from "../../../lib/markdown-docs";

export const dynamic = "force-dynamic";

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

  return (
    <>
      <section className="border-b border-line bg-panel px-5 py-16">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-cyan">
            Documentation
          </p>
          <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
            <div>
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-ink md:text-6xl">
                {primary?.title || "NexCoder Documentation"}
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
                {primary?.description ||
                  "User documentation loaded from Markdown files in the docs/documentation directory."}
              </p>
            </div>
            <div className="rounded-3xl border border-line bg-shell p-5 shadow-soft">
              <p className="text-sm font-semibold text-ink">Markdown-backed docs</p>
              <p className="mt-3 text-sm leading-6 text-muted">
                This page loads documentation from <code className="rounded bg-panel px-1.5 py-0.5 text-xs text-ink">docs/documentation/*.md</code>.
                Add or edit Markdown files there to update this page without changing the route code.
              </p>
            </div>
          </div>
        </div>
      </section>

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
                    className="rounded-2xl px-3 py-2 text-sm text-muted transition hover:bg-shell hover:text-ink"
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
                  className="rounded-3xl border border-line bg-panel p-6 shadow-soft md:p-8"
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
