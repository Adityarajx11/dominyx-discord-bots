# Deploys the dashboard and prints the health response.
#
# The project's production domain is aurex-control.vercel.app. Vercel moves it
# to the new deployment automatically, so there is no alias to repoint by hand.
param(
  [string]$Project = 'aurex-control',
  [string]$Alias = 'aurex-control.vercel.app'
)

$ErrorActionPreference = 'Stop'
$vercel = "$env:APPDATA\npm\vercel.cmd"
$root = Split-Path -Parent $PSScriptRoot

Set-Location $root

$output = & $vercel deploy --prod --yes 2>&1 | Out-String
if ($output -notmatch '"status":\s*"ok"') {
  Write-Host 'DEPLOY FAILED'
  Write-Host $output
  exit 1
}

$url = [regex]::Match($output, 'Production URL:\s*(https://[^\s"]+)').Groups[1].Value
Write-Host "Deployed: $url"

Start-Sleep -Seconds 5

Write-Host ''
Write-Host "Health at https://$Alias :"
try {
  $response = Invoke-WebRequest -Uri "https://$Alias/api/health" -UseBasicParsing -TimeoutSec 30
  Write-Host ('  ' + $response.Content)
} catch {
  Write-Host "  FAILED: $($_.Exception.Message)"
}
