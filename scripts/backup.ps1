param(
  [string]$BackupDir = ".\backups",
  [string]$DbHost = "localhost",
  [string]$DbPort = "5432",
  [string]$DbName = "ssssy_website",
  [string]$DbUser = "ssssy",
  [string]$DbPassword = "",
  [int]$RetentionDays = 30
)

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupPath = Join-Path $BackupDir $timestamp

if (-not (Test-Path $backupPath)) {
  New-Item -ItemType Directory -Path $backupPath -Force | Out-Null
}

$env:PGPASSWORD = $DbPassword

$dumpFile = Join-Path $backupPath "${DbName}_${timestamp}.sql"
Write-Host "Backing up database to: $dumpFile"
pg_dump -h $DbHost -p $DbPort -U $DbUser -d $DbName -F c -f $dumpFile

if ($LASTEXITCODE -eq 0) {
  Write-Host "Database backup completed successfully"
} else {
  Write-Host "Database backup FAILED" -ForegroundColor Red
  exit 1
}

$uploadsBackup = Join-Path $backupPath "uploads"
Write-Host "Backing up uploads to: $uploadsBackup"
if (Test-Path ".\uploads") {
  Copy-Item -Path ".\uploads" -Destination $uploadsBackup -Recurse -Force
  Write-Host "Uploads backup completed"
}

Compress-Archive -Path $backupPath -DestinationPath "${backupPath}.zip" -Force
Remove-Item -Path $backupPath -Recurse -Force

Write-Host "Backup archive created: ${backupPath}.zip"

$cutoff = (Get-Date).AddDays(-$RetentionDays)
Get-ChildItem -Path $BackupDir -Filter "*.zip" | Where-Object {
  $_.CreationTime -lt $cutoff
} | Remove-Item -Force

Write-Host "Old backups cleaned up (retention: $RetentionDays days)"
Write-Host "Backup completed successfully"
