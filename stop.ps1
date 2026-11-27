$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot

$services = @(
    "frontend",
    "frontend-api",
    "health-service",
    "appointment-service",
    "veterinarian-service",
    "pet-service",
    "user-service"
)

$failedServices = @()

Write-Host "========================================" -ForegroundColor Yellow
Write-Host "       Stopping PetCare System" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

foreach ($service in $services) {
    Write-Host "`nStopping $service..." -ForegroundColor Cyan

    Push-Location (Join-Path $PSScriptRoot $service)

    try {
        docker compose stop

        if ($LASTEXITCODE -ne 0) {
            $failedServices += $service
        }
    }
    finally {
        Pop-Location
    }
}

if ($failedServices.Count -gt 0) {
    throw "Failed to stop: $($failedServices -join ', ')"
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "       PetCare System Stopped" -ForegroundColor Green
Write-Host "       Database data preserved" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green