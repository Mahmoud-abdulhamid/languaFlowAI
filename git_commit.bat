@echo off
setlocal EnableDelayedExpansion

echo ==============================
echo   Git Commit & Push Script
echo ==============================
echo.

set /p commit_msg=Enter commit message: 

if "%commit_msg%"=="" (
    echo ❌ Commit message cannot be empty.
    goto end
)

echo.
echo ▶ Running: git add .
git add .
echo.

echo ▶ Running: git commit
git commit -m "%commit_msg%"
if errorlevel 1 (
    echo.
    echo ❌ Commit failed.
    goto end
)

echo.
echo ▶ Running: git push origin main
git push origin main
if errorlevel 1 (
    echo.
    echo ❌ Push failed.
    goto end
)

echo.
echo ✅ All commands executed successfully.

:end
echo.
echo ==============================
echo Press any key to exit...
pause >nul
