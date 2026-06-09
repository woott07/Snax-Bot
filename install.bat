@echo off
title Snax Setup - by woott007

echo Installing dependencies...
call npm install

if not exist .env (
    echo Bot_Token=YOUR_TOKEN_HERE > .env
    echo [INFO] Created .env file. Please open it and add your token!
)

if not exist .gitignore (
    echo node_modules/ > .gitignore
    echo .env >> .gitignore
    echo [INFO] Created .gitignore file.
)

echo.
echo Setup Complete! You can now start the bot using: node index.js
pause
