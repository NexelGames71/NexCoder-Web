<#
.SYNOPSIS
    Publish a NexCoder Windows installer to the private Cloudflare R2 bucket and
    update the stable release manifest.

.DESCRIPTION
    Uploads the installer, checksum, and (optional) release notes FIRST, then
    uploads the manifest LAST so the public download endpoint never points at an
    installer that has not finished uploading. Verifies the public endpoints at
    the end. Uses the Wrangler CLI (R2 binding / account auth) - never stores or
    commits Cloudflare credentials.

.EXAMPLE
    .\scripts\publish-nexcoder-release.ps1 `
        -InstallerPath ".\release\NexCoder-Setup-1.0.0.exe" `
        -Version "1.0.0" `
        -Channel "stable"

.NOTES
    Prerequisites: `wrangler login` (or CLOUDFLARE_API_TOKEN set), and access to
    the `nexcoder-releases` bucket + `trynexa-ai.com` zone. Calculate the SHA-256
    only AFTER the installer is signed. Never commit installers to Git.
#>
#requires -Version 5.1
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$InstallerPath,
    [Parameter(Mandatory = $true)][string]$Version,
    [ValidateSet("windows", "macos", "linux")][string]$Platform = "windows",
    [ValidateSet("stable", "beta")][string]$Channel = "stable",
    [string]$ReleaseNotesPath,
    [string]$BucketName = "nexcoder-releases",
    [string]$SiteBaseUrl = "https://nexcoder.trynexa-ai.com",
    [string]$Architecture,
    [string]$MinimumOperatingSystem,
    [switch]$UseS3Multipart,
    [switch]$DryRun,
    [switch]$Force
)

$ErrorActionPreference = "Stop"
function Fail([string]$Message) { Write-Host "ERROR: $Message" -ForegroundColor Red; exit 1 }
function Step([string]$Message) { Write-Host "==> $Message" -ForegroundColor Cyan }
function Ok([string]$Message)   { Write-Host "    $Message" -ForegroundColor Green }

# Per-platform naming, extension, and defaults.
$platformConfig = @{
    windows = @{ Extension = ".exe";      Filename = "NexCoder-Setup-$Version.exe"; DefaultArch = "x64";       DefaultOS = "Windows 10 64-bit" }
    macos   = @{ Extension = ".dmg";      Filename = "NexCoder-$Version.dmg";        DefaultArch = "universal"; DefaultOS = "macOS 12 Monterey" }
    linux   = @{ Extension = ".appimage"; Filename = "NexCoder-$Version.AppImage";   DefaultArch = "x64";       DefaultOS = "Ubuntu 20.04+" }
}
$cfg = $platformConfig[$Platform]
if (-not $Architecture) { $Architecture = $cfg.DefaultArch }
if (-not $MinimumOperatingSystem) { $MinimumOperatingSystem = $cfg.DefaultOS }

# 1-4. Validate inputs -------------------------------------------------------
Step "Validating inputs (platform: $Platform)"
if (-not (Test-Path -LiteralPath $InstallerPath -PathType Leaf)) { Fail "Installer not found: $InstallerPath" }
if ([System.IO.Path]::GetExtension($InstallerPath).ToLower() -ne $cfg.Extension) { Fail "Installer for $Platform must have a '$($cfg.Extension)' extension." }

$semver = '^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z\-.]+)?$'
if ($Version -notmatch $semver) { Fail "Version '$Version' is not a valid semantic version." }

$expectedName = $cfg.Filename
$actualName = [System.IO.Path]::GetFileName($InstallerPath)
if ($actualName -ne $expectedName) { Fail "Installer filename must be '$expectedName' (got '$actualName')." }
Ok "Filename and version validated."

# 5-6. Size + checksum (checksum must be computed AFTER signing) --------------
Step "Calculating size and SHA-256"
$fileInfo = Get-Item -LiteralPath $InstallerPath
$sizeBytes = [int64]$fileInfo.Length
$sha256 = (Get-FileHash -LiteralPath $InstallerPath -Algorithm SHA256).Hash.ToLower()
if ($sha256 -notmatch '^[a-f0-9]{64}$') { Fail "Computed SHA-256 is not 64 hex chars." }
Ok "Size: $sizeBytes bytes"
Ok "SHA-256: $sha256"

# 7. Object keys -------------------------------------------------------------
$prefix       = "releases/$Platform/$Channel/$Version"
$installerKey = "$prefix/$expectedName"
$checksumKey  = "$prefix/SHA256SUMS.txt"
$notesKey     = "$prefix/release-notes.md"
$manifestKey  = "manifests/$Platform-$Channel.json"

# 8. Manifest ----------------------------------------------------------------
Step "Generating manifest"
$manifest = [ordered]@{
    schemaVersion          = 1
    product                = "NexCoder"
    channel                = $Channel
    version                = $Version
    releaseDate            = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    platform               = $Platform
    architecture           = $Architecture
    minimumOperatingSystem = $MinimumOperatingSystem
    filename               = $expectedName
    objectKey              = $installerKey
    contentType            = "application/octet-stream"
    sizeBytes              = $sizeBytes
    sha256                 = $sha256
    releaseNotesUrl        = "$SiteBaseUrl/releases/$Version"
    published              = $true
}
$manifestJson = ($manifest | ConvertTo-Json -Depth 5)

$tempDir = Join-Path ([System.IO.Path]::GetTempPath()) ("nexcoder-release-" + [Guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
$manifestFile = Join-Path $tempDir "$Platform-$Channel.json"
$checksumFile = Join-Path $tempDir "SHA256SUMS.txt"
Set-Content -Path $manifestFile -Value $manifestJson -Encoding utf8
Set-Content -Path $checksumFile -Value "$sha256  $expectedName" -Encoding utf8

# 9. Summary + confirm -------------------------------------------------------
Write-Host ""
Write-Host "------------------------ RELEASE SUMMARY ------------------------" -ForegroundColor Yellow
Write-Host "Product          : NexCoder"
Write-Host "Platform         : $Platform ($Architecture)"
Write-Host "Channel          : $Channel"
Write-Host "Version          : $Version"
Write-Host "Installer        : $InstallerPath ($sizeBytes bytes)"
Write-Host "SHA-256          : $sha256"
Write-Host "Bucket           : $BucketName"
Write-Host "Installer key    : $installerKey"
Write-Host "Manifest key     : $manifestKey (uploaded LAST)"
Write-Host "Download URL     : $SiteBaseUrl/api/download/$Platform"
Write-Host "-----------------------------------------------------------------" -ForegroundColor Yellow
Write-Host ""

if ($DryRun) { Ok "Dry run - no upload performed. Manifest written to $manifestFile"; exit 0 }
if (-not $Force) {
    $answer = Read-Host "Publish this release? Type 'yes' to continue"
    if ($answer -ne "yes") { Fail "Aborted by user." }
}

# Upload helpers -------------------------------------------------------------
function Invoke-Wrangler([string[]]$WranglerArgs) {
    & wrangler @WranglerArgs
    if ($LASTEXITCODE -ne 0) { Fail "wrangler $($WranglerArgs -join ' ') failed (exit $LASTEXITCODE)." }
}
function Put-Object([string]$Key, [string]$File, [string]$ContentType) {
    Invoke-Wrangler @("r2", "object", "put", "$BucketName/$Key", "--file", $File, "--content-type", $ContentType, "--remote")
    Ok "Uploaded $Key"
}

if (-not (Get-Command wrangler -ErrorAction SilentlyContinue)) {
    Fail "wrangler CLI not found. Install with: npm i -g wrangler  (and run: wrangler login)"
}

# 10. Upload installer -------------------------------------------------------
Step "Uploading installer"
$wranglerPutLimitBytes = 300MB
if ($sizeBytes -gt $wranglerPutLimitBytes -and -not $UseS3Multipart) {
    Fail "Installer exceeds the wrangler single-part limit (~300 MB). Re-run with -UseS3Multipart and set R2_ACCOUNT_ID/R2_ACCESS_KEY_ID/R2_SECRET_ACCESS_KEY (see docs)."
}
if ($UseS3Multipart) {
    foreach ($v in "R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY") {
        if (-not (Test-Path "env:$v")) { Fail "Env var $v is required for -UseS3Multipart." }
    }
    if (-not (Get-Command aws -ErrorAction SilentlyContinue)) { Fail "aws CLI not found (required for multipart upload)." }
    $endpoint = "https://$($env:R2_ACCOUNT_ID).r2.cloudflarestorage.com"
    $env:AWS_ACCESS_KEY_ID = $env:R2_ACCESS_KEY_ID
    $env:AWS_SECRET_ACCESS_KEY = $env:R2_SECRET_ACCESS_KEY
    & aws s3 cp $InstallerPath "s3://$BucketName/$installerKey" --endpoint-url $endpoint --content-type "application/octet-stream"
    if ($LASTEXITCODE -ne 0) { Fail "aws s3 multipart upload failed." }
    Ok "Uploaded $installerKey (multipart)"
} else {
    Put-Object $installerKey $InstallerPath "application/octet-stream"
}

# 11. Verify installer object exists ----------------------------------------
Step "Verifying uploaded installer object"
& wrangler r2 object get "$BucketName/$installerKey" --remote --file (Join-Path $tempDir "verify.bin") 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) { Fail "Uploaded installer object could not be read back." }
Ok "Installer object present."

# 12-13. Upload checksum + notes --------------------------------------------
Step "Uploading checksum" ; Put-Object $checksumKey $checksumFile "text/plain"
if ($ReleaseNotesPath) {
    if (-not (Test-Path -LiteralPath $ReleaseNotesPath)) { Fail "Release notes not found: $ReleaseNotesPath" }
    Step "Uploading release notes" ; Put-Object $notesKey $ReleaseNotesPath "text/markdown"
}

# 14. Upload manifest LAST ---------------------------------------------------
Step "Uploading manifest (last)"
Put-Object $manifestKey $manifestFile "application/json"

# 15-16. Verify public endpoints --------------------------------------------
Step "Verifying public endpoints"
try {
    $meta = Invoke-RestMethod -Uri "$SiteBaseUrl/api/releases/$Platform" -Method Get -Headers @{ Accept = "application/json" }
    if ($meta.version -ne $Version) { Fail "Metadata version mismatch: expected $Version, got $($meta.version)." }
    if ($meta.PSObject.Properties.Name -contains "objectKey") { Fail "SECURITY: objectKey exposed in public metadata!" }
    Ok "Metadata endpoint reports version $($meta.version)."

    $head = Invoke-WebRequest -Uri "$SiteBaseUrl/api/download/$Platform" -Method Head
    if ($head.StatusCode -ne 200) { Fail "HEAD download endpoint returned $($head.StatusCode)." }
    if ($head.Headers["Location"]) { Fail "SECURITY: download endpoint returned a redirect Location." }
    Ok "HEAD download endpoint returned 200 with no redirect."
} catch {
    Fail "Public endpoint verification failed: $($_.Exception.Message)"
}

Remove-Item -Recurse -Force $tempDir -ErrorAction SilentlyContinue

# 17. Done -------------------------------------------------------------------
Write-Host ""
Ok "Release $Version published to the $Platform $Channel channel."
Write-Host "Public download URL: $SiteBaseUrl/api/download/$Platform" -ForegroundColor Green
exit 0
