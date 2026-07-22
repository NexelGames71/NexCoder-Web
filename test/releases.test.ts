import { describe, expect, it } from "vitest";
import {
  PLATFORMS,
  detectPlatform,
  downloadEndpoint,
  formatBytes,
  formatReleaseDate,
  isPublicRelease,
  releasesEndpoint,
} from "../lib/releases";

describe("formatBytes", () => {
  it("formats megabytes readably", () => {
    expect(formatBytes(185000000)).toBe("185 MB");
  });
  it("formats gigabytes", () => {
    expect(formatBytes(2500000000)).toBe("2.5 GB");
  });
  it("handles small and invalid values", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(-1)).toBe("—");
  });
});

describe("formatReleaseDate", () => {
  it("formats an ISO timestamp", () => {
    expect(formatReleaseDate("2026-07-20T00:00:00.000Z")).toBe("July 20, 2026");
  });
  it("handles bad input", () => {
    expect(formatReleaseDate("nope")).toBe("—");
  });
});

describe("isPublicRelease", () => {
  it("accepts a well-formed payload", () => {
    expect(
      isPublicRelease({
        version: "1.0.0",
        filename: "NexCoder-Setup-1.0.0.exe",
        sizeBytes: 1,
        sha256: "a".repeat(64),
        downloadUrl: "/api/download/windows",
      }),
    ).toBe(true);
  });
  it("rejects malformed payloads", () => {
    expect(isPublicRelease(null)).toBe(false);
    expect(isPublicRelease({ version: 1 })).toBe(false);
  });
});

describe("platform endpoints", () => {
  it("build same-origin API paths per platform", () => {
    expect(downloadEndpoint("windows")).toBe("/api/download/windows");
    expect(downloadEndpoint("macos")).toBe("/api/download/macos");
    expect(downloadEndpoint("linux")).toBe("/api/download/linux");
    expect(releasesEndpoint("macos")).toBe("/api/releases/macos");
    expect(releasesEndpoint("linux")).toBe("/api/releases/linux");
  });

  it("exposes the three supported platforms in order", () => {
    expect(PLATFORMS.map((p) => p.id)).toEqual(["windows", "macos", "linux"]);
  });

  it("detects a supported platform id", () => {
    expect(["windows", "macos", "linux"]).toContain(detectPlatform());
  });
});
