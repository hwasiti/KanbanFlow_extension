param(
  [switch]$SkipPackages
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.IO.Compression

$repoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$distRoot = Join-Path $repoRoot "dist"
$releaseRoot = Join-Path $repoRoot "releases"
$chromeManifest = Get-Content -Raw (Join-Path $repoRoot "manifest.json") | ConvertFrom-Json
$firefoxManifest = Get-Content -Raw (Join-Path $repoRoot "firefox\manifest.json") | ConvertFrom-Json
if ($chromeManifest.version -ne $firefoxManifest.version) {
  throw "Chrome and Firefox manifest versions must match."
}
$version = $chromeManifest.version

function Reset-BuildDirectory {
  param([Parameter(Mandatory)][string]$Path)

  $fullPath = [System.IO.Path]::GetFullPath($Path)
  $allowedRoot = $repoRoot.TrimEnd("\") + "\"
  if (-not $fullPath.StartsWith($allowedRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to reset a directory outside the repository: $fullPath"
  }

  if (Test-Path -LiteralPath $fullPath) {
    Remove-Item -LiteralPath $fullPath -Recurse -Force
  }
  New-Item -ItemType Directory -Path $fullPath | Out-Null
}

function Copy-ExtensionFiles {
  param(
    [Parameter(Mandatory)][string]$Destination,
    [Parameter(Mandatory)][string]$ManifestPath
  )

  Copy-Item -LiteralPath (Join-Path $repoRoot "content.js") -Destination $Destination
  Copy-Item -LiteralPath (Join-Path $repoRoot "styles.css") -Destination $Destination
  Copy-Item -LiteralPath (Join-Path $repoRoot "icons") -Destination $Destination -Recurse
  Copy-Item -LiteralPath $ManifestPath -Destination (Join-Path $Destination "manifest.json")
}

function New-ExtensionArchive {
  param(
    [Parameter(Mandatory)][string]$SourceDirectory,
    [Parameter(Mandatory)][string]$DestinationPath
  )

  $sourceRoot =
    [System.IO.Path]::GetFullPath($SourceDirectory).TrimEnd([char[]]"\/") +
    [System.IO.Path]::DirectorySeparatorChar
  $archiveStream = [System.IO.File]::Open(
    $DestinationPath,
    [System.IO.FileMode]::CreateNew,
    [System.IO.FileAccess]::Write,
    [System.IO.FileShare]::None
  )

  try {
    $archive = [System.IO.Compression.ZipArchive]::new(
      $archiveStream,
      [System.IO.Compression.ZipArchiveMode]::Create,
      $false
    )

    try {
      Get-ChildItem -LiteralPath $SourceDirectory -File -Recurse | ForEach-Object {
        $entryName = $_.FullName.Substring($sourceRoot.Length).Replace("\", "/")
        $entry = $archive.CreateEntry(
          $entryName,
          [System.IO.Compression.CompressionLevel]::Optimal
        )
        $entryStream = $entry.Open()
        $fileStream = [System.IO.File]::OpenRead($_.FullName)

        try {
          $fileStream.CopyTo($entryStream)
        }
        finally {
          $fileStream.Dispose()
          $entryStream.Dispose()
        }
      }
    }
    finally {
      $archive.Dispose()
    }
  }
  finally {
    $archiveStream.Dispose()
  }
}

$chromeDir = Join-Path $distRoot "chrome"
$firefoxDir = Join-Path $distRoot "firefox"
Reset-BuildDirectory -Path $chromeDir
Reset-BuildDirectory -Path $firefoxDir

Copy-ExtensionFiles -Destination $chromeDir -ManifestPath (Join-Path $repoRoot "manifest.json")
Copy-ExtensionFiles -Destination $firefoxDir -ManifestPath (Join-Path $repoRoot "firefox\manifest.json")

if (-not $SkipPackages) {
  Reset-BuildDirectory -Path $releaseRoot

  $chromeZip = Join-Path $releaseRoot "kanbanflow-insert-above-chrome-$version.zip"
  $firefoxZip = Join-Path $releaseRoot "kanbanflow-insert-above-firefox-$version.zip"
  New-ExtensionArchive -SourceDirectory $chromeDir -DestinationPath $chromeZip
  New-ExtensionArchive -SourceDirectory $firefoxDir -DestinationPath $firefoxZip
}

Write-Host "Built Chrome extension: $chromeDir"
Write-Host "Built Firefox extension: $firefoxDir"
if (-not $SkipPackages) {
  Write-Host "Release packages: $releaseRoot"
}
