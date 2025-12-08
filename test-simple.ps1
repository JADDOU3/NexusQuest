# Simple Test Script for Library Installation Feature
# Run: ./test-simple.ps1 -Token "YOUR_JWT_TOKEN"

param(
    [string]$Token = ""
)

if (-not $Token) {
    Write-Host "Usage: ./test-simple.ps1 -Token 'YOUR_JWT_TOKEN'" -ForegroundColor Red
    exit 1
}

$API = "http://localhost:3000/api"

Write-Host "`n╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Testing JavaScript with Dependencies                    ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Test 1: JavaScript with dependencies
Write-Host "1️⃣  Executing JavaScript with axios and lodash..." -ForegroundColor Yellow

$jsPayload = @{
    files = @(
        @{
            name = "main.js"
            content = @"
const axios = require('axios');
const _ = require('lodash');

console.log('Testing dependencies:');
console.log('✓ axios loaded');
console.log('✓ lodash loaded');

// Test lodash
const sum = _.sum([1, 2, 3, 4, 5]);
console.log('Sum of [1,2,3,4,5]:', sum);

console.log('\n✓ All dependencies working!');
"@
            language = "javascript"
        }
    )
    mainFile = "main.js"
    language = "javascript"
    dependencies = @{
        "axios" = "1.6.0"
        "lodash" = "4.17.21"
    }
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-WebRequest -Uri "$API/execution/run-project" `
        -Method POST `
        -Headers @{
            "Authorization" = "Bearer $Token"
            "Content-Type" = "application/json"
        } `
        -Body $jsPayload

    $result = $response.Content | ConvertFrom-Json
    
    if ($result.success) {
        Write-Host "✅ SUCCESS!`n" -ForegroundColor Green
        Write-Host "Output:" -ForegroundColor Green
        Write-Host $result.output -ForegroundColor Gray
        Write-Host "Execution time: $($result.executionTime)ms`n" -ForegroundColor Cyan
    } else {
        Write-Host "❌ FAILED`n" -ForegroundColor Red
        Write-Host "Error: $($result.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Python with dependencies
Write-Host "2️⃣  Executing Python with requests..." -ForegroundColor Yellow

$pyPayload = @{
    files = @(
        @{
            name = "main.py"
            content = @"
import requests

print('Testing Python dependencies:')
print('✓ requests loaded')
print('Requests version:', requests.__version__)
print('\n✓ All dependencies working!')
"@
            language = "python"
        }
    )
    mainFile = "main.py"
    language = "python"
    dependencies = @{
        "requests" = "2.31.0"
    }
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-WebRequest -Uri "$API/execution/run-project" `
        -Method POST `
        -Headers @{
            "Authorization" = "Bearer $Token"
            "Content-Type" = "application/json"
        } `
        -Body $pyPayload

    $result = $response.Content | ConvertFrom-Json
    
    if ($result.success) {
        Write-Host "✅ SUCCESS!`n" -ForegroundColor Green
        Write-Host "Output:" -ForegroundColor Green
        Write-Host $result.output -ForegroundColor Gray
        Write-Host "Execution time: $($result.executionTime)ms`n" -ForegroundColor Cyan
    } else {
        Write-Host "❌ FAILED`n" -ForegroundColor Red
        Write-Host "Error: $($result.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Tests completed!                                         ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan
