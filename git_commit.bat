@echo off
title Git Commit & Push
echo ==============================
echo   Git Commit & Push Script
echo ==============================
echo.

powershell -NoExit -Command ^
  "$msg = Read-Host 'Enter commit message';" ^
  "if ([string]::IsNullOrWhiteSpace($msg)) { Write-Host 'Commit message is empty'; exit };" ^
  "git add .;" ^
  "git commit -m \"$msg\";" ^
  "if ($LASTEXITCODE -ne 0) { Write-Host 'Commit failed'; exit };" ^
  "git push origin main;" ^
  "if ($LASTEXITCODE -ne 0) { Write-Host 'Push failed'; exit };" ^
  "Write-Host 'Done successfully.'"
