$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot

function Invoke-Docker {
    & docker @args

    if ($LASTEXITCODE -ne 0) {
        throw "Docker command failed: $args"
    }
}

Write-Host "========================================" -ForegroundColor Green
Write-Host "       Starting PetCare System" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Invoke-Docker info --format '{{.ServerVersion}}'

$services = @(
    "user-service",
    "pet-service",
    "veterinarian-service",
    "appointment-service",
    "health-service",
    "frontend-api",
    "frontend"
)

Write-Host "`nChecking configuration..." -ForegroundColor Cyan

foreach ($service in $services) {
    $composePath = Join-Path $PSScriptRoot "$service/docker-compose.yml"

    if (-not (Test-Path $composePath)) {
        throw "Missing Docker Compose file: $composePath"
    }

    if ($service -notin @("frontend-api", "frontend")) {
        $envPath = Join-Path $PSScriptRoot "$service/.env"

        if (-not (Test-Path $envPath)) {
            throw "Missing .env file: $envPath"
        }
    }

    Push-Location (Join-Path $PSScriptRoot $service)

    try {
        Invoke-Docker compose config --quiet
    }
    finally {
        Pop-Location
    }
}

Write-Host "`nChecking Docker network..." -ForegroundColor Cyan

$networks = Invoke-Docker network ls --format '{{.Name}}'

if ($networks -notcontains "petcare-network") {
    Invoke-Docker network create petcare-network
}

Write-Host "`nChecking health database volume..." -ForegroundColor Cyan

$volumes = Invoke-Docker volume ls --format '{{.Name}}'

if ($volumes -notcontains "petcare-health-data") {
    Invoke-Docker volume create petcare-health-data
}

foreach ($service in $services) {
    Write-Host "`nStarting $service..." -ForegroundColor Cyan

    Push-Location (Join-Path $PSScriptRoot $service)

    try {
        Invoke-Docker compose up -d --build --wait --wait-timeout 180
    }
    finally {
        Pop-Location
    }
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "       PetCare System Started" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Invoke-Docker ps --filter "name=petcare-"

Write-Host "`nFrontend: http://localhost:5173" -ForegroundColor Green
Write-Host "Frontend API: http://localhost:8000" -ForegroundColor Green