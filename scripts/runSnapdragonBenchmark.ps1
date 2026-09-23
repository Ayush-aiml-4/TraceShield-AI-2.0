<#
.SYNOPSIS
    TraceShield AI 2.0 - Physical Snapdragon Benchmark Runner.
.DESCRIPTION
    Executes the TraceShield benchmark harness only after performing hardware validation.
    Runs 20 iterations across Clean Input, Deterministic Detection, Sanitization,
    Independent Verification, Full Pipeline, and AI Context Inference.
    Calculates Average, Minimum, Maximum, and P95 with high-resolution timers.
.NOTES
    THIS SCRIPT MUST BE RUN DIRECTLY ON PHYSICAL WINDOWS 11 HARDWARE.
    NEVER MIX LINUX CONTAINER BENCHMARK RESULTS WITH SNAPDRAGON RESULTS.
#>

[CmdletBinding()]
param(
    [int]$Iterations = 20
)

$ErrorActionPreference = "SilentlyContinue"

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "TRACE SHIELD AI 2.0" -ForegroundColor Cyan
Write-Host "SNAPDRAGON BENCHMARK RUNNER" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "THIS BENCHMARK IS VALID ONLY FOR THE MACHINE ON WHICH IT WAS EXECUTED.`n" -ForegroundColor Yellow

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir

# ----------------------------------------------------------------------
# 1. HARDWARE VALIDATION STEP BEFORE BENCHMARK
# ----------------------------------------------------------------------
Write-Host "Validating physical execution environment before benchmark..." -ForegroundColor White

$isWindows = ($PSVersionTable.PSEdition -ne $null -and $env:OS -like "*Windows*") -or ($PSVersionTable.Platform -eq $null) -or ($PSVersionTable.Platform -eq "Win32NT")
$procArch = if ($env:PROCESSOR_ARCHITECTURE) { $env:PROCESSOR_ARCHITECTURE } else { [System.Runtime.InteropServices.RuntimeInformation]::OSArchitecture.ToString() }
$procId = if ($env:PROCESSOR_IDENTIFIER) { $env:PROCESSOR_IDENTIFIER } else { "Unknown" }

$cpuInfo = Get-CimInstance Win32_Processor -ErrorAction SilentlyContinue | Select-Object -First 1
$cpuName = if ($cpuInfo -and $cpuInfo.Name) { $cpuInfo.Name.Trim() } else { $procId }

$osCim = Get-CimInstance Win32_OperatingSystem -ErrorAction SilentlyContinue
$osVersion = if ($osCim) { $osCim.Caption } else { [System.Environment]::OSVersion.VersionString }
$osArch = if ($osCim -and $osCim.OSArchitecture) { $osCim.OSArchitecture } else { $procArch }

$isArm64 = ($procArch -eq "ARM64") -or ($osArch -like "*ARM64*")
$isSnapdragon = ($cpuName + " " + $procId).ToLower() -match "snapdragon|x elite|x plus|x1e|x1p|oryon"

# Check QNN status from validation file if present
$validationJsonPath = Join-Path $projectRoot "validation\windows-snapdragon-validation.json"
$isQnnValidated = $false
if (Test-Path $validationJsonPath) {
    try {
        $vJson = Get-Content $validationJsonPath -Raw | ConvertFrom-Json
        if ($vJson.status.qnn -eq "VALIDATED") {
            $isQnnValidated = $true
        }
    } catch {}
}

$activeBackend = if ($isQnnValidated) { "QNN_NPU" } else { "CPU" }

Write-Host "Benchmark Hardware:    $cpuName"
Write-Host "Benchmark OS:          $osVersion ($procArch)"
Write-Host "Benchmark Backend:     $activeBackend"
Write-Host "Iterations:            $Iterations runs per stage"

if (-not $isArm64 -or -not $isSnapdragon) {
    Write-Host "`n[NOTICE] Non-Snapdragon host environment detected ($procArch)." -ForegroundColor Yellow
    Write-Host "Physical Snapdragon validation has NOT run on target ARM64 hardware." -ForegroundColor Yellow
    Write-Host "The following measurements reflect host CPU performance only." -ForegroundColor Yellow
    Write-Host "DO NOT present these numbers as Snapdragon performance.`n" -ForegroundColor Yellow
} else {
    Write-Host "`n[CONFIRMED] Running on target physical Snapdragon ARM64 hardware.`n" -ForegroundColor Green
}

# ----------------------------------------------------------------------
# 2. INVOKE BENCHMARK HARNESS
# ----------------------------------------------------------------------
Write-Host "Executing benchmark harness ($Iterations iterations per stage)...`n" -ForegroundColor White

$cliScript = Join-Path $scriptDir "runBenchmarkCli.ts"

if (Get-Command npx -ErrorAction SilentlyContinue) {
    & npx tsx $cliScript $Iterations
} elseif (Get-Command node -ErrorAction SilentlyContinue) {
    & node -r tsx/register $cliScript $Iterations
} else {
    Write-Host "Error: Node.js and npx are required to execute the TypeScript benchmark harness." -ForegroundColor Red
    Write-Host "Please ensure Node.js is installed in the Windows environment." -ForegroundColor Red
}

Write-Host "`nBenchmark execution completed." -ForegroundColor Cyan
