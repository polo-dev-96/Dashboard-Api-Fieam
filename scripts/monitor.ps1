# Script para monitorar logs da API e do Ngrok em tempo real
# Uso: .\scripts\monitor.ps1

function Get-LatestNgrokRequests {
    try {
        $resp = Invoke-RestMethod -Uri "http://localhost:4040/api/requests/http" -ErrorAction Stop
        $reqs = $resp.requests
        if ($reqs.Count -eq 0) { return @() }
        return $reqs | Select-Object -Last 10
    } catch {
        return @()
    }
}

function Format-Request($req) {
    $ts = $req.start
    $uri = ""
    if ($req.req.uri) {
        $parts = $req.req.uri -split " "
        $uri = "$($parts[0]) $($parts[1])"
    }
    $status = $req.resp.status_code
    $color = if ($status -ge 400) { "Red" } elseif ($status -ge 300) { "Yellow" } else { "Green" }
    return @{ Time = $ts; Uri = $uri; Status = $status; Color = $color }
}

Clear-Host
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   MONITOR DE LOGS - Auditoria API" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "API:    http://localhost:3000" -ForegroundColor Gray
Write-Host "Ngrok:  http://localhost:4040 (dashboard)" -ForegroundColor Gray
Write-Host ""
Write-Host "Pressione CTRL+C para sair." -ForegroundColor DarkGray
Write-Host ""

$lastCount = 0

while ($true) {
    $reqs = Get-LatestNgrokRequests

    if ($reqs.Count -gt $lastCount) {
        $newReqs = $reqs | Select-Object -Last ($reqs.Count - $lastCount)
        foreach ($r in $newReqs) {
            $fmt = Format-Request $r
            Write-Host "[$($fmt.Time)] $($fmt.Uri) -> Status: $($fmt.Status)" -ForegroundColor $fmt.Color
        }
        $lastCount = $reqs.Count
    }

    Start-Sleep -Seconds 3
}
