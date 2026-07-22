import { describe, expect, it } from "vitest";
import worker from "../src/index";
import { validateManifest } from "../src/manifest";
import {
  CTX,
  FakeR2Bucket,
  INSTALLER_BYTES,
  makeEnv,
  makeMultiEnv,
  validManifestFor,
} from "./fake-r2";
import type { Env } from "../src/types";

const ORIGIN = "https://nexcoder.trynexa-ai.com";
function req(path: string, init?: RequestInit): Request {
  return new Request(`${ORIGIN}${path}`, init);
}

describe("multi-platform routing", () => {
  it("serves the macOS installer with a .dmg filename", async () => {
    const res = await worker.fetch(req("/api/download/macos"), makeMultiEnv(), CTX);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Disposition")).toContain('filename="NexCoder-1.0.0.dmg"');
    const buf = new Uint8Array(await res.arrayBuffer());
    expect(buf).toEqual(INSTALLER_BYTES);
  });

  it("serves the Linux installer with an .AppImage filename", async () => {
    const res = await worker.fetch(req("/api/download/linux"), makeMultiEnv(), CTX);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Disposition")).toContain('filename="NexCoder-1.0.0.AppImage"');
  });

  it("returns macOS metadata with a platform-correct download URL", async () => {
    const res = await worker.fetch(req("/api/releases/macos"), makeMultiEnv(), CTX);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { downloadUrl: string; platform: string };
    expect(body.platform).toBe("macos");
    expect(body.downloadUrl).toBe("/api/download/macos");
  });

  it("returns Linux metadata with a platform-correct download URL", async () => {
    const res = await worker.fetch(req("/api/releases/linux"), makeMultiEnv(), CTX);
    const body = (await res.json()) as { downloadUrl: string };
    expect(body.downloadUrl).toBe("/api/download/linux");
  });

  it("supports HEAD + range for macOS", async () => {
    const head = await worker.fetch(req("/api/download/macos", { method: "HEAD" }), makeMultiEnv(), CTX);
    expect(head.status).toBe(200);
    expect(head.headers.get("Accept-Ranges")).toBe("bytes");
    const partial = await worker.fetch(
      req("/api/download/macos", { headers: { Range: "bytes=0-3" } }),
      makeMultiEnv(),
      CTX,
    );
    expect(partial.status).toBe(206);
  });

  it("rejects an unknown platform path with 404", async () => {
    const res = await worker.fetch(req("/api/download/freebsd"), makeMultiEnv(), CTX);
    expect(res.status).toBe(404);
  });
});

describe("cross-platform validation", () => {
  it("accepts valid macOS and Linux manifests", () => {
    expect(validateManifest(validManifestFor("macos")).ok).toBe(true);
    expect(validateManifest(validManifestFor("linux")).ok).toBe(true);
  });

  it("rejects a macOS manifest carrying a Windows .exe filename", () => {
    expect(validateManifest(validManifestFor("macos", { filename: "NexCoder-1.0.0.exe" })).ok).toBe(false);
  });

  it("rejects a Linux manifest whose object key points at another platform", () => {
    const bad = validManifestFor("linux", {
      objectKey: "releases/windows/stable/1.0.0/NexCoder-Setup-1.0.0.exe",
    });
    expect(validateManifest(bad).ok).toBe(false);
  });

  it("rejects a platform/route mismatch (macOS manifest under the windows key)", async () => {
    const bucket = new FakeR2Bucket();
    bucket.put("manifests/windows-stable.json", JSON.stringify(validManifestFor("macos")));
    const env: Env = {
      RELEASES: bucket as unknown as R2Bucket,
      WINDOWS_STABLE_MANIFEST_KEY: "manifests/windows-stable.json",
      ENVIRONMENT: "test",
    };
    const res = await worker.fetch(req("/api/download/windows"), env, CTX);
    expect(res.status).toBe(503);
  });

  it("still returns 404 for an unknown installer object (linux)", async () => {
    const env = makeEnv(validManifestFor("linux")); // manifest seeded, installer not
    const bucket = env.RELEASES as unknown as FakeR2Bucket;
    bucket.delete("releases/linux/stable/1.0.0/NexCoder-1.0.0.AppImage");
    const res = await worker.fetch(req("/api/download/linux"), env, CTX);
    expect(res.status).toBe(404);
  });
});
