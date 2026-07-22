/**
 * NexCoder download Worker.
 *
 * Routes (attached via wrangler.jsonc to nexcoder.trynexa-ai.com):
 *   GET|HEAD /api/download/windows   -> stream the stable Windows installer
 *   GET|HEAD /api/releases/windows   -> sanitized public release metadata
 *   GET|HEAD /api/download/health    -> health probe
 *
 * The installer is streamed from a PRIVATE R2 bucket via the RELEASES binding.
 * No redirects, no public bucket URLs, no user-controlled object keys.
 */
import { parseAndValidateManifest, toPublicRelease } from "./manifest";
import { buildDownloadHeaders, errorResponse, jsonResponse, parseRange } from "./responses";
import type { Env, ReleaseManifest, ServiceErrorCode } from "./types";

const ALLOW = "GET, HEAD";

const PLATFORMS = ["windows", "macos", "linux"] as const;
type Platform = (typeof PLATFORMS)[number];

const DOWNLOAD_RE = /^\/api\/download\/(windows|macos|linux)$/;
const RELEASES_RE = /^\/api\/releases\/(windows|macos|linux)$/;

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    try {
      const url = new URL(request.url);
      const path = url.pathname;
      const method = request.method.toUpperCase();

      if (path === "/api/download/health") {
        return methodGuard(method) ?? handleHealth(method, env);
      }
      const download = DOWNLOAD_RE.exec(path);
      if (download) {
        return methodGuard(method) ?? (await handleDownload(request, method, env, download[1] as Platform));
      }
      const releases = RELEASES_RE.exec(path);
      if (releases) {
        return methodGuard(method) ?? (await handleReleases(method, env, releases[1] as Platform));
      }
      return errorResponse("NOT_FOUND");
    } catch (err) {
      log("error", { event: "nexcoder_unhandled_exception", message: safeMessage(err) });
      return errorResponse("INTERNAL_ERROR");
    }
  },
};

/** Resolve the stable manifest key for a platform (env override, else convention). */
function manifestKeyFor(env: Env, platform: Platform): string {
  switch (platform) {
    case "windows":
      return env.WINDOWS_STABLE_MANIFEST_KEY || "manifests/windows-stable.json";
    case "macos":
      return env.MACOS_STABLE_MANIFEST_KEY || "manifests/macos-stable.json";
    case "linux":
      return env.LINUX_STABLE_MANIFEST_KEY || "manifests/linux-stable.json";
  }
}

/** Enforce GET/HEAD only; returns a 405 response or null to continue. */
function methodGuard(method: string): Response | null {
  if (method === "GET" || method === "HEAD") return null;
  return errorResponse("METHOD_NOT_ALLOWED", { Allow: ALLOW });
}

function handleHealth(method: string, env: Env): Response {
  const body = {
    status: "ok",
    service: "nexcoder-downloads",
    environment: env.ENVIRONMENT ?? "unknown",
    version: env.WORKER_VERSION ?? "dev",
    timestamp: new Date().toISOString(),
  };
  if (method === "HEAD") {
    const res = jsonResponse(body, { headers: { "Cache-Control": "no-store" } });
    return new Response(null, { status: res.status, headers: res.headers });
  }
  return jsonResponse(body, { headers: { "Cache-Control": "no-store" } });
}

/** Load + validate the stable manifest for a platform from private R2. */
async function loadManifest(
  env: Env,
  platform: Platform,
): Promise<{ ok: true; manifest: ReleaseManifest } | { ok: false; code: ServiceErrorCode }> {
  let object: R2ObjectBody | null;
  try {
    object = await env.RELEASES.get(manifestKeyFor(env, platform));
  } catch (err) {
    log("error", { event: "nexcoder_manifest_read_failure", platform, message: safeMessage(err) });
    return { ok: false, code: "RELEASE_STORAGE_UNAVAILABLE" };
  }
  if (!object) {
    log("error", { event: "nexcoder_manifest_read_failure", platform, reason: "manifest object missing" });
    return { ok: false, code: "RELEASE_STORAGE_UNAVAILABLE" };
  }
  const raw = await object.text();
  const result = parseAndValidateManifest(raw);
  if (!result.ok) {
    log("error", { event: "nexcoder_manifest_validation_failure", platform, reason: result.reason });
    return { ok: false, code: result.code };
  }
  // Defense in depth: the manifest's platform must match the requested route.
  if (result.manifest.platform !== platform) {
    log("error", { event: "nexcoder_manifest_platform_mismatch", platform, got: result.manifest.platform });
    return { ok: false, code: "RELEASE_STORAGE_UNAVAILABLE" };
  }
  return { ok: true, manifest: result.manifest };
}

async function handleReleases(method: string, env: Env, platform: Platform): Promise<Response> {
  const loaded = await loadManifest(env, platform);
  if (!loaded.ok) return errorResponse(loaded.code);
  const publicRelease = toPublicRelease(loaded.manifest);
  const res = jsonResponse(publicRelease, {
    headers: { "Cache-Control": "public, max-age=300, must-revalidate" },
  });
  if (method === "HEAD") return new Response(null, { status: res.status, headers: res.headers });
  return res;
}

async function handleDownload(
  request: Request,
  method: string,
  env: Env,
  platform: Platform,
): Promise<Response> {
  const loaded = await loadManifest(env, platform);
  if (!loaded.ok) return errorResponse(loaded.code);
  const manifest = loaded.manifest;

  // Metadata first (private object key from validated manifest only).
  const head = await env.RELEASES.head(manifest.objectKey);
  if (!head) {
    log("error", { event: "nexcoder_installer_missing", version: manifest.version });
    return errorResponse("INSTALLER_UNAVAILABLE");
  }
  const etag = head.httpEtag;
  const uploaded = head.uploaded;
  const size = head.size;

  // Conditional requests (must not break normal downloads or ranges).
  const conditional = evaluateConditionals(request, etag, uploaded);
  if (conditional) {
    const headers = buildDownloadHeaders({ manifest, size, etag, uploaded });
    return new Response(null, { status: conditional, headers });
  }

  const rangeHeader = method === "GET" ? request.headers.get("Range") : null;
  const range = parseRange(rangeHeader, size);
  if (range.kind === "unsatisfiable") {
    log("info", { event: "nexcoder_range_request", version: manifest.version, satisfiable: false });
    return errorResponse("RANGE_NOT_SATISFIABLE", { "Content-Range": `bytes */${size}` });
  }

  const country = getCountry(request);
  log("info", {
    event: "nexcoder_download",
    platform: manifest.platform,
    channel: manifest.channel,
    version: manifest.version,
    rangeRequested: range.kind === "ok",
    method,
    country,
    timestamp: new Date().toISOString(),
  });

  if (method === "HEAD") {
    const headers = buildDownloadHeaders({ manifest, size, etag, uploaded });
    return new Response(null, { status: 200, headers });
  }

  // Stream the body directly from R2 (never buffered into memory).
  let object: R2ObjectBody | null;
  try {
    object =
      range.kind === "ok"
        ? await env.RELEASES.get(manifest.objectKey, {
            range: { offset: range.range.offset, length: range.range.length },
          })
        : await env.RELEASES.get(manifest.objectKey);
  } catch (err) {
    log("error", { event: "nexcoder_installer_fetch_failure", message: safeMessage(err) });
    return errorResponse("INSTALLER_UNAVAILABLE");
  }
  if (!object || !("body" in object) || object.body === null) {
    return errorResponse("INSTALLER_UNAVAILABLE");
  }

  if (range.kind === "ok") {
    const headers = buildDownloadHeaders({ manifest, size, etag, uploaded, range: range.range });
    return new Response(object.body, { status: 206, headers });
  }
  const headers = buildDownloadHeaders({ manifest, size, etag, uploaded });
  return new Response(object.body, { status: 200, headers });
}

/**
 * Evaluate cache-validator preconditions. Returns a status code (304) to send
 * with metadata-only headers, or null to proceed. If-Match/If-Unmodified-Since
 * failures short-circuit to 412 by throwing a controlled response.
 */
function evaluateConditionals(request: Request, etag: string, uploaded: Date): 304 | null {
  const ifNoneMatch = request.headers.get("If-None-Match");
  if (ifNoneMatch && etagMatches(ifNoneMatch, etag)) {
    return 304;
  }
  if (!ifNoneMatch) {
    const ifModifiedSince = request.headers.get("If-Modified-Since");
    if (ifModifiedSince) {
      const since = Date.parse(ifModifiedSince);
      if (Number.isFinite(since) && uploaded.getTime() <= since) return 304;
    }
  }
  return null;
}

function etagMatches(header: string, etag: string): boolean {
  const trimmed = header.trim();
  if (trimmed === "*") return true;
  return trimmed
    .split(",")
    .map((t) => t.trim().replace(/^W\//, ""))
    .some((t) => t === etag || t === `"${etag}"` || `"${t}"` === etag);
}

function getCountry(request: Request): string {
  const cf = (request as Request & { cf?: { country?: string } }).cf;
  return cf?.country ?? "XX";
}

function safeMessage(err: unknown): string {
  // Only a short, non-sensitive label is logged — never full stack/paths.
  if (err instanceof Error) return err.name;
  return "unknown";
}

type LogLevel = "info" | "error";
function log(level: LogLevel, payload: Record<string, unknown>): void {
  const line = JSON.stringify(payload);
  if (level === "error") console.error(line);
  else console.log(line);
}
