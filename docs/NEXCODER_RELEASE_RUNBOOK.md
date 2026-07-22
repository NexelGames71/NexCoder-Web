# NexCoder Release Runbook

Publish or roll back a NexCoder Windows release without reading the full
architecture doc. Full details: [`NEXCODER_DOWNLOAD_SYSTEM.md`](./NEXCODER_DOWNLOAD_SYSTEM.md).

## Prerequisites (once)

```bash
npm i -g wrangler
wrangler login                              # account with the trynexa-ai.com zone + R2
wrangler r2 bucket create nexcoder-releases # only if it does not already exist
```

The `nexcoder.trynexa-ai.com` DNS record must be **proxied** (orange cloud).

## Correct release order

```
Build → Test → Sign → Verify signature → SHA-256 → Upload installer → Upload manifest
```

Compute the SHA-256 **after** signing. Never commit installers or certificates.

## Publish a release

Pass `-Platform windows|macos|linux` (default `windows`). Expected filenames:
`NexCoder-Setup-<version>.exe`, `NexCoder-<version>.dmg`,
`NexCoder-<version>.AppImage`. Publish each platform separately.

```powershell
# Dry run first (validates + writes the manifest, uploads nothing):
.\scripts\publish-nexcoder-release.ps1 -Platform windows `
  -InstallerPath ".\release\NexCoder-Setup-1.0.0.exe" -Version "1.0.0" -DryRun

# Real publish (uploads installer + checksum + notes, then manifest LAST):
.\scripts\publish-nexcoder-release.ps1 -Platform windows `
  -InstallerPath ".\release\NexCoder-Setup-1.0.0.exe" -Version "1.0.0" `
  -ReleaseNotesPath ".\release\release-notes-1.0.0.md"

# macOS and Linux:
.\scripts\publish-nexcoder-release.ps1 -Platform macos `
  -InstallerPath ".\release\NexCoder-1.0.0.dmg" -Version "1.0.0"
.\scripts\publish-nexcoder-release.ps1 -Platform linux `
  -InstallerPath ".\release\NexCoder-1.0.0.AppImage" -Version "1.0.0"
```

The script validates the filename/version, computes size + SHA-256, uploads in
the safe order, and verifies `/api/releases/windows` and a HEAD of
`/api/download/windows`. It exits non-zero on any failure.

### Installers larger than ~300 MB

`wrangler r2 object put` is single-part up to ~300 MB. For larger installers use
the S3-compatible multipart path:

```powershell
$env:R2_ACCOUNT_ID="<account-id>"
$env:R2_ACCESS_KEY_ID="<r2-access-key>"      # from a scoped R2 API token; never commit
$env:R2_SECRET_ACCESS_KEY="<r2-secret-key>"
.\scripts\publish-nexcoder-release.ps1 -InstallerPath ".\release\NexCoder-Setup-1.0.0.exe" `
  -Version "1.0.0" -UseS3Multipart
```

## Verify in production

Repeat per platform (`windows`, `macos`, `linux`):

```bash
curl -I https://nexcoder.trynexa-ai.com/api/download/windows      # 200, Content-Disposition, ETag, Accept-Ranges, no Location
curl    https://nexcoder.trynexa-ai.com/api/releases/windows      # version, sha256, downloadUrl; NO objectKey/bucket
curl -H "Range: bytes=0-1023" -D - -o /dev/null \
        https://nexcoder.trynexa-ai.com/api/download/macos        # 206, Content-Range
curl -X POST -D - https://nexcoder.trynexa-ai.com/api/download/linux    # 405, Allow: GET, HEAD
```

## Rollback (no website redeploy)

The stable manifest controls the active version. To roll back from a bad `1.1.0`
to a known-good `1.0.0`:

1. **Preserve** the withdrawn files — do NOT delete `releases/windows/stable/1.1.0/*`.
2. Re-publish the previous version's manifest (its installer is still in R2):
   ```powershell
   .\scripts\publish-nexcoder-release.ps1 `
     -InstallerPath ".\release\NexCoder-Setup-1.0.0.exe" `
     -Version "1.0.0" -Channel "stable" -Force
   ```
   (Or, if you kept the 1.0.0 manifest, just re-upload it as
   `manifests/windows-stable.json` — it is uploaded last and flips the active
   version atomically.)
3. Verify:
   ```bash
   curl https://nexcoder.trynexa-ai.com/api/releases/windows            # version back to 1.0.0
   curl -I https://nexcoder.trynexa-ai.com/api/download/windows         # 200
   ```
4. Confirm the downloaded installer's SHA-256 matches the 1.0.0 checksum.

## Do NOT

- Delete previous releases automatically.
- Upload signing certificates or private keys.
- Commit installers, `.dev.vars`, or Cloudflare tokens.
- Overwrite an existing version's installer silently — bump the version.
