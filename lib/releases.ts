/**
 * Release-metadata helpers for the NexCoder download page.
 *
 * There is exactly ONE source of release information: the sanitized
 * `/api/releases/windows` endpoint served by the Cloudflare download Worker.
 * Version, size, checksum, and date are never hardcoded in components.
 */

/** Sanitized release metadata as returned by /api/releases/windows. */
export interface PublicRelease {
  product: string;
  channel: string;
  version: string;
  releaseDate: string;
  platform: string;
  architecture: string;
  minimumOperatingSystem: string;
  filename: string;
  sizeBytes: number;
  sha256: string;
  releaseNotesUrl: string;
  downloadUrl: string;
}

export type PlatformId = "windows" | "macos" | "linux";

export interface PlatformInfo {
  id: PlatformId;
  label: string;
  osLabel: string;
  fileHint: string;
}

/** Supported download platforms, in display order. */
export const PLATFORMS: PlatformInfo[] = [
  { id: "windows", label: "Windows", osLabel: "Windows 10 / 11, 64-bit", fileHint: ".exe installer" },
  { id: "macos", label: "macOS", osLabel: "macOS 12 Monterey or later", fileHint: ".dmg disk image" },
  { id: "linux", label: "Linux", osLabel: "Ubuntu 20.04+ / modern 64-bit", fileHint: ".AppImage" },
];

/**
 * Same-origin by default in production (the Worker intercepts these paths).
 * For local dev, set NEXT_PUBLIC_NEXCODER_API_BASE (e.g. http://localhost:8787).
 * The Windows-specific overrides are honored for backward compatibility.
 */
const API_BASE = process.env.NEXT_PUBLIC_NEXCODER_API_BASE || "";

export function downloadEndpoint(id: PlatformId): string {
  if (id === "windows" && process.env.NEXT_PUBLIC_NEXCODER_DOWNLOAD_ENDPOINT) {
    return process.env.NEXT_PUBLIC_NEXCODER_DOWNLOAD_ENDPOINT;
  }
  return `${API_BASE}/api/download/${id}`;
}

export function releasesEndpoint(id: PlatformId): string {
  if (id === "windows" && process.env.NEXT_PUBLIC_NEXCODER_RELEASES_ENDPOINT) {
    return process.env.NEXT_PUBLIC_NEXCODER_RELEASES_ENDPOINT;
  }
  return `${API_BASE}/api/releases/${id}`;
}

/** Best-effort OS detection for choosing the default download tab (client-only). */
export function detectPlatform(): PlatformId {
  if (typeof navigator === "undefined") return "windows";
  const ua = `${navigator.userAgent} ${navigator.platform ?? ""}`.toLowerCase();
  if (ua.includes("mac")) return "macos";
  if (ua.includes("linux") || ua.includes("x11")) return "linux";
  return "windows";
}

/** Format a byte count as a short, human-readable size (e.g. "185 MB"). */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1000) return `${bytes} B`;
  const kb = bytes / 1000;
  if (kb < 1000) return `${trim(kb)} KB`;
  const mb = kb / 1000;
  if (mb < 1000) return `${trim(mb)} MB`;
  const gb = mb / 1000;
  return `${trim(gb)} GB`;
}

function trim(value: number): string {
  const rounded = value >= 100 ? Math.round(value) : Math.round(value * 10) / 10;
  return String(rounded);
}

/** Format an ISO timestamp as a readable date (e.g. "July 20, 2026"). */
export function formatReleaseDate(iso: string): string {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return "—";
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** Basic shape guard so a malformed payload cannot crash the page. */
export function isPublicRelease(value: unknown): value is PublicRelease {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.version === "string" &&
    typeof v.filename === "string" &&
    typeof v.sizeBytes === "number" &&
    typeof v.sha256 === "string" &&
    typeof v.downloadUrl === "string"
  );
}

/** Fetch sanitized release metadata from an endpoint. Throws on error. */
export async function fetchRelease(endpoint: string, signal?: AbortSignal): Promise<PublicRelease> {
  const res = await fetch(endpoint, {
    signal,
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`release metadata request failed (${res.status})`);
  const data: unknown = await res.json();
  if (!isPublicRelease(data)) throw new Error("release metadata is malformed");
  return data;
}
