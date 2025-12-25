@echo off
TITLE MedAI Backend Server
SETLOCAL

:: Set the current directory
cd /d %~dp0

:: Check for virtual environment
IF EXIST "myenv\Scripts\activate.bat" (
    echo [INFO] Activating virtual environment 'myenv'...
    call myenv\Scripts\activate
) ELSE (
    echo [WARNING] Virtual environment 'myenv' not found. Ensure it exists in the root directory.
    echo [INFO] Attempting to run with system python...
)

:: Run the application
echo [INFO] Starting MedAI Backend (FastAPI)...
echo [INFO] Access the API at http://0.0.0.0:8000
python run.py

IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Backend failed to start.
    pause
)

ENDLOCAL
