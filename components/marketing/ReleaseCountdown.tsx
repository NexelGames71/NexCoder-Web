"use client";

import { useEffect, useState } from "react";
import { RELEASE_DATE_ISO, RELEASE_DATE_LABEL } from "../../lib/site-content";

type Remaining = { days: number; hours: number; minutes: number; seconds: number; done: boolean };

function compute(target: number): Remaining {
  const diff = target - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  const s = Math.floor(diff / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    done: false,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Live countdown to the NexCoder launch. Client-driven (pages are statically
 * prerendered, so the server can't hold a live clock). Server + first client
 * render show a stable placeholder to avoid hydration mismatch/layout shift;
 * the real values arrive after mount.
 */
export default function ReleaseCountdown({ variant = "panel" }: { variant?: "panel" | "inline" }) {
  const target = Date.parse(RELEASE_DATE_ISO);
  const [r, setR] = useState<Remaining | null>(null);

  useEffect(() => {
    const tick = () => setR(compute(target));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  const label = `NexCoder launches ${RELEASE_DATE_LABEL}`;

  if (variant === "inline") {
    return (
      <span className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1" aria-label={label}>
        <span className="font-medium">Launching {RELEASE_DATE_LABEL}</span>
        <span aria-hidden className="text-white/40">·</span>
        <span aria-hidden className="font-mono tabular-nums">
          {r?.done ? "Available now" : r ? `${r.days}d ${pad(r.hours)}h ${pad(r.minutes)}m ${pad(r.seconds)}s` : "—"}
        </span>
      </span>
    );
  }

  const cells: Array<[string, string]> = r?.done
    ? []
    : [
        [r ? String(r.days) : "—", "Days"],
        [r ? pad(r.hours) : "—", "Hours"],
        [r ? pad(r.minutes) : "—", "Minutes"],
        [r ? pad(r.seconds) : "—", "Seconds"],
      ];

  return (
    <div aria-label={label} role="timer">
      {r?.done ? (
        <p className="text-2xl font-semibold text-ink">NexCoder is now available.</p>
      ) : (
        <div className="grid grid-cols-4 gap-3 sm:gap-4" aria-hidden>
          {cells.map(([value, unit]) => (
            <div
              key={unit}
              className="rounded-2xl border border-line bg-panel px-2 py-4 text-center shadow-soft sm:px-4"
            >
              <div className="font-mono text-3xl font-semibold tabular-nums text-ink sm:text-5xl">
                {value}
              </div>
              <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted sm:text-xs">
                {unit}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
