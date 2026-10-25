@echo off
title Muslima Portfolio
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js topilmadi. Avval Node.js LTS versiyasini o'rnating.
  echo https://nodejs.org/ manzilidan yuklab olish mumkin.
  pause
  exit /b 1
)

if not exist package.json (
  echo Loyiha papkasi topilmadi. ZIP faylni Extract All orqali to'liq oching.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Kerakli paketlar o'rnatilmoqda...
  call npm install
  if errorlevel 1 (
    echo Paketlarni o'rnatishda xatolik yuz berdi.
    pause
    exit /b 1
  )
)

echo.
echo Portfolio: http://localhost:5173
echo Admin panel: http://localhost:5173/admin
echo Admin nomi: admin
echo Admin paroli terminalda birinchi ishga tushganda ko'rsatiladi.
echo Serverni to'xtatish uchun Ctrl+C bosing.
echo.
call npm run dev
pause
