import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import DownloadPanel from "../components/marketing/DownloadPanel";
import type { PlatformInfo } from "../lib/releases";

const WINDOWS: PlatformInfo = {
  id: "windows",
  label: "Windows",
  osLabel: "Windows 10 / 11, 64-bit",
  fileHint: ".exe installer",
};
const MACOS: PlatformInfo = {
  id: "macos",
  label: "macOS",
  osLabel: "macOS 12 Monterey or later",
  fileHint: ".dmg disk image",
};

const RELEASE = {
  product: "NexCoder",
  channel: "stable",
  version: "1.0.0",
  releaseDate: "2026-07-20T00:00:00.000Z",
  platform: "windows",
  architecture: "x64",
  minimumOperatingSystem: "Windows 10 64-bit",
  filename: "NexCoder-Setup-1.0.0.exe",
  sizeBytes: 185000000,
  sha256: "a".repeat(64),
  releaseNotesUrl: "https://nexcoder.trynexa-ai.com/releases/1.0.0",
  downloadUrl: "/api/download/windows",
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("DownloadPanel", () => {
  it("renders the ready state with a same-origin download link", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify(RELEASE), { status: 200 })),
    );

    render(<DownloadPanel platform={WINDOWS} />);

    const link = await screen.findByRole("link", { name: /download nexcoder for windows/i });
    expect(link).toHaveAttribute("href", "/api/download/windows");
    expect(link).not.toHaveAttribute("target"); // never opens a new tab
    expect(link).toHaveAttribute("download");

    await waitFor(() => {
      expect(screen.getByText(/Version 1\.0\.0/)).toBeInTheDocument();
    });
    // "185 MB" appears in both the supporting line and the detail grid.
    expect(screen.getAllByText(/185 MB/).length).toBeGreaterThan(0);
    expect(screen.getByText("a".repeat(64))).toBeInTheDocument(); // checksum
  });

  it("shows a safe unavailable state on metadata failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("nope", { status: 503 })),
    );

    render(<DownloadPanel platform={WINDOWS} />);

    await waitFor(() => {
      expect(screen.getByText(/temporarily unavailable/i)).toBeInTheDocument();
    });
    // Primary download action is hidden when metadata cannot load.
    expect(screen.queryByRole("link", { name: /download nexcoder for windows/i })).toBeNull();
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });

  it("targets the macOS endpoint when given the macOS platform", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ ...RELEASE, platform: "macos", downloadUrl: "/api/download/macos" }), { status: 200 })),
    );

    render(<DownloadPanel platform={MACOS} />);

    const link = await screen.findByRole("link", { name: /download nexcoder for macos/i });
    expect(link).toHaveAttribute("href", "/api/download/macos");
    expect(link).not.toHaveAttribute("target");
  });
});
