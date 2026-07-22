/**
 * Security primitives: validation of manifest fields, filenames, and object
 * keys. These functions never throw on untrusted input; they return booleans
 * so callers can turn a failure into a controlled service error.
 */

export const SUPPORTED_SCHEMA_VERSIONS = [1] as const;
export const ALLOWED_CHANNELS = ["stable", "beta"] as const;
export const ALLOWED_PLATFORMS = ["windows", "macos", "linux"] as const;
export const ALLOWED_ARCHITECTURES = ["x64", "arm64", "universal"] as const;

/** Installer extensions permitted per platform (checked case-insensitively). */
export const PLATFORM_EXTENSIONS: Record<string, string[]> = {
  windows: [".exe", ".msi"],
  macos: [".dmg", ".pkg"],
  linux: [".appimage", ".deb", ".rpm", ".tar.gz"],
};

/** Only keys under these platform prefixes may ever be fetched. */
export const APPROVED_OBJECT_PREFIXES = (ALLOWED_PLATFORMS as readonly string[]).map(
  (p) => `releases/${p}/`,
);

/** Strict semantic-version check (no build metadata required, prerelease ok). */
const SEMVER_RE =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-.]+)?(?:\+[0-9A-Za-z-.]+)?$/;
const SHA256_RE = /^[a-f0-9]{64}$/i;
/** Safe base filename: word chars, dots, dashes only (extension checked separately). */
const SAFE_FILENAME_RE = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

export function isSupportedSchemaVersion(v: unknown): boolean {
  return typeof v === "number" && (SUPPORTED_SCHEMA_VERSIONS as readonly number[]).includes(v);
}

export function isAllowedChannel(v: unknown): boolean {
  return typeof v === "string" && (ALLOWED_CHANNELS as readonly string[]).includes(v);
}

export function isAllowedPlatform(v: unknown): boolean {
  return typeof v === "string" && (ALLOWED_PLATFORMS as readonly string[]).includes(v);
}

export function isAllowedArchitecture(v: unknown): boolean {
  return typeof v === "string" && (ALLOWED_ARCHITECTURES as readonly string[]).includes(v);
}

export function isValidSemver(v: unknown): boolean {
  return typeof v === "string" && SEMVER_RE.test(v);
}

export function isValidSha256(v: unknown): boolean {
  return typeof v === "string" && SHA256_RE.test(v);
}

/** A safe filename whose extension is allowed for the given platform. */
export function isSafeFilename(v: unknown, platform: unknown): boolean {
  if (
    typeof v !== "string" ||
    v.length === 0 ||
    v.length > 200 ||
    v.includes("/") ||
    v.includes("\\") ||
    v.includes("..") ||
    !SAFE_FILENAME_RE.test(v)
  ) {
    return false;
  }
  if (typeof platform !== "string") return false;
  const extensions = PLATFORM_EXTENSIONS[platform];
  if (!extensions) return false;
  const lower = v.toLowerCase();
  return extensions.some((ext) => lower.endsWith(ext));
}

export function isValidIsoTimestamp(v: unknown): boolean {
  if (typeof v !== "string") return false;
  const t = Date.parse(v);
  return Number.isFinite(t) && !Number.isNaN(t);
}

export function isNonNegativeInteger(v: unknown): boolean {
  return typeof v === "number" && Number.isInteger(v) && v >= 0;
}

/**
 * Validate that an object key is safe to fetch: begins with the approved
 * prefix for its platform, has no traversal, and is not absolute.
 */
export function isSafeObjectKey(v: unknown, platform: unknown): boolean {
  if (typeof v !== "string" || v.length === 0) return false;
  if (v.startsWith("/")) return false;
  if (v.includes("..")) return false;
  if (v.includes("\\")) return false;
  if (v.includes("\0")) return false;
  if (typeof platform !== "string") return false;
  // Must match this manifest's own platform prefix (a macOS manifest may not
  // point at releases/windows/…).
  if (!(ALLOWED_PLATFORMS as readonly string[]).includes(platform)) return false;
  return v.startsWith(`releases/${platform}/`);
}

/**
 * Produce an RFC 6266 Content-Disposition value with both an ASCII fallback
 * and a UTF-8 form. The filename must already be validated with isSafeFilename.
 */
export function contentDisposition(filename: string): string {
  const asciiFallback = filename.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");
  const encoded = encodeURIComponent(filename);
  return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encoded}`;
}
