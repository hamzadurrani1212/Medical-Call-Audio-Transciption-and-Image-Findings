@echo off
TITLE MedAI Backend Setup
SETLOCAL

cd /d %~dp0

:: Check for virtual environment
IF NOT EXIST "myenv\Scripts\activate.bat" (
    echo [INFO] Creating virtual environment 'myenv'...
    python -m venv myenv
) ELSE (
    echo [INFO] Virtual environment 'myenv' already exists.
)

:: Activate and install requirements
echo [INFO] Activating virtual environment...
call myenv\Scripts\activate

echo [INFO] Installing/Updating dependencies from requirements.txt...
python -m pip install --upgrade pip
pip install -r requirements.txt

IF %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Backend setup complete!
    echo [INFO] You can now use run_backend.bat to start the server.
) ELSE (
    echo [ERROR] Setup failed. Check the error messages above.
)

pause
ENDLOCAL
