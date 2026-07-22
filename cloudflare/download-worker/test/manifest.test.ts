import { describe, expect, it } from "vitest";
import { parseAndValidateManifest, toPublicRelease, validateManifest } from "../src/manifest";
import { validManifest } from "./fake-r2";

describe("manifest validation", () => {
  it("accepts a valid stable manifest", () => {
    const result = validateManifest(validManifest());
    expect(result.ok).toBe(true);
  });

  it("rejects an unsupported schema version", () => {
    const result = validateManifest(validManifest({ schemaVersion: 2 }));
    expect(result.ok).toBe(false);
  });

  it("rejects a non-NexCoder product", () => {
    expect(validateManifest(validManifest({ product: "Other" })).ok).toBe(false);
  });

  it("rejects a disallowed channel", () => {
    expect(validateManifest(validManifest({ channel: "nightly" })).ok).toBe(false);
  });

  it("rejects an invalid semantic version", () => {
    expect(validateManifest(validManifest({ version: "1.0" })).ok).toBe(false);
    expect(validateManifest(validManifest({ version: "v1.0.0" })).ok).toBe(false);
  });

  it("rejects a non-windows platform", () => {
    expect(validateManifest(validManifest({ platform: "macos" })).ok).toBe(false);
  });

  it("rejects a disallowed architecture", () => {
    expect(validateManifest(validManifest({ architecture: "x86" })).ok).toBe(false);
  });

  it("rejects an unsafe filename", () => {
    expect(validateManifest(validManifest({ filename: "../evil.exe" })).ok).toBe(false);
    expect(validateManifest(validManifest({ filename: "a b.exe" })).ok).toBe(false);
  });

  it("rejects a wrong file extension", () => {
    expect(validateManifest(validManifest({ filename: "NexCoder-Setup-1.0.0.zip" })).ok).toBe(false);
  });

  it("rejects an object key with path traversal", () => {
    expect(
      validateManifest(validManifest({ objectKey: "releases/windows/../secret.exe" })).ok,
    ).toBe(false);
  });

  it("rejects an object key with an unapproved prefix", () => {
    expect(validateManifest(validManifest({ objectKey: "secrets/thing.exe" })).ok).toBe(false);
  });

  it("rejects an absolute object key", () => {
    expect(
      validateManifest(validManifest({ objectKey: "/releases/windows/stable/1.0.0/x.exe" })).ok,
    ).toBe(false);
  });

  it("rejects a negative size", () => {
    expect(validateManifest(validManifest({ sizeBytes: -1 })).ok).toBe(false);
    expect(validateManifest(validManifest({ sizeBytes: 1.5 })).ok).toBe(false);
  });

  it("rejects a malformed sha256", () => {
    expect(validateManifest(validManifest({ sha256: "abc" })).ok).toBe(false);
    expect(validateManifest(validManifest({ sha256: "z".repeat(64) })).ok).toBe(false);
  });

  it("rejects an invalid releaseDate", () => {
    expect(validateManifest(validManifest({ releaseDate: "not-a-date" })).ok).toBe(false);
  });

  it("rejects an unpublished release", () => {
    const result = validateManifest(validManifest({ published: false }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("INSTALLER_UNAVAILABLE");
  });

  it("rejects non-JSON input", () => {
    const result = parseAndValidateManifest("{not json");
    expect(result.ok).toBe(false);
  });
});

describe("public release sanitization", () => {
  it("never exposes the object key or infrastructure fields", () => {
    const result = validateManifest(validManifest());
    if (!result.ok) throw new Error("fixture should be valid");
    const publicRelease = toPublicRelease(result.manifest);
    const serialized = JSON.stringify(publicRelease);
    expect(serialized).not.toContain("objectKey");
    expect(serialized).not.toContain("releases/windows/stable");
    expect(publicRelease.downloadUrl).toBe("/api/download/windows");
    expect(publicRelease.version).toBe("1.0.0");
    expect(publicRelease.sha256).toHaveLength(64);
  });
});
