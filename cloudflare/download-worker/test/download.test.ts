import { describe, expect, it } from "vitest";
import worker from "../src/index";
import { CTX, INSTALLER_BYTES, makeEnv } from "./fake-r2";

const ORIGIN = "https://nexcoder.trynexa-ai.com";
function req(path: string, init?: RequestInit): Request {
  return new Request(`${ORIGIN}${path}`, init);
}

describe("download response", () => {
  it("streams the full installer with correct headers", async () => {
    const res = await worker.fetch(req("/api/download/windows"), makeEnv(), CTX);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/octet-stream");
    expect(res.headers.get("Content-Disposition")).toContain('filename="NexCoder-Setup-1.0.0.exe"');
    expect(res.headers.get("Content-Disposition")).toContain("filename*=UTF-8''");
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(res.headers.get("Accept-Ranges")).toBe("bytes");
    expect(res.headers.get("ETag")).toBeTruthy();
    expect(res.headers.get("Last-Modified")).toBeTruthy();
    expect(res.headers.get("Content-Length")).toBe(String(INSTALLER_BYTES.byteLength));
    const buf = new Uint8Array(await res.arrayBuffer());
    expect(buf).toEqual(INSTALLER_BYTES);
  });

  it("never redirects", async () => {
    const res = await worker.fetch(req("/api/download/windows"), makeEnv(), CTX);
    expect([301, 302, 303, 307, 308]).not.toContain(res.status);
    expect(res.headers.get("Location")).toBeNull();
  });

  it("never leaks R2 URLs or the bucket name in headers", async () => {
    const res = await worker.fetch(req("/api/download/windows"), makeEnv(), CTX);
    const dumped = [...res.headers.entries()].map(([k, v]) => `${k}: ${v}`).join("\n");
    expect(dumped).not.toContain("r2.dev");
    expect(dumped).not.toContain("r2.cloudflarestorage.com");
    expect(dumped).not.toContain("nexcoder-releases");
    expect(dumped).not.toContain("releases/windows/stable");
  });

  it("returns metadata-only for HEAD", async () => {
    const res = await worker.fetch(req("/api/download/windows", { method: "HEAD" }), makeEnv(), CTX);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Length")).toBe(String(INSTALLER_BYTES.byteLength));
    expect(res.headers.get("Accept-Ranges")).toBe("bytes");
    expect(await res.text()).toBe("");
  });

  it("serves a single byte range as 206", async () => {
    const res = await worker.fetch(
      req("/api/download/windows", { headers: { Range: "bytes=0-3" } }),
      makeEnv(),
      CTX,
    );
    expect(res.status).toBe(206);
    expect(res.headers.get("Content-Range")).toBe(`bytes 0-3/${INSTALLER_BYTES.byteLength}`);
    expect(res.headers.get("Content-Length")).toBe("4");
    const buf = new Uint8Array(await res.arrayBuffer());
    expect(buf).toEqual(INSTALLER_BYTES.subarray(0, 4));
  });

  it("serves an open-ended range", async () => {
    const res = await worker.fetch(
      req("/api/download/windows", { headers: { Range: "bytes=4-" } }),
      makeEnv(),
      CTX,
    );
    expect(res.status).toBe(206);
    const total = INSTALLER_BYTES.byteLength;
    expect(res.headers.get("Content-Range")).toBe(`bytes 4-${total - 1}/${total}`);
    const buf = new Uint8Array(await res.arrayBuffer());
    expect(buf).toEqual(INSTALLER_BYTES.subarray(4));
  });

  it("serves a suffix range", async () => {
    const res = await worker.fetch(
      req("/api/download/windows", { headers: { Range: "bytes=-5" } }),
      makeEnv(),
      CTX,
    );
    expect(res.status).toBe(206);
    const total = INSTALLER_BYTES.byteLength;
    expect(res.headers.get("Content-Range")).toBe(`bytes ${total - 5}-${total - 1}/${total}`);
  });

  it("returns 416 for an unsatisfiable range with the total size", async () => {
    const res = await worker.fetch(
      req("/api/download/windows", { headers: { Range: "bytes=99999-" } }),
      makeEnv(),
      CTX,
    );
    expect(res.status).toBe(416);
    expect(res.headers.get("Content-Range")).toBe(`bytes */${INSTALLER_BYTES.byteLength}`);
  });

  it("returns 304 when If-None-Match matches the ETag", async () => {
    const env = makeEnv();
    const first = await worker.fetch(req("/api/download/windows", { method: "HEAD" }), env, CTX);
    const etag = first.headers.get("ETag")!;
    const res = await worker.fetch(
      req("/api/download/windows", { headers: { "If-None-Match": etag } }),
      env,
      CTX,
    );
    expect(res.status).toBe(304);
    expect(await res.text()).toBe("");
  });
});
