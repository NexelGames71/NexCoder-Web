"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  downloadEndpoint,
  fetchRelease,
  formatBytes,
  formatReleaseDate,
  releasesEndpoint,
  type PlatformInfo,
  type PublicRelease,
} from "../../lib/releases";

type Status = "loading" | "ready" | "error";

/**
 * The primary download action + live release metadata for one platform.
 *
 * The download control is a plain anchor to /api/download/<platform> so the
 * browser performs a native, resumable download and the page stays open.
 * Metadata (version / size / checksum / date) is progressively loaded from the
 * single sanitized source. If metadata cannot load, the page stays usable and
 * the primary action is safely disabled with an accessible message.
 */
export default function DownloadPanel({ platform }: { platform: PlatformInfo }) {
  const [status, setStatus] = useState<Status>("loading");
  const [release, setRelease] = useState<PublicRelease | null>(null);
  const [attempt, setAttempt] = useState(0);
  const controllerRef = useRef<AbortController | null>(null);

  const downloadUrl = downloadEndpoint(platform.id);
  const releasesUrl = releasesEndpoint(platform.id);

  useEffect(() => {
    const controller = new AbortController();
    controllerRef.current = controller;
    setStatus("loading");
    setRelease(null);
    fetchRelease(releasesUrl, controller.signal)
      .then((data) => {
        setRelease(data);
        setStatus("ready");
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setStatus("error");
      });
    return () => controller.abort();
  }, [attempt, releasesUrl]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return (
    <div className="rounded-3xl border border-line bg-panel p-6 shadow-soft sm:p-8">
      <div className="flex items-center gap-3">
        <img src="/nexcoder-logo.png" alt="" className="h-10 w-10 object-contain" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">{platform.label}</p>
          <p className="text-base font-semibold text-ink">NexCoder for {platform.label}</p>
        </div>
      </div>

      {/* Primary action — a real downloadable link (works without JavaScript). */}
      {status === "error" ? (
        <div
          className="mt-6 rounded-2xl border border-line bg-shell px-6 py-4 text-center"
          role="alert"
          aria-live="polite"
        >
          <p className="text-sm font-medium text-ink">
            The NexCoder download is temporarily unavailable.
          </p>
          <p className="mt-1 text-sm text-muted">Please try again shortly.</p>
          <button
            type="button"
            onClick={retry}
            className="mt-4 rounded-full border border-ink/20 px-5 py-2 text-sm font-medium text-ink transition hover:bg-ink hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue"
          >
            Retry
          </button>
        </div>
      ) : (
        <a
          href={downloadUrl}
          download
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-4 text-base font-semibold text-white transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue"
        >
          Download NexCoder for {platform.label}
        </a>
      )}

      {/* Supporting line: version · arch · size */}
      <p className="mt-3 min-h-[1.25rem] text-center text-sm text-muted" aria-live="polite">
        {status === "loading" && <span className="opacity-70">Loading release details…</span>}
        {status === "ready" && release && (
          <span>
            Version {release.version} · {release.architecture} · {formatBytes(release.sizeBytes)}
          </span>
        )}
        {status === "error" && <span>{platform.osLabel}</span>}
      </p>

      {/* Detail grid */}
      <dl className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
        <Detail label="Requirements" value={platform.osLabel} />
        <Detail
          label="Version"
          value={status === "ready" && release ? release.version : "—"}
          loading={status === "loading"}
        />
        <Detail
          label="Installer size"
          value={status === "ready" && release ? formatBytes(release.sizeBytes) : "—"}
          loading={status === "loading"}
        />
        <Detail
          label="Released"
          value={status === "ready" && release ? formatReleaseDate(release.releaseDate) : "—"}
          loading={status === "loading"}
        />
      </dl>

      {/* SHA-256 checksum */}
      <div className="mt-4 rounded-2xl border border-line bg-shell p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">SHA-256 checksum</p>
        <p className="mt-2 break-all font-mono text-xs leading-5 text-ink" aria-live="polite">
          {status === "ready" && release ? release.sha256 : status === "loading" ? "…" : "Unavailable"}
        </p>
      </div>

      {/* Links */}
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
        {status === "ready" && release ? (
          <a
            href={release.releaseNotesUrl}
            className="font-medium text-ink underline underline-offset-4 hover:text-accent-blue"
          >
            Release notes
          </a>
        ) : null}
        <a href="#requirements" className="text-muted underline underline-offset-4 hover:text-ink">
          System requirements
        </a>
        <a href="#install" className="text-muted underline underline-offset-4 hover:text-ink">
          Installation
        </a>
        <a href="#troubleshooting" className="text-muted underline underline-offset-4 hover:text-ink">
          Troubleshooting
        </a>
      </div>
    </div>
  );
}

function Detail({ label, value, loading }: { label: string; value: string; loading?: boolean }) {
  return (
    <div className="bg-panel px-4 py-3">
      <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{label}</dt>
      <dd className={`mt-1 text-sm font-medium text-ink ${loading ? "opacity-40" : ""}`}>
        {loading ? "…" : value}
      </dd>
    </div>
  );
}
