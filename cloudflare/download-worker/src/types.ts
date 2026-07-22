/**
 * Shared types for the NexCoder download Worker.
 *
 * The Worker retrieves installers from a PRIVATE R2 bucket through an R2
 * binding. No credentials, bucket names, or object keys are ever exposed to
 * the browser. See README.md and docs/NEXCODER_DOWNLOAD_SYSTEM.md.
 */

/** Cloudflare bindings + vars injected by Wrangler (see wrangler.jsonc). */
export interface Env {
  /** Private R2 bucket binding (bucket_name: nexcoder-releases). */
  RELEASES: R2Bucket;
  /** Object key of the stable Windows manifest inside the bucket. */
  WINDOWS_STABLE_MANIFEST_KEY: string;
  /** Object key of the stable macOS manifest (defaults by convention). */
  MACOS_STABLE_MANIFEST_KEY?: string;
  /** Object key of the stable Linux manifest (defaults by convention). */
  LINUX_STABLE_MANIFEST_KEY?: string;
  /** Deployment environment label (e.g. "production"). Non-secret. */
  ENVIRONMENT: string;
  /** Optional deploy/version tag for structured logs. */
  WORKER_VERSION?: string;
}

/** The full release manifest as stored privately in R2. Never sent to clients. */
export interface ReleaseManifest {
  schemaVersion: number;
  product: string;
  channel: string;
  version: string;
  releaseDate: string;
  platform: string;
  architecture: string;
  minimumOperatingSystem: string;
  filename: string;
  /** Private R2 object key. NEVER exposed publicly. */
  objectKey: string;
  contentType: string;
  sizeBytes: number;
  sha256: string;
  releaseNotesUrl: string;
  published: boolean;
}

/**
 * Sanitized release metadata returned by GET /api/releases/windows.
 * Intentionally omits objectKey and every infrastructure detail.
 */
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

/** Result of manifest validation. */
export type ManifestValidation =
  | { ok: true; manifest: ReleaseManifest }
  | { ok: false; code: ServiceErrorCode; reason: string };

/** Stable, non-leaking error codes returned to clients. */
export type ServiceErrorCode =
  | "BAD_REQUEST"
  | "NOT_FOUND"
  | "METHOD_NOT_ALLOWED"
  | "RANGE_NOT_SATISFIABLE"
  | "INSTALLER_UNAVAILABLE"
  | "RELEASE_STORAGE_UNAVAILABLE"
  | "INTERNAL_ERROR";
