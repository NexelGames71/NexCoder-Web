/**
 * Minimal in-memory R2 stand-in for tests. Implements only the subset of the
 * R2 API the Worker uses: head, get, and get-with-range. No Cloudflare runtime
 * or network is required, so `vitest run` works in CI.
 */
import type { Env } from "../src/types";

function toStream(bytes: Uint8Array): ReadableStream<Uint8Array> {
  // `new Response(bytes).body` yields a standard ReadableStream in Node 18+.
  return new Response(bytes).body as ReadableStream<Uint8Array>;
}

class FakeR2Object {
  constructor(
    public readonly key: string,
    public readonly bytes: Uint8Array,
    public readonly uploaded: Date,
    public readonly etagValue: string,
  ) {}
  get size(): number {
    return this.bytes.byteLength;
  }
  get etag(): string {
    return this.etagValue;
  }
  get httpEtag(): string {
    return `"${this.etagValue}"`;
  }
  writeHttpMetadata(_headers: Headers): void {
    /* no-op for tests */
  }
}

class FakeR2ObjectBody extends FakeR2Object {
  constructor(
    key: string,
    fullBytes: Uint8Array,
    uploaded: Date,
    etagValue: string,
    private readonly slice: Uint8Array,
    public readonly range?: { offset: number; length: number },
  ) {
    super(key, fullBytes, uploaded, etagValue);
  }
  get body(): ReadableStream<Uint8Array> {
    return toStream(this.slice);
  }
  async text(): Promise<string> {
    return new TextDecoder().decode(this.slice);
  }
  async arrayBuffer(): Promise<ArrayBuffer> {
    return this.slice.buffer.slice(
      this.slice.byteOffset,
      this.slice.byteOffset + this.slice.byteLength,
    ) as ArrayBuffer;
  }
}

interface StoredObject {
  bytes: Uint8Array;
  uploaded: Date;
  etag: string;
}

export class FakeR2Bucket {
  private store = new Map<string, StoredObject>();

  put(key: string, content: string | Uint8Array, uploaded = new Date("2026-07-20T00:00:00.000Z")): void {
    const bytes = typeof content === "string" ? new TextEncoder().encode(content) : content;
    const etag = `etag-${key.replace(/[^a-z0-9]/gi, "")}-${bytes.byteLength}`;
    this.store.set(key, { bytes, uploaded, etag });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  async head(key: string): Promise<FakeR2Object | null> {
    const obj = this.store.get(key);
    if (!obj) return null;
    return new FakeR2Object(key, obj.bytes, obj.uploaded, obj.etag);
  }

  async get(
    key: string,
    options?: { range?: { offset?: number; length?: number } },
  ): Promise<FakeR2ObjectBody | null> {
    const obj = this.store.get(key);
    if (!obj) return null;
    const range = options?.range;
    if (range && (range.offset !== undefined || range.length !== undefined)) {
      const offset = range.offset ?? 0;
      const length = range.length ?? obj.bytes.byteLength - offset;
      const slice = obj.bytes.subarray(offset, offset + length);
      return new FakeR2ObjectBody(key, obj.bytes, obj.uploaded, obj.etag, slice, { offset, length });
    }
    return new FakeR2ObjectBody(key, obj.bytes, obj.uploaded, obj.etag, obj.bytes);
  }
}

interface PlatformFixture {
  manifestKey: string;
  platform: string;
  architecture: string;
  minimumOperatingSystem: string;
  filename: string;
  objectKey: string;
}

export const PLATFORM_FIXTURES: Record<string, PlatformFixture> = {
  windows: {
    manifestKey: "manifests/windows-stable.json",
    platform: "windows",
    architecture: "x64",
    minimumOperatingSystem: "Windows 10 64-bit",
    filename: "NexCoder-Setup-1.0.0.exe",
    objectKey: "releases/windows/stable/1.0.0/NexCoder-Setup-1.0.0.exe",
  },
  macos: {
    manifestKey: "manifests/macos-stable.json",
    platform: "macos",
    architecture: "universal",
    minimumOperatingSystem: "macOS 12 Monterey",
    filename: "NexCoder-1.0.0.dmg",
    objectKey: "releases/macos/stable/1.0.0/NexCoder-1.0.0.dmg",
  },
  linux: {
    manifestKey: "manifests/linux-stable.json",
    platform: "linux",
    architecture: "x64",
    minimumOperatingSystem: "Ubuntu 20.04+",
    filename: "NexCoder-1.0.0.AppImage",
    objectKey: "releases/linux/stable/1.0.0/NexCoder-1.0.0.AppImage",
  },
};

/** A valid manifest for a platform (defaults to Windows). */
export function validManifestFor(
  platform: "windows" | "macos" | "linux" = "windows",
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  const f = PLATFORM_FIXTURES[platform]!;
  return {
    schemaVersion: 1,
    product: "NexCoder",
    channel: "stable",
    version: "1.0.0",
    releaseDate: "2026-07-20T00:00:00.000Z",
    platform: f.platform,
    architecture: f.architecture,
    minimumOperatingSystem: f.minimumOperatingSystem,
    filename: f.filename,
    objectKey: f.objectKey,
    contentType: "application/octet-stream",
    sizeBytes: 32,
    sha256: "a".repeat(64),
    releaseNotesUrl: "https://nexcoder.trynexa-ai.com/releases/1.0.0",
    published: true,
    ...overrides,
  };
}

/** Back-compat alias for the Windows manifest. */
export function validManifest(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return validManifestFor("windows", overrides);
}

export const INSTALLER_BYTES = new TextEncoder().encode("NEXCODER-FAKE-INSTALLER-BODY-123");

function baseEnv(bucket: FakeR2Bucket): Env {
  return {
    RELEASES: bucket as unknown as R2Bucket,
    WINDOWS_STABLE_MANIFEST_KEY: "manifests/windows-stable.json",
    MACOS_STABLE_MANIFEST_KEY: "manifests/macos-stable.json",
    LINUX_STABLE_MANIFEST_KEY: "manifests/linux-stable.json",
    ENVIRONMENT: "test",
    WORKER_VERSION: "test",
  };
}

/** Build an Env with a single (Windows by default) seeded manifest + installer. */
export function makeEnv(
  manifest: Record<string, unknown> = validManifest(),
  installer: Uint8Array = INSTALLER_BYTES,
): Env {
  const bucket = new FakeR2Bucket();
  const key =
    manifest.platform === "macos"
      ? "manifests/macos-stable.json"
      : manifest.platform === "linux"
        ? "manifests/linux-stable.json"
        : "manifests/windows-stable.json";
  bucket.put(key, JSON.stringify(manifest));
  if (typeof manifest.objectKey === "string") {
    bucket.put(manifest.objectKey, installer);
  }
  return baseEnv(bucket);
}

/** Build an Env with all three platforms seeded. */
export function makeMultiEnv(installer: Uint8Array = INSTALLER_BYTES): Env {
  const bucket = new FakeR2Bucket();
  for (const platform of ["windows", "macos", "linux"] as const) {
    const manifest = validManifestFor(platform);
    bucket.put(PLATFORM_FIXTURES[platform]!.manifestKey, JSON.stringify(manifest));
    bucket.put(PLATFORM_FIXTURES[platform]!.objectKey, installer);
  }
  return baseEnv(bucket);
}

export const CTX = {
  waitUntil() {},
  passThroughOnException() {},
} as unknown as ExecutionContext;
