@echo off
SET SCRIPT_DIR=%~dp0
IF "%~1"=="" (
    echo Usage:
    echo   thread "tweet_id"
    echo.
    echo Example:
    echo   thread "1865062457418371080"
) ELSE (
    npx ts-node "%SCRIPT_DIR%src/examples/get-thread.ts" %*
) 