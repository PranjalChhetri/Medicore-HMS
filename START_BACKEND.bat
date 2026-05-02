@echo off
title MediCore HMS — Backend Server
color 0A

echo.
echo  ███╗   ███╗███████╗██████╗ ██╗ ██████╗ ██████╗ ██████╗ ███████╗
echo  ████╗ ████║██╔════╝██╔══██╗██║██╔════╝██╔═══██╗██╔══██╗██╔════╝
echo  ██╔████╔██║█████╗  ██║  ██║██║██║     ██║   ██║██████╔╝█████╗
echo  ██║╚██╔╝██║██╔══╝  ██║  ██║██║██║     ██║   ██║██╔══██╗██╔══╝
echo  ██║ ╚═╝ ██║███████╗██████╔╝██║╚██████╗╚██████╔╝██║  ██║███████╗
echo  ╚═╝     ╚═╝╚══════╝╚═════╝ ╚═╝ ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝
echo                    Hospital Management System
echo.

cd /d "%~dp0backend"

echo [1/4] Installing required packages...
pip install django django-cors-headers --quiet
echo       Done.

echo [2/4] Running database migrations...
python manage.py migrate --run-syncdb
echo       Done.

echo [3/4] Seeding database with sample data + ML risk scores...
python manage.py seed_db
echo       Done.

echo [4/4] Starting Django server...
echo.
echo  ════════════════════════════════════════════════════════
echo   Backend API  :  http://127.0.0.1:8000/api/
echo   Admin Panel  :  http://127.0.0.1:8000/admin/
echo  ════════════════════════════════════════════════════════
echo.
echo   Now open index.html with Live Server (VS Code port 5501)
echo   OR just double-click index.html to open in browser.
echo.
echo   Press Ctrl+C to stop the server.
echo  ════════════════════════════════════════════════════════
echo.

python manage.py runserver 8000
pause
