/**
 * Manifest parsing, validation, and sanitization.
 *
 * The download endpoint MUST validate every field before touching R2. An
 * invalid manifest never results in an arbitrary object fetch; it returns a
 * controlled service error and logs the validation failure.
 */
import type { ManifestValidation, PublicRelease, ReleaseManifest } from "./types";
import {
  isAllowedArchitecture,
  isAllowedChannel,
  isAllowedPlatform,
  isNonNegativeInteger,
  isSafeFilename,
  isSafeObjectKey,
  isSupportedSchemaVersion,
  isValidIsoTimestamp,
  isValidSemver,
  isValidSha256,
} from "./security";

function downloadUrlFor(platform: string): string {
  return `/api/download/${platform}`;
}

/** Parse raw manifest text and validate it. Never throws. */
export function parseAndValidateManifest(raw: string): ManifestValidation {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return { ok: false, code: "RELEASE_STORAGE_UNAVAILABLE", reason: "manifest is not valid JSON" };
  }
  return validateManifest(data);
}

/** Validate a parsed manifest object field-by-field. */
export function validateManifest(data: unknown): ManifestValidation {
  if (typeof data !== "object" || data === null) {
    return { ok: false, code: "RELEASE_STORAGE_UNAVAILABLE", reason: "manifest is not an object" };
  }
  const m = data as Record<string, unknown>;

  const checks: Array<[boolean, string]> = [
    [isSupportedSchemaVersion(m.schemaVersion), "unsupported schemaVersion"],
    [m.product === "NexCoder", "product must be NexCoder"],
    [isAllowedChannel(m.channel), "channel not allowed"],
    [isValidSemver(m.version), "version is not valid semver"],
    [isAllowedPlatform(m.platform), "platform not allowed"],
    [isAllowedArchitecture(m.architecture), "architecture not allowed"],
    [typeof m.minimumOperatingSystem === "string" && m.minimumOperatingSystem.length > 0, "minimumOperatingSystem missing"],
    [isSafeFilename(m.filename, m.platform), "filename is unsafe or has a disallowed extension"],
    [isSafeObjectKey(m.objectKey, m.platform), "objectKey failed safety checks"],
    [typeof m.contentType === "string" && m.contentType.length > 0, "contentType missing"],
    [isNonNegativeInteger(m.sizeBytes), "sizeBytes must be a non-negative integer"],
    [isValidSha256(m.sha256), "sha256 must be 64 hex characters"],
    [isValidIsoTimestamp(m.releaseDate), "releaseDate is not a valid ISO timestamp"],
    [typeof m.releaseNotesUrl === "string" && m.releaseNotesUrl.length > 0, "releaseNotesUrl missing"],
    [m.published === true, "release is not published"],
  ];

  for (const [pass, reason] of checks) {
    if (!pass) {
      const code = reason === "release is not published" ? "INSTALLER_UNAVAILABLE" : "RELEASE_STORAGE_UNAVAILABLE";
      return { ok: false, code, reason };
    }
  }

  return { ok: true, manifest: m as unknown as ReleaseManifest };
}

/** Strip the manifest down to fields that are safe to expose to the public. */
export function toPublicRelease(manifest: ReleaseManifest): PublicRelease {
  return {
    product: manifest.product,
    channel: manifest.channel,
    version: manifest.version,
    releaseDate: manifest.releaseDate,
    platform: manifest.platform,
    architecture: manifest.architecture,
    minimumOperatingSystem: manifest.minimumOperatingSystem,
    filename: manifest.filename,
    sizeBytes: manifest.sizeBytes,
    sha256: manifest.sha256,
    releaseNotesUrl: manifest.releaseNotesUrl,
    downloadUrl: downloadUrlFor(manifest.platform),
  };
}
