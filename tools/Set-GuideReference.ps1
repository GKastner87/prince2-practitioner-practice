[CmdletBinding(SupportsShouldProcess)]
param(
    [Parameter(Mandatory)]
    [ValidateNotNullOrEmpty()]
    [string]$GuideUrl,

    [Parameter()]
    [ValidateNotNullOrEmpty()]
    [string]$GuideTitle = 'Managing Successful Projects with PRINCE2® 7th Edition',

    [Parameter()]
    [int]$PageOffset = 0,

    [Parameter()]
    [string]$Status = 'Guide links are configured. Confirm that the hosted file is an authorised copy before publishing.',

    [Parameter()]
    [string]$RepositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path,

    [Parameter()]
    [switch]$Disable
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function ConvertTo-JavaScriptString {
    param([Parameter(Mandatory)][AllowEmptyString()][string]$Value)

    return $Value.Replace('\', '\\').Replace("'", "\'").Replace("`r", '').Replace("`n", '\n')
}

$configDirectory = Join-Path $RepositoryRoot 'config'
$configPath = Join-Path $configDirectory 'reference-config.js'

if (-not (Test-Path -LiteralPath $configDirectory)) {
    New-Item -ItemType Directory -Path $configDirectory -Force | Out-Null
}

$enabled = -not $Disable.IsPresent
$updatedUtc = [DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ssZ')

$content = @"
window.PRINCE2_REFERENCE_CONFIG = Object.freeze({
  enabled: $($enabled.ToString().ToLowerInvariant()),
  guideTitle: '$(ConvertTo-JavaScriptString -Value $GuideTitle)',
  guideUrl: '$(ConvertTo-JavaScriptString -Value $GuideUrl)',
  pageOffset: $PageOffset,
  status: '$(ConvertTo-JavaScriptString -Value $Status)',
  updatedUtc: '$updatedUtc'
});
"@

if ($PSCmdlet.ShouldProcess($configPath, 'Update PRINCE2 guide reference configuration')) {
    Set-Content -LiteralPath $configPath -Value $content -Encoding utf8NoBOM
}

Write-Host "Updated: $configPath" -ForegroundColor Green
Write-Host "Enabled: $enabled"
Write-Host "Guide URL: $GuideUrl"
Write-Host "Page offset: $PageOffset"
Write-Host ''
Write-Host 'Review the change, then commit and push:' -ForegroundColor Cyan
Write-Host '  git diff -- config/reference-config.js'
Write-Host '  git add config/reference-config.js'
Write-Host '  git commit -m "Update official guide reference"'
Write-Host '  git push'
