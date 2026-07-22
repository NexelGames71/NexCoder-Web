"use client";

import { useEffect, useRef, useState } from "react";
import DownloadPanel from "./DownloadPanel";
import { PLATFORMS, detectPlatform, downloadEndpoint, type PlatformId } from "../../lib/releases";

/**
 * Platform picker for the download page. Defaults to the visitor's detected OS,
 * then renders that platform's DownloadPanel. A <noscript> fallback exposes a
 * direct download link for every platform when JavaScript is unavailable.
 */
export default function DownloadTabs() {
  const [active, setActive] = useState<PlatformId>("windows");
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    setActive(detectPlatform());
  }, []);

  const activePlatform = PLATFORMS.find((p) => p.id === active) ?? PLATFORMS[0]!;

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const idx = PLATFORMS.findIndex((p) => p.id === active);
    const next =
      e.key === "ArrowRight"
        ? PLATFORMS[(idx + 1) % PLATFORMS.length]!
        : PLATFORMS[(idx - 1 + PLATFORMS.length) % PLATFORMS.length]!;
    setActive(next.id);
    tabRefs.current[next.id]?.focus();
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Choose your platform"
        onKeyDown={onKeyDown}
        className="inline-flex rounded-full border border-line bg-shell p-1"
      >
        {PLATFORMS.map((p) => {
          const selected = p.id === active;
          return (
            <button
              key={p.id}
              ref={(el) => {
                tabRefs.current[p.id] = el;
              }}
              role="tab"
              id={`tab-${p.id}`}
              type="button"
              aria-selected={selected}
              aria-controls={`panel-${p.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(p.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-blue ${
                selected ? "bg-ink text-white" : "text-muted hover:text-ink"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`panel-${active}`}
        aria-labelledby={`tab-${active}`}
        className="mt-4"
      >
        <DownloadPanel key={active} platform={activePlatform} />
      </div>

      <noscript>
        <ul className="mt-4 space-y-2 text-sm">
          {PLATFORMS.map((p) => (
            <li key={p.id}>
              <a href={downloadEndpoint(p.id)} className="text-ink underline underline-offset-4">
                Download NexCoder for {p.label} ({p.fileHint})
              </a>
            </li>
          ))}
        </ul>
      </noscript>
    </div>
  );
}
