@echo off
chcp 65001 >nul
title Trading Fund ERP Desktop
cls
echo ======================================================================
echo           TRADING FUND ERP - WINDOWS DESKTOP LAUNCHER
echo ======================================================================
echo.
echo Dastur ishga tushirilmoqda...
echo Hech qanday qo'shimcha o'rnatish (Node.js/Python) talab qilinmaydi!
echo.

cd /d "%~dp0"
if exist "dist" cd dist

set BROWSER_CMD=
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    set BROWSER_CMD="%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --app=http://127.0.0.1:49200 --window-size=1440,900
) else if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    set BROWSER_CMD="%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" --app=http://127.0.0.1:49200 --window-size=1440,900
) else if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    set BROWSER_CMD="%ProgramFiles%\Google\Chrome\Application\chrome.exe" --app=http://127.0.0.1:49200 --window-size=1440,900
) else if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    set BROWSER_CMD="%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" --app=http://127.0.0.1:49200 --window-size=1440,900
) else (
    set BROWSER_CMD=start http://127.0.0.1:49200
)

start /b cmd /c "timeout /t 1 >nul && %BROWSER_CMD%"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
"$listener = New-Object System.Net.HttpListener; ^
$listener.Prefixes.Add('http://127.0.0.1:49200/'); ^
try { $listener.Start() } catch { Write-Host 'Port band yoki xatolik: ' $_.Exception.Message; exit }; ^
Write-Host 'Dastur ochildi! Ushbu qora oynani yopmang (dastur yopilib qoladi).' -ForegroundColor Green; ^
while ($listener.IsListening) { ^
    $ctx = $listener.GetContext(); ^
    $req = $ctx.Request; ^
    $res = $ctx.Response; ^
    $urlPath = $req.Url.LocalPath.TrimStart('/'); ^
    if ([string]::IsNullOrWhiteSpace($urlPath)) { $urlPath = 'index.html' }; ^
    $filePath = Join-Path (Get-Location) $urlPath; ^
    if (Test-Path -Path $filePath -PathType Leaf) { ^
        $ext = [System.IO.Path]::GetExtension($filePath).ToLower(); ^
        switch ($ext) { ^
            '.html' { $res.ContentType = 'text/html; charset=utf-8' } ^
            '.js'   { $res.ContentType = 'application/javascript; charset=utf-8' } ^
            '.css'  { $res.ContentType = 'text/css; charset=utf-8' } ^
            '.json' { $res.ContentType = 'application/json; charset=utf-8' } ^
            '.svg'  { $res.ContentType = 'image/svg+xml' } ^
            '.png'  { $res.ContentType = 'image/png' } ^
            '.ico'  { $res.ContentType = 'image/x-icon' } ^
            Default { $res.ContentType = 'application/octet-stream' } ^
        }; ^
        $bytes = [System.IO.File]::ReadAllBytes($filePath); ^
        $res.ContentLength64 = $bytes.Length; ^
        $res.OutputStream.Write($bytes, 0, $bytes.Length); ^
    } else { ^
        $res.StatusCode = 404; ^
    }; ^
    $res.Close(); ^
}"
