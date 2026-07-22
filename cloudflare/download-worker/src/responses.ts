/**
 * Response builders: JSON errors, range parsing, and download headers.
 * All helpers are pure and unit-tested.
 */
import type { ReleaseManifest, ServiceErrorCode } from "./types";
import { contentDisposition } from "./security";

const ERROR_STATUS: Record<ServiceErrorCode, number> = {
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  RANGE_NOT_SATISFIABLE: 416,
  INSTALLER_UNAVAILABLE: 404,
  RELEASE_STORAGE_UNAVAILABLE: 503,
  INTERNAL_ERROR: 500,
};

const PUBLIC_MESSAGE: Record<ServiceErrorCode, string> = {
  BAD_REQUEST: "The request was malformed.",
  NOT_FOUND: "The requested resource was not found.",
  METHOD_NOT_ALLOWED: "This method is not allowed.",
  RANGE_NOT_SATISFIABLE: "The requested range cannot be satisfied.",
  INSTALLER_UNAVAILABLE: "The NexCoder installer is temporarily unavailable.",
  RELEASE_STORAGE_UNAVAILABLE: "The NexCoder release service is temporarily unavailable.",
  INTERNAL_ERROR: "An unexpected error occurred.",
};

/** Build a sanitized JSON error response. Never leaks internal detail. */
export function errorResponse(
  code: ServiceErrorCode,
  extraHeaders?: HeadersInit,
): Response {
  const status = ERROR_STATUS[code];
  const body = JSON.stringify({ error: { code, message: PUBLIC_MESSAGE[code] } });
  const headers = new Headers(extraHeaders);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store");
  headers.set("X-Content-Type-Options", "nosniff");
  return new Response(status === 405 ? body : body, { status, headers });
}

export function jsonResponse(data: unknown, init?: ResponseInit): Response {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("X-Content-Type-Options", "nosniff");
  if (!headers.has("Cache-Control")) headers.set("Cache-Control", "public, max-age=60");
  return new Response(JSON.stringify(data), { ...init, headers });
}

export interface ParsedRange {
  offset: number;
  length: number;
  /** Inclusive end byte, for Content-Range. */
  end: number;
}

export type RangeResult =
  | { kind: "none" }
  | { kind: "unsatisfiable" }
  | { kind: "ok"; range: ParsedRange };

/**
 * Parse a single HTTP byte range against a known total size.
 * Supports `bytes=start-end`, `bytes=start-`, and `bytes=-suffix`.
 * Multiple ranges are treated as unsatisfiable (we serve a single range only).
 */
export function parseRange(header: string | null, size: number): RangeResult {
  if (!header) return { kind: "none" };
  const match = /^bytes=(.*)$/.exec(header.trim());
  if (!match) return { kind: "unsatisfiable" };
  const spec = match[1] ?? "";
  if (spec.includes(",")) return { kind: "unsatisfiable" };

  const dash = spec.indexOf("-");
  if (dash === -1) return { kind: "unsatisfiable" };
  const startStr = spec.slice(0, dash).trim();
  const endStr = spec.slice(dash + 1).trim();

  let start: number;
  let end: number;

  if (startStr === "") {
    // suffix range: bytes=-N  (last N bytes)
    if (endStr === "") return { kind: "unsatisfiable" };
    const suffix = Number(endStr);
    if (!Number.isInteger(suffix) || suffix <= 0) return { kind: "unsatisfiable" };
    if (size === 0) return { kind: "unsatisfiable" };
    const len = Math.min(suffix, size);
    start = size - len;
    end = size - 1;
  } else {
    start = Number(startStr);
    if (!Number.isInteger(start) || start < 0) return { kind: "unsatisfiable" };
    if (start >= size) return { kind: "unsatisfiable" };
    if (endStr === "") {
      end = size - 1;
    } else {
      end = Number(endStr);
      if (!Number.isInteger(end) || end < start) return { kind: "unsatisfiable" };
      if (end > size - 1) end = size - 1;
    }
  }

  return { kind: "ok", range: { offset: start, length: end - start + 1, end } };
}

/**
 * Build the standard download headers from validated metadata.
 * `range` fills Content-Length/Content-Range for partial responses.
 */
export function buildDownloadHeaders(opts: {
  manifest: ReleaseManifest;
  size: number;
  etag: string;
  uploaded: Date;
  range?: ParsedRange;
}): Headers {
  const { manifest, size, etag, uploaded, range } = opts;
  const headers = new Headers();
  headers.set("Content-Type", manifest.contentType || "application/octet-stream");
  headers.set("Content-Disposition", contentDisposition(manifest.filename));
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Accept-Ranges", "bytes");
  headers.set("ETag", etag);
  headers.set("Last-Modified", uploaded.toUTCString());
  headers.set("Cross-Origin-Resource-Policy", "same-site");
  // Stable alias: allow brief edge caching but revalidate so a newly published
  // release is not served stale for long.
  headers.set("Cache-Control", "public, max-age=300, must-revalidate");
  if (range) {
    headers.set("Content-Length", String(range.length));
    headers.set("Content-Range", `bytes ${range.offset}-${range.end}/${size}`);
  } else {
    headers.set("Content-Length", String(size));
  }
  return headers;
}
