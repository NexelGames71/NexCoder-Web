# NexCoder Download Worker

Cloudflare Worker that streams NexCoder installers from a **private** R2 bucket
(`nexcoder-releases`) over `nexcoder.trynexa-ai.com`. No redirects, no public
bucket URLs, no user-controlled object keys.

Full documentation: [`../../docs/NEXCODER_DOWNLOAD_SYSTEM.md`](../../docs/NEXCODER_DOWNLOAD_SYSTEM.md).
Publishing a release: [`../../docs/NEXCODER_RELEASE_RUNBOOK.md`](../../docs/NEXCODER_RELEASE_RUNBOOK.md).

## Routes

| Method     | Path                                        | Purpose                                  |
| ---------- | ------------------------------------------- | ---------------------------------------- |
| GET / HEAD | `/api/download/{windows\|macos\|linux}`     | Stream the stable installer for a platform |
| GET / HEAD | `/api/releases/{windows\|macos\|linux}`     | Sanitized public release metadata (JSON) |
| GET / HEAD | `/api/download/health`                      | Health probe                             |

Any other method returns `405 Method Not Allowed` (`Allow: GET, HEAD`). Any
other path returns `404 Not Found`. There is no generic object proxy.

## Install & verify

```bash
cd cloudflare/download-worker
npm install
npm run typecheck   # tsc --noEmit
npm test            # vitest run (uses an in-memory R2 fake, no network)
npm run build       # wrangler deploy --dry-run (bundles; no login required)
```

## Local development (with R2 emulation)

```bash
# 1. Copy local vars
cp .dev.vars.example .dev.vars

# 2. Seed the LOCAL R2 bucket with dev fixtures (Windows shown; macOS/Linux follow
#    the same pattern using dev/manifests/{macos,linux}-stable.json + their dummies)
wrangler r2 object put nexcoder-releases/manifests/windows-stable.json \
  --file dev/manifests/windows-stable.json --local
wrangler r2 object put nexcoder-releases/releases/windows/stable/0.0.0-dev/NexCoder-Setup-0.0.0-dev.exe \
  --file dev/releases/windows/stable/0.0.0-dev/NexCoder-Setup-0.0.0-dev.exe --local
# macOS + Linux:
wrangler r2 object put nexcoder-releases/manifests/macos-stable.json --file dev/manifests/macos-stable.json --local
wrangler r2 object put nexcoder-releases/releases/macos/stable/0.0.0-dev/NexCoder-0.0.0-dev.dmg \
  --file dev/releases/macos/stable/0.0.0-dev/NexCoder-0.0.0-dev.dmg --local
wrangler r2 object put nexcoder-releases/manifests/linux-stable.json --file dev/manifests/linux-stable.json --local
wrangler r2 object put nexcoder-releases/releases/linux/stable/0.0.0-dev/NexCoder-0.0.0-dev.AppImage \
  --file dev/releases/linux/stable/0.0.0-dev/NexCoder-0.0.0-dev.AppImage --local

# 3. Run the Worker locally (defaults to http://localhost:8787)
npm run dev

# 4. Try it
curl -I http://localhost:8787/api/download/windows
curl    http://localhost:8787/api/releases/windows
```

Point the website at the local Worker by setting, in the website's `.env.local`:

```
NEXT_PUBLIC_NEXCODER_DOWNLOAD_ENDPOINT=http://localhost:8787/api/download/windows
NEXT_PUBLIC_NEXCODER_RELEASES_ENDPOINT=http://localhost:8787/api/releases/windows
```

## Deploy (owner only)

Requires a Cloudflare login with access to the `trynexa-ai.com` zone and the
`nexcoder-releases` bucket. The `nexcoder.trynexa-ai.com` DNS record must be
**proxied** (orange cloud) for the routes to execute.

```bash
wrangler login
wrangler r2 bucket create nexcoder-releases   # once, if it does not exist
wrangler deploy
```

Never commit `.dev.vars`, `.wrangler/`, API tokens, or R2 access keys.
