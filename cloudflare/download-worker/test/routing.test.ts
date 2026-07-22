import { describe, expect, it } from "vitest";
import worker from "../src/index";
import { CTX, FakeR2Bucket, makeEnv, validManifest } from "./fake-r2";
import type { Env } from "../src/types";

const ORIGIN = "https://nexcoder.trynexa-ai.com";
function req(path: string, init?: RequestInit): Request {
  return new Request(`${ORIGIN}${path}`, init);
}

describe("routing", () => {
  it("serves the health endpoint", async () => {
    const res = await worker.fetch(req("/api/download/health"), makeEnv(), CTX);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string };
    expect(body.status).toBe("ok");
  });

  it("returns 404 for unknown paths", async () => {
    const res = await worker.fetch(req("/api/download/solaris"), makeEnv(), CTX);
    expect(res.status).toBe(404);
  });

  it("does not expose a generic object proxy", async () => {
    const res = await worker.fetch(
      req("/api/download?key=releases/windows/stable/1.0.0/NexCoder-Setup-1.0.0.exe"),
      makeEnv(),
    CTX);
    expect(res.status).toBe(404);
  });

  it("rejects POST with 405 and an Allow header", async () => {
    const res = await worker.fetch(req("/api/download/windows", { method: "POST" }), makeEnv(), CTX);
    expect(res.status).toBe(405);
    expect(res.headers.get("Allow")).toBe("GET, HEAD");
  });

  it("rejects PUT on the releases endpoint with 405", async () => {
    const res = await worker.fetch(req("/api/releases/windows", { method: "PUT" }), makeEnv(), CTX);
    expect(res.status).toBe(405);
  });

  it("returns 503 when the manifest object is missing", async () => {
    const bucket = new FakeR2Bucket(); // empty
    const env: Env = {
      RELEASES: bucket as unknown as R2Bucket,
      WINDOWS_STABLE_MANIFEST_KEY: "manifests/windows-stable.json",
      ENVIRONMENT: "test",
    };
    const res = await worker.fetch(req("/api/releases/windows"), env, CTX);
    expect(res.status).toBe(503);
  });

  it("returns a service error when the manifest is invalid", async () => {
    const env = makeEnv(validManifest({ sha256: "bad" }));
    const res = await worker.fetch(req("/api/releases/windows"), env, CTX);
    expect(res.status).toBeGreaterThanOrEqual(500);
  });

  it("returns 404 when the installer object is missing", async () => {
    const bucket = new FakeR2Bucket();
    bucket.put("manifests/windows-stable.json", JSON.stringify(validManifest()));
    // note: installer object intentionally NOT put
    const env: Env = {
      RELEASES: bucket as unknown as R2Bucket,
      WINDOWS_STABLE_MANIFEST_KEY: "manifests/windows-stable.json",
      ENVIRONMENT: "test",
    };
    const res = await worker.fetch(req("/api/download/windows"), env, CTX);
    expect(res.status).toBe(404);
  });
});

describe("public metadata", () => {
  it("returns sanitized fields only", async () => {
    const res = await worker.fetch(req("/api/releases/windows"), makeEnv(), CTX);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).not.toContain("objectKey");
    expect(text).not.toContain("nexcoder-releases");
    expect(text).not.toContain("r2.dev");
    expect(text).not.toContain("r2.cloudflarestorage.com");
    const body = JSON.parse(text) as { downloadUrl: string; version: string };
    expect(body.downloadUrl).toBe("/api/download/windows");
    expect(body.version).toBe("1.0.0");
  });

  it("supports HEAD without a body", async () => {
    const res = await worker.fetch(req("/api/releases/windows", { method: "HEAD" }), makeEnv(), CTX);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("");
  });
});
