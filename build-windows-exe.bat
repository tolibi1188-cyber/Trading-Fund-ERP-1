@echo off
echo ========================================================
echo   Trading Fund ERP - Windows (.EXE) Build Script
echo ========================================================
echo.
echo 1. Installing dependencies (including Electron and electron-builder)...
call npm install
call npm install --save-dev electron electron-builder

echo.
echo 2. Building React Production Bundle...
call npm run build

echo.
echo 3. Packaging into Windows Installer (.exe)...
call npx electron-builder --win nsis

echo.
echo ========================================================
echo   SUCCESS! Tayyor .EXE fayl "release/" papkasida:
echo   release/Trading Fund ERP Setup 1.0.0.exe
echo ========================================================
pause
