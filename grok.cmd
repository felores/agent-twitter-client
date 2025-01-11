@echo off
IF "%~1"=="" (
    echo Usage:
    echo   .\grok "your question here"
    echo   .\grok -f "your follow-up question"
    echo.
    echo Examples:
    echo   .\grok "What is quantum entanglement?"
    echo   .\grok -f "How is it used in quantum computing?"
) ELSE (
    npx ts-node .\src\examples\grok-chat.ts %*
) 