# NexCoder Web

Marketing website for **NexCoder**, the agentic coding IDE for the Nexa
ecosystem. Built with Next.js 14 (App Router), React 18, TypeScript, and
Tailwind CSS. Deploys to **Vercel**.

## Development

```bash
npm install
npm run dev        # http://localhost:3000
```

## Scripts

```bash
npm run build      # production build (next build)
npm run start      # serve the production build
npm run lint       # next lint
npm run typecheck  # tsc --noEmit
npm test           # vitest (website unit/component tests)
```

## Structure

- `app/(site)/` — marketing pages (home, features, cli, download)
- `components/marketing/` — shared layout, nav, footer, section, download UI
- `lib/` — `site-content.ts` (page copy) and `releases.ts` (download endpoints/helpers)
- `public/` — brand mark, screenshots, and the animated CLI demo
- `cloudflare/download-worker/` — Cloudflare Worker that streams installers from
  private R2 (its own project; excluded from the Vercel build)
- `scripts/`, `docs/` — release publication script and documentation

## Deploying to Vercel

Vercel auto-detects Next.js — no special configuration is required. Import the
repo, and Vercel uses `next build` and serves the App Router output. The
`cloudflare/`, `docs/`, and `scripts/` folders are excluded from the deploy via
`.vercelignore`.

### Download endpoints

The download page calls `/api/download/<platform>` and
`/api/releases/<platform>`. In production these are served **not** by Vercel but
by the Cloudflare Worker attached to `nexcoder.trynexa-ai.com` (see
[`docs/NEXCODER_DOWNLOAD_SYSTEM.md`](docs/NEXCODER_DOWNLOAD_SYSTEM.md)). For that
to work, the domain's DNS record must be proxied through Cloudflare.

### Environment variables (optional)

All are public and optional — the defaults are same-origin:

| Variable                              | Purpose                                         |
| ------------------------------------- | ----------------------------------------------- |
| `NEXT_PUBLIC_NEXCODER_API_BASE`       | Base for download/releases APIs (dev: worker URL) |

No secrets belong in this repo. The Worker uses an R2 **binding**, not keys.
