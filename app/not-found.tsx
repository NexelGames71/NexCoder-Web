import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-shell px-5 text-ink">
      <section className="max-w-lg text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent-violet">
          Page not found
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
          This NexCoder page does not exist.
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted md:text-base">
          The page may have moved, or the link may be incomplete.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-shell transition hover:opacity-90"
          >
            Go home
          </Link>
          <Link
            href="/download"
            className="rounded-full border border-ink/20 px-6 py-3 text-sm font-medium text-ink transition hover:bg-ink hover:text-shell"
          >
            Download NexCoder
          </Link>
        </div>
      </section>
    </main>
  );
}
