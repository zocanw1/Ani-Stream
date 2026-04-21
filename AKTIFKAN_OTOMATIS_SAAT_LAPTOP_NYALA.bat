@echo off
set "targetDir=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "scriptPath=%~dp0JALANKAN_WEB_SILENT.vbs"

echo Menyiapkan agar AniStream menyala otomatis saat Windows start...
echo.

powershell -Command "$s=(New-Object -COM WScript.Shell).CreateShortcut('%targetDir%\AniStreamAutoStart.lnk');$s.TargetPath='%scriptPath%';$s.Save()"

echo Selesai! 
echo Sekarang setiap kali Anda menghidupkan laptop, server akan otomatis jalan di latar belakang.
echo Anda tinggal klik ikon AniStream di Desktop kapan saja dan langsung nonton!
pause
