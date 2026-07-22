# NexCoder Download Distribution System

Production system for distributing NexCoder installers for **Windows, macOS, and
Linux** from a **private** Cloudflare R2 bucket, streamed through
`https://nexcoder.trynexa-ai.com` — no `r2.dev` URLs, no public buckets, no
redirects.

Public endpoints (stable, unversioned aliases):

| Platform | Download                        | Metadata                        |
| -------- | ------------------------------- | ------------------------------- |
| Windows  | `/api/download/windows`         | `/api/releases/windows`         |
| macOS    | `/api/download/macos`           | `/api/releases/macos`           |
| Linux    | `/api/download/linux`           | `/api/releases/linux`           |

---

## 1. Architecture overview

```
User → https://nexcoder.trynexa-ai.com/download        (Next.js page, Vercel origin)
        │  clicks "Download NexCoder for Windows"
        ▼
     https://nexcoder.trynexa-ai.com/api/download/windows
        │  Worker Route intercepts /api/download/* and /api/releases/*
        ▼
     Cloudflare Worker (nexcoder-downloads)
        │  reads + validates manifests/windows-stable.json
        │  streams the installer via the RELEASES R2 binding
        ▼
     Private R2 bucket: nexcoder-releases
        ▼
     NexCoder-Setup-{version}.exe   (streamed, never redirected)
```

The website (page `/download`, everything except the two API paths) is served by
the existing origin. The Worker intercepts **only** `/api/download/*` and
`/api/releases/*`.

## 2. Request flow

| Request                                        | Handler | Behavior                                            |
| ---------------------------------------------- | ------- | --------------------------------------------------- |
| `GET/HEAD /download`                           | Origin  | Renders the download page                           |
| `GET/HEAD /api/releases/{windows\|macos\|linux}` | Worker  | Sanitized JSON release metadata                     |
| `GET/HEAD /api/download/{windows\|macos\|linux}` | Worker  | Streams the installer from private R2 (200/206/304) |
| `GET/HEAD /api/download/health`                | Worker  | Health JSON                                         |
| Other methods on the above                     | Worker  | `405` with `Allow: GET, HEAD`                       |
| Any other `/api/download/*` path               | Worker  | `404`                                               |

## 3. Repository files added

```
cloudflare/download-worker/
  src/{index,manifest,responses,security,types}.ts   Worker implementation
  test/{manifest,routing,download}.test.ts           Vitest suites (+ fake-r2.ts)
  dev/manifests/windows-stable.json                  Dev manifest fixture
  dev/releases/.../NexCoder-Setup-0.0.0-dev.exe      Dummy dev installer
  wrangler.jsonc  package.json  tsconfig.json  README.md  .dev.vars.example  .gitignore

lib/releases.ts                                      Endpoint config + helpers (one source)
components/marketing/DownloadPanel.tsx               Client download card (states)
app/(site)/download/page.tsx                         Redesigned download page
scripts/publish-nexcoder-release.ps1                 Release publication script
docs/NEXCODER_DOWNLOAD_SYSTEM.md                     This document
docs/NEXCODER_RELEASE_RUNBOOK.md                     Operational runbook
.env.example  .gitignore                             Env + ignore updates
```

## 4. R2 bucket setup (private)

```bash
wrangler r2 bucket create nexcoder-releases
```

Object layout:

```
nexcoder-releases/
  manifests/windows-stable.json
  manifests/macos-stable.json
  manifests/linux-stable.json
  releases/windows/stable/<version>/NexCoder-Setup-<version>.exe   (+ SHA256SUMS.txt, release-notes.md)
  releases/macos/stable/<version>/NexCoder-<version>.dmg           (+ SHA256SUMS.txt, release-notes.md)
  releases/linux/stable/<version>/NexCoder-<version>.AppImage      (+ SHA256SUMS.txt, release-notes.md)
```

Per-platform installer extensions (validated): Windows `.exe`/`.msi`, macOS
`.dmg`/`.pkg`, Linux `.AppImage`/`.deb`/`.rpm`/`.tar.gz`.

**Private-bucket requirements**

- Do **not** enable the `r2.dev` public URL.
- Do **not** attach a public custom domain to the bucket.
- Access is exclusively through the Worker's `RELEASES` binding — no access keys
  live in the Worker.

## 5. DNS + Worker Route setup

- `nexcoder.trynexa-ai.com` must be a DNS record in the `trynexa-ai.com` zone,
  pointing at the website host (Vercel) and **proxied** (orange cloud). The
  Worker Routes only execute for proxied hostnames.
- Routes (in `wrangler.jsonc`) attach the Worker to:
  - `nexcoder.trynexa-ai.com/api/download/*`
  - `nexcoder.trynexa-ai.com/api/releases/*`
- The Worker never intercepts `/`, `/download`, static assets, or other APIs.

## 6. Wrangler deployment

```bash
cd cloudflare/download-worker
npm install
npm run typecheck && npm test          # gates
wrangler login                         # owner credentials (not committed)
wrangler deploy                        # attaches routes + R2 binding
```

`workers_dev` is `false`, so there is no `*.workers.dev` URL.

## 7. Local development

See `cloudflare/download-worker/README.md`. Summary:

```bash
cd cloudflare/download-worker
cp .dev.vars.example .dev.vars
wrangler r2 object put nexcoder-releases/manifests/windows-stable.json --file dev/manifests/windows-stable.json --local
wrangler r2 object put nexcoder-releases/releases/windows/stable/0.0.0-dev/NexCoder-Setup-0.0.0-dev.exe --file dev/releases/windows/stable/0.0.0-dev/NexCoder-Setup-0.0.0-dev.exe --local
npm run dev          # http://localhost:8787
```

Point the website at the local Worker via `.env.local`:

```
NEXT_PUBLIC_NEXCODER_DOWNLOAD_ENDPOINT=http://localhost:8787/api/download/windows
NEXT_PUBLIC_NEXCODER_RELEASES_ENDPOINT=http://localhost:8787/api/releases/windows
```

## 8. Manifest schema

Stored privately at `manifests/windows-stable.json`. Full type in
`cloudflare/download-worker/src/types.ts`; validator in `src/manifest.ts`.

```jsonc
{
  "schemaVersion": 1,
  "product": "NexCoder",
  "channel": "stable",
  "version": "1.0.0",
  "releaseDate": "2026-07-20T00:00:00.000Z",
  "platform": "windows",
  "architecture": "x64",
  "minimumOperatingSystem": "Windows 10 64-bit",
  "filename": "NexCoder-Setup-1.0.0.exe",
  "objectKey": "releases/windows/stable/1.0.0/NexCoder-Setup-1.0.0.exe", // PRIVATE
  "contentType": "application/octet-stream",
  "sizeBytes": 185000000,
  "sha256": "<64 hex chars>",
  "releaseNotesUrl": "https://nexcoder.trynexa-ai.com/releases/1.0.0",
  "published": true
}
```

Every field is validated before any R2 object is fetched (schema version,
product, channel, semver, platform, architecture, safe filename, `.exe`
extension, approved object-key prefix, no `..`, no leading `/`, non-negative
integer size, 64-hex sha256, valid ISO date, `published === true`). An invalid
manifest returns a controlled service error and logs the reason — it never
triggers an arbitrary object fetch.

`/api/releases/windows` returns a **sanitized** subset (see
`toPublicRelease`) — `objectKey`, bucket name, account ID, and endpoints are
never exposed.

## 9. Release publication

Use `scripts/publish-nexcoder-release.ps1` (see the runbook). It uploads the
installer, checksum, and notes first, then the manifest **last**, then verifies
the public endpoints.

## 10. Rollback

The stable manifest controls the active version — rollback needs no website
redeploy. See the runbook's "Rollback" section.

## 11. Checksum verification

```powershell
Get-FileHash .\NexCoder-Setup-1.0.0.exe -Algorithm SHA256
```

Compare against the checksum shown on `/download`, in the manifest, and in
`SHA256SUMS.txt`. Compute the SHA-256 only **after** the installer is signed.

## 12. Error troubleshooting

| Symptom                        | Likely cause / action                                            |
| ------------------------------ | ---------------------------------------------------------------- |
| `503` from the endpoints       | Manifest missing/unreadable in R2, or invalid JSON               |
| `404` from `/api/download/...` | Manifest points to a missing installer object, or unknown path   |
| Metadata "temporarily unavailable" on the page | Releases endpoint unreachable; page stays usable   |
| `405`                          | Non-GET/HEAD method                                              |
| `416`                          | Unsatisfiable `Range`                                            |
| Route not firing               | `nexcoder.trynexa-ai.com` not proxied (orange cloud) in DNS      |

Detailed causes are logged server-side (structured JSON) — public responses stay
sanitized.

## 13. Range-request testing

```bash
curl -H "Range: bytes=0-1023" -D - -o first-1kb.bin \
  https://nexcoder.trynexa-ai.com/api/download/windows
# Expect: 206 Partial Content, Content-Range: bytes 0-1023/<total>
```

## 14. Security considerations

- Private R2 bucket; no `r2.dev`; no public custom domain.
- No generic object proxy and no user-supplied object keys — only the fixed
  `/api/download/windows` alias, resolved through a validated manifest.
- GET/HEAD only; strict route allowlist; `404` for everything else.
- Manifest + filename + object-key validation; path-traversal prevention.
- No credentials in client code or Git; the Worker uses the R2 binding.
- Sanitized errors; `X-Content-Type-Options: nosniff`;
  `Cross-Origin-Resource-Policy: same-site`.
- Recommended Cloudflare hardening: a rate-limiting rule on
  `/api/download/windows` (e.g. per-IP requests/minute), and a WAF managed
  ruleset on the zone. Abuse protection should live at the edge, not in app auth
  — the public stable installer stays unauthenticated.

## 15. Supported platforms & adding more

**Windows, macOS, and Linux** stable channels are implemented. Each is a manifest
key (`manifests/<platform>-stable.json`), a route (`/api/download/<platform>`,
`/api/releases/<platform>`), and a website tab — all sharing one code path
(`loadManifest` → `parseAndValidateManifest` → streaming/range/conditional).

To extend further without breaking the stable aliases:

- **New channel** (e.g. beta): add `manifests/<platform>-beta.json`; `beta` is
  already in `ALLOWED_CHANNELS`.
- **New architecture**: add to `ALLOWED_ARCHITECTURES` in `src/security.ts`.
- **New platform**: add it to `ALLOWED_PLATFORMS` + `PLATFORM_EXTENSIONS`
  (`src/security.ts`), to the `PLATFORMS`/regex in `src/index.ts`, to the
  website `PLATFORMS` list (`lib/releases.ts`), and add a `-Platform` entry in
  the publish script.
- Object keys are validated to start with `releases/<platform>/`, and each
  manifest's `platform` must match the route it is served on.

## 16. Future updater integration

A future in-app updater can consume the **same** `/api/releases/<platform>`
metadata: read `version`, compare with the installed version, and — if newer and
`published` — download `downloadUrl`, verify `sha256`, and install. Because the
manifest is the single source of truth and the download alias is stable, the
updater needs no additional infrastructure.
