# Deploys the dashboard and repoints the production alias at the new deployment.
#
# A Vercel alias created with `vercel alias set` does not follow later
# deployments on its own, so without this step the domain keeps serving an
# older build while the API answers from the newest one.
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

$match = [regex]::Match($output, 'https://[a-z0-9-]+-[a-z0-9]+-adityarajx11\.vercel\.app')
if (-not $match.Success) {
  Write-Host 'Could not find the new deployment URL in the output:'
  Write-Host $output
  exit 1
}

$deployment = $match.Value
Write-Host "Deployed: $deployment"

& $vercel alias set $deployment $Alias 2>&1 |
  Select-String -Pattern 'Success|Error' |
  ForEach-Object { Write-Host "  $_" }

Start-Sleep -Seconds 4

Write-Host ''
Write-Host "Health at https://$Alias :"
try {
  $response = Invoke-WebRequest -Uri "https://$Alias/api/health" -UseBasicParsing -TimeoutSec 30
  Write-Host ('  ' + $response.Content)
} catch {
  Write-Host "  FAILED: $($_.Exception.Message)"
}
