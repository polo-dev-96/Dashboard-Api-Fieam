# Script para iniciar o tunnel Ngrok para a API (porta 3000)
# A URL publica sera exibida no terminal

$NgrokPath = "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\Ngrok.Ngrok_Microsoft.Winget.Source_8wekyb3d8bbwe\ngrok.exe"
$ApiPort = 3000

if (-not (Test-Path $NgrokPath)) {
    Write-Error "Ngrok nao encontrado. Execute primeiro: winget install Ngrok.Ngrok"
    exit 1
}

# Verificar se a API ja esta rodando
$ApiRunning = Get-NetTCPConnection -LocalPort $ApiPort -ErrorAction SilentlyContinue
if (-not $ApiRunning) {
    Write-Host "API nao esta rodando. Iniciando em background..."
    $ApiProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WorkingDirectory "$PSScriptRoot\.." -PassThru
    Start-Sleep -Seconds 4
    Write-Host "API iniciada (PID: $($ApiProcess.Id))"
    Write-Host ""
} else {
    Write-Host "API ja esta rodando na porta $ApiPort."
    Write-Host ""
}

Write-Host "Iniciando tunnel Ngrok na porta $ApiPort..."
Write-Host "A URL publica aparecera abaixo. Use-a no PL Chat como webhook."
Write-Host ""

& $NgrokPath http $ApiPort
