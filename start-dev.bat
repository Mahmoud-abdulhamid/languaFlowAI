@echo off
echo Starting AI Translation System...

echo Starting Database (Docker)...
docker-compose up -d mongo

echo kill port...
start "" cmd /c "npx kill-port 4000"

echo Starting Backend...
start "Backend Server" cmd /k "cd backend && npm run dev"

echo Starting Frontend...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo Services started!
pause
