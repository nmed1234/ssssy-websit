param(
  [Parameter(Mandatory = $true)]
  [string]$BackupFile,
  [string]$DbHost = "localhost",
  [string]$DbPort = "5432",
  [string]$DbName = "ssssy_website",
  [string]$DbUser = "ssssy",
  [string]$DbPassword = ""
)

if (-not (Test-Path $BackupFile)) {
  Write-Host "Error: Backup file not found: $BackupFile" -ForegroundColor Red
  exit 1
}

$extractDir = Join-Path $env:TEMP "restore_$(Get-Date -Format 'yyyyMMddHHmmss')"
New-Item -ItemType Directory -Path $extractDir -Force | Out-Null

try {
  Expand-Archive -Path $BackupFile -DestinationPath $extractDir -Force

  $dumpFiles = Get-ChildItem -Path $extractDir -Recurse -Filter "*.sql" -Depth 2
  if ($dumpFiles.Count -eq 0) {
    Write-Host "Error: No SQL dump found in backup archive" -ForegroundColor Red
    exit 1
  }

  $dumpFile = $dumpFiles[0].FullName
  Write-Host "Restoring from: $dumpFile"

  $env:PGPASSWORD = $DbPassword
  pg_restore -h $DbHost -p $DbPort -U $DbUser -d $DbName -c --if-exists -v $dumpFile

  if ($LASTEXITCODE -eq 0) {
    Write-Host "Database restore completed successfully"
  } else {
    Write-Host "Database restore FAILED" -ForegroundColor Red
    exit 1
  }

  $uploadsDir = Join-Path $extractDir "uploads"
  if (Test-Path $uploadsDir) {
    Write-Host "Restoring uploads..."
    Copy-Item -Path "$uploadsDir\*" -Destination ".\uploads" -Recurse -Force
    Write-Host "Uploads restored"
  }
} finally {
  Remove-Item -Path $extractDir -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "Restore completed successfully"
