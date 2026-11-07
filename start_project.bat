@echo off
title Priority Inversion & Priority Inheritance Simulator
color 0B

echo.
echo =====================================================
echo   PRIORITY INVERSION ^& PRIORITY INHERITANCE
echo   Real-Time OS Scheduling Simulator
echo =====================================================
echo.

:: Check if priority_sim.exe exists, compile if not
if exist "priority_sim.exe" (
    echo [OK] priority_sim.exe already compiled.
) else (
    echo [..] Compiling main.cpp...
    set "GPP=C:\Program Files (x86)\Dev-Cpp\MinGW64\bin\g++.exe"
    if exist "%GPP%" (
        "%GPP%" -o priority_sim.exe main.cpp -std=c++11 -static
        if exist "priority_sim.exe" (
            echo [OK] Compilation successful!
        ) else (
            echo [ERROR] Compilation failed! Make sure main.cpp is present.
            echo         Compiler used: %GPP%
            pause
            exit /b 1
        )
    ) else (
        echo [ERROR] g++ not found at: %GPP%
        echo         Please install Dev-C++ or MinGW and update the path.
        pause
        exit /b 1
    )
)

:: Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed!
    echo         Download from: https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js found.

:: Install backend dependencies if needed
if not exist "backend\node_modules" (
    echo [..] Installing backend dependencies...
    cd backend
    npm install
    cd ..
)

:: Install frontend dependencies if needed
if not exist "frontend\node_modules" (
    echo [..] Installing frontend dependencies...
    cd frontend
    npm install
    cd ..
)

echo.
echo [..] Starting backend server on port 3001...
start "Backend Server" cmd /k "cd backend && node server.js"

echo [..] Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo [..] Starting frontend on port 5173...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo =====================================================
echo   SERVERS STARTING...
echo =====================================================
echo.
echo   Backend  : http://localhost:3001
echo   Frontend : http://localhost:5173
echo.
echo   Open your browser at: http://localhost:5173
echo.
echo   To STOP: Close the two server windows
echo   (titled "Backend Server" and "Frontend Server")
echo =====================================================
echo.

timeout /t 4 /nobreak >nul
start http://localhost:5173

pause
