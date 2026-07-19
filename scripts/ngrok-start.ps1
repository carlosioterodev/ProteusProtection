$ErrorActionPreference = "Stop"

Write-Host "=== Proteus Protection - NGROK Tunnel ===" -ForegroundColor Cyan
Write-Host ""

# Check if ngrok is in the project root
$ngrokPath = Join-Path $PSScriptRoot "..\ngrok.exe"
if (Test-Path $ngrokPath) {
    $ngrok = $ngrokPath
} else {
    $ngrok = Get-Command ngrok -ErrorAction SilentlyContinue
    if ($ngrok) {
        $ngrok = $ngrok.Source
    } else {
        Write-Host "ERROR: ngrok not found. Place ngrok.exe in the project root or install it globally." -ForegroundColor Red
        exit 1
    }
}

# Check if Docker is running
$docker = Get-Command docker -ErrorAction SilentlyContinue
if ($docker) {
    $running = docker ps 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[1/3] Starting PostgreSQL via Docker..." -ForegroundColor Yellow
        docker compose up -d postgres
        Start-Sleep -Seconds 5
    } else {
        Write-Host "WARNING: Docker not running. Make sure PostgreSQL is available on localhost:5432" -ForegroundColor Yellow
    }
} else {
    Write-Host "WARNING: Docker not found. Make sure PostgreSQL is available on localhost:5432" -ForegroundColor Yellow
}

Write-Host "[2/3] Starting Next.js dev server..." -ForegroundColor Yellow
$env:HOSTNAME = "0.0.0.0"
$env:PORT = "3000"
Start-Process -NoNewWindow -FilePath "pnpm" -ArgumentList "dev" -WorkingDirectory (Join-Path $PSScriptRoot "..")

Start-Sleep -Seconds 5
Write-Host "[3/3] Starting NGROK tunnel on port 3000..." -ForegroundColor Yellow
& $ngrok http 3000

Write-Host ""
Write-Host "NGROK tunnel is running. Check http://localhost:4040 for the public URL." -ForegroundColor Green
