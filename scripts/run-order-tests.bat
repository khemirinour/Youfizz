@echo off
REM Order Confirmation Workflow Test Runner for Windows
REM This script helps run the order confirmation workflow tests

echo 🚀 Starting Order Confirmation Workflow Tests
echo ==============================================

REM Check if services are running
echo 🔍 Checking service health...

curl -s http://localhost:3001/auth/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Auth service is running
) else (
    echo ❌ Auth service is not responding
    echo Please start the required services first:
    echo   nx serve auth
    echo   nx serve article
    echo   nx serve cmd
    exit /b 1
)

curl -s http://localhost:3002/articles/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Article service is running
) else (
    echo ❌ Article service is not responding
    echo Please start the required services first:
    echo   nx serve auth
    echo   nx serve article
    echo   nx serve cmd
    exit /b 1
)

curl -s http://localhost:3003/orders/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ CMD service is running
) else (
    echo ❌ CMD service is not responding
    echo Please start the required services first:
    echo   nx serve auth
    echo   nx serve article
    echo   nx serve cmd
    exit /b 1
)

echo.
echo 🧪 Running order confirmation workflow tests...
echo.

REM Run the tests
nx e2e cmd-e2e --testPathPattern=simple-order-workflow --verbose

echo.
echo ✅ Test execution completed!
pause

