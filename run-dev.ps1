[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $projectRoot "backend"
$frontendPath = Join-Path $projectRoot "frontend"
$logPath = Join-Path $projectRoot ".dev-logs"
$databaseConfigPath = Join-Path $backendPath "config\config.json"

function Write-Step {
    param([string]$Message)
    Write-Host "[LnPulse] $Message" -ForegroundColor Cyan
}

function Test-TcpPort {
    param(
        [string]$ComputerName = "127.0.0.1",
        [Parameter(Mandatory = $true)]
        [int]$Port
    )

    $client = [System.Net.Sockets.TcpClient]::new()
    try {
        $connection = $client.BeginConnect($ComputerName, $Port, $null, $null)
        if (-not $connection.AsyncWaitHandle.WaitOne(600)) {
            return $false
        }
        $client.EndConnect($connection)
        return $true
    }
    catch {
        return $false
    }
    finally {
        $client.Dispose()
    }
}

function Wait-ForPort {
    param(
        [Parameter(Mandatory = $true)]
        [int]$Port,
        [Parameter(Mandatory = $true)]
        [string]$ServiceName,
        [int]$TimeoutSeconds = 60
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        if (Test-TcpPort -Port $Port) {
            Write-Host "  Ready: $ServiceName on port $Port" -ForegroundColor Green
            return
        }
        Start-Sleep -Milliseconds 500
    }

    throw "$ServiceName did not become ready on port $Port within $TimeoutSeconds seconds."
}

function Show-ErrorLog {
    param([string]$Path)

    if (Test-Path -LiteralPath $Path) {
        Write-Host "`nLast error output from $Path" -ForegroundColor Yellow
        Get-Content -LiteralPath $Path -Tail 30
    }
}

foreach ($requiredPath in @($backendPath, $frontendPath, $databaseConfigPath)) {
    if (-not (Test-Path -LiteralPath $requiredPath)) {
        throw "Required project path was not found: $requiredPath"
    }
}

if (-not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) {
    throw "npm.cmd was not found. Install Node.js 20.19.0 and ensure npm is in PATH."
}

New-Item -ItemType Directory -Path $logPath -Force | Out-Null

$databaseConfig = Get-Content -LiteralPath $databaseConfigPath -Raw | ConvertFrom-Json
$databasePort = [int]$databaseConfig.development.port
$backendPort = 3001
$frontendPort = 3000

# The repository uses XAMPP/MariaDB locally. Start it only when the configured
# database port is not already being served.
if (-not (Test-TcpPort -Port $databasePort)) {
    $xamppRoot = if ($env:LNPULSE_XAMPP_PATH) { $env:LNPULSE_XAMPP_PATH } else { "C:\xampp" }
    $databaseExecutable = Join-Path $xamppRoot "mysql\bin\mysqld.exe"
    $databaseIni = Join-Path $xamppRoot "mysql\bin\my.ini"

    if (-not (Test-Path -LiteralPath $databaseExecutable) -or -not (Test-Path -LiteralPath $databaseIni)) {
        throw "MariaDB is not running on port $databasePort and XAMPP was not found at $xamppRoot. Start the database manually or set LNPULSE_XAMPP_PATH."
    }

    Write-Step "Starting MariaDB on port $databasePort..."
    $databaseProcessOptions = @{
        FilePath = $databaseExecutable
        ArgumentList = @("--defaults-file=$databaseIni", "--port=$databasePort", "--standalone", "--console")
        WorkingDirectory = (Join-Path $xamppRoot "mysql")
        RedirectStandardOutput = (Join-Path $logPath "database.out.log")
        RedirectStandardError = (Join-Path $logPath "database.err.log")
        WindowStyle = "Hidden"
    }
    Start-Process @databaseProcessOptions | Out-Null

    try {
        Wait-ForPort -Port $databasePort -ServiceName "MariaDB" -TimeoutSeconds 30
    }
    catch {
        Show-ErrorLog -Path (Join-Path $logPath "database.err.log")
        throw
    }
}
else {
    Write-Host "  Already running: MariaDB on port $databasePort" -ForegroundColor DarkGreen
}

if (-not (Test-TcpPort -Port $backendPort)) {
    Write-Step "Starting backend development server..."
    $backendProcessOptions = @{
        FilePath = "npm.cmd"
        ArgumentList = @("run", "dev")
        WorkingDirectory = $backendPath
        RedirectStandardOutput = (Join-Path $logPath "backend.out.log")
        RedirectStandardError = (Join-Path $logPath "backend.err.log")
        WindowStyle = "Hidden"
    }
    Start-Process @backendProcessOptions | Out-Null
}
else {
    Write-Host "  Already running: backend on port $backendPort" -ForegroundColor DarkGreen
}

if (-not (Test-TcpPort -Port $frontendPort)) {
    Write-Step "Starting frontend development server..."
    $previousBrowserSetting = $env:BROWSER
    $env:BROWSER = "none"
    try {
        $frontendProcessOptions = @{
            FilePath = "npm.cmd"
            ArgumentList = @("start")
            WorkingDirectory = $frontendPath
            RedirectStandardOutput = (Join-Path $logPath "frontend.out.log")
            RedirectStandardError = (Join-Path $logPath "frontend.err.log")
            WindowStyle = "Hidden"
        }
        Start-Process @frontendProcessOptions | Out-Null
    }
    finally {
        $env:BROWSER = $previousBrowserSetting
    }
}
else {
    Write-Host "  Already running: frontend on port $frontendPort" -ForegroundColor DarkGreen
}

try {
    Wait-ForPort -Port $backendPort -ServiceName "Backend API" -TimeoutSeconds 60
    Wait-ForPort -Port $frontendPort -ServiceName "React frontend" -TimeoutSeconds 120
}
catch {
    Show-ErrorLog -Path (Join-Path $logPath "backend.err.log")
    Show-ErrorLog -Path (Join-Path $logPath "frontend.err.log")
    throw
}

Write-Host ""
Write-Host "LnPulse is running." -ForegroundColor Green
Write-Host "  App:  http://localhost:$frontendPort" -ForegroundColor White
Write-Host "  API:  http://localhost:$backendPort" -ForegroundColor White
Write-Host "  Logs: $logPath" -ForegroundColor DarkGray
