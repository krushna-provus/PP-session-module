@echo off
REM Planning Poker - Development Setup and Run Script for Windows
REM This script helps set up and run the Planning Poker application

echo.
echo 🎴 Planning Poker - Setup ^& Run
echo ================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✓ Node.js found: 
node --version
echo.
echo ✓ npm found: 
npm --version
echo.

REM Default to 'dev' if no argument provided
if "%1"=="" (
    call :show_menu
    exit /b 0
)

if /i "%1"=="install" (
    call :install_deps
) else if /i "%1"=="dev" (
    call :run_app
) else if /i "%1"=="help" (
    call :show_help
) else (
    echo ❌ Unknown command: %1
    echo Use 'setup.bat help' for available commands
    exit /b 1
)
exit /b 0

:show_menu
echo Available commands:
echo   setup.bat install    - Install all dependencies
echo   setup.bat dev        - Show instructions to run the app
echo   setup.bat help       - Show this message
echo.
exit /b 0

:install_deps
echo Installing dependencies...
echo.

echo 📦 Installing server dependencies...
cd server
call npm install
if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to install server dependencies
    pause
    exit /b 1
)
echo ✓ Server dependencies installed
cd ..

echo.
echo 📦 Installing client dependencies...
cd client
call npm install
if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to install client dependencies
    pause
    exit /b 1
)
echo ✓ Client dependencies installed
cd ..

echo.
echo ✓ All dependencies installed!
echo.
exit /b 0

:run_app
echo Starting Planning Poker...
echo.
echo ⚠️  You need to run these commands in separate terminal windows:
echo.
echo Terminal 1 (Server):
echo   cd server
echo   npm run dev
echo.
echo Terminal 2 (Client):
echo   cd client
echo   npm run dev
echo.
echo Then open your browser to: http://localhost:3000
echo.
exit /b 0

:show_help
echo Planning Poker - Setup Script for Windows
echo.
echo Commands:
echo   install              Install all dependencies
echo   dev                  Show how to run the development servers
echo   help                 Show this help message
echo.
exit /b 0
