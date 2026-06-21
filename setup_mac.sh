#!/bin/bash

echo "Installing dependencies..."
npm install

if [ ! -f .env ]; then
    echo "Bot_Token=YOUR_TOKEN_HERE" > .env
    echo "OWNER_ID=Default Owner Id" > .env
    echo "LAVALINK_HOST=LAVALINK_HOST" >> .env
    echo "LAVALINK_PORT=LAVALINK_PORT" >> .env
    echo "LAVALINK_PASSWORD=LAVALINK_PASSWORD" >> .env
    echo "LAVALINK_SECURE=true" >> .env
    echo "[INFO] Created .env file. Please open it and add your token!"
fi

if [ ! -f .gitignore ]; then
    echo "node_modules/" > .gitignore
    echo ".env" >> .gitignore
    echo "[INFO] Created .gitignore file."
fi

echo ""
echo "Setup Complete! You can now start the bot using: node index.js"
