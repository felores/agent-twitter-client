@echo off
IF "%~1"=="" (
    echo Usage:
    echo   .\thread "tweet_id"
    echo.
    echo Example:
    echo   .\thread "1865062457418371080"
) ELSE (
    npx ts-node .\src\examples\get-thread.ts %*
) 