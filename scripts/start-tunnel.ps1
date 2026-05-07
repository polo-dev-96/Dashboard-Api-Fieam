# Script para iniciar API + tunnel Ngrok e exibir a URL publica
# Uso: .\scripts\start-tunnel.ps1

$NgrokPath = "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\Ngrok.Ngrok_Microsoft.Winget.Source_8wekyb3d8bbwe\ngrok.exe"
$ApiPort = 3000
$ProjectDir = Split-Path $PSScriptRoot -Parent

function Get-PublicUrl {
    try {
        $tunnels = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -ErrorAction Stop
        if ($tunnels.tunnels.Count -gt 0) {
            return $tunnels.tunnels[0].public_url
        }
    } catch {}
    return $null
}

# 1. Verificar dependencias
if (-not (Test-Path $NgrokPath)) {
    Write-Error "Ngrok nao encontrado. Instale com: winget install Ngrok.Ngrok"
    exit 1
}

# 2. Iniciar API se nao estiver rodando
$ApiRunning = Get-NetTCPConnection -LocalPort $ApiPort -ErrorAction SilentlyContinue
if (-not $ApiRunning) {
    Write-Host "[1/3] Iniciando API na porta $ApiPort..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WorkingDirectory $ProjectDir | Out-Null
    Start-Sleep -Seconds 5
} else {
    Write-Host "[1/3] API ja esta rodando na porta $ApiPort." -ForegroundColor Green
}

# 3. Iniciar Ngrok em background
Write-Host "[2/3] Iniciando tunnel Ngrok..." -ForegroundColor Cyan
$NgrokProc = Start-Process -FilePath $NgrokPath -ArgumentList "http", $ApiPort -WindowStyle Hidden -PassThru
Start-Sleep -Seconds 4

# 4. Buscar URL publica
Write-Host "[3/3] Obtendo URL publica..." -ForegroundColor Cyan
$Url = $null
$Attempts = 0
while (-not $Url -and $Attempts -lt 10) {
    $Url = Get-PublicUrl
    if (-not $Url) {
        Start-Sleep -Seconds 2
        $Attempts++
    }
}

# 5. Exibir resultado
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  TUNNEL NGROK ATIVO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  URL Publica (webhook):" -ForegroundColor Yellow
Write-Host "  $Url/webhook/finalizado" -ForegroundColor White
Write-Host ""
Write-Host "  Dashboard Ngrok: http://localhost:4040" -ForegroundColor DarkGray
Write-Host "  API Local:       http://localhost:$ApiPort" -ForegroundColor DarkGray
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Pressione ENTER para encerrar o tunnel..."
Read-Host

# Encerrar
Stop-Process -Id $NgrokProc.Id -Force -ErrorAction SilentlyContinue
Write-Host "Tunnel encerrado."
