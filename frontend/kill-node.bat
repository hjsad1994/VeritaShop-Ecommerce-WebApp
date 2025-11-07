@echo off
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo All Node processes stopped.
