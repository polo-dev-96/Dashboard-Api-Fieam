# Script para configurar o Ngrok
# Requer authtoken gratuito de https://dashboard.ngrok.com/get-started/your-authtoken

$NgrokPath = "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\Ngrok.Ngrok_Microsoft.Winget.Source_8wekyb3d8bbwe\ngrok.exe"

if (-not (Test-Path $NgrokPath)) {
    Write-Host "Ngrok nao encontrado. Instalando via winget..."
    winget install --id Ngrok.Ngrok --source winget --silent --accept-package-agreements --accept-source-agreements
    $NgrokPath = "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\Ngrok.Ngrok_Microsoft.Winget.Source_8wekyb3d8bbwe\ngrok.exe"
}

$Token = Read-Host -Prompt "Digite seu Ngrok Authtoken (obtenha em https://dashboard.ngrok.com/get-started/your-authtoken)"

if ([string]::IsNullOrWhiteSpace($Token)) {
    Write-Error "Token nao pode ser vazio."
    exit 1
}

& $NgrokPath config add-authtoken $Token

Write-Host "Authtoken configurado com sucesso!"
Write-Host "Agora voce pode executar: .\scripts\start-ngrok.ps1"
