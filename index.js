const { Client, GatewayIntentBits, Collection } = require('discord.js');
const config = require('./config/config');
const logger = require('./utils/logger');
const commandHandler = require('./handlers/commandHandler');
const eventHandler = require('./handlers/eventHandler');

// ─── Global Crash Protection ──────────────────────────────────────────────────
process.on('uncaughtException', (error) => {
    logger.error(`[UNCAUGHT EXCEPTION] ${error.stack || error}`);
});
process.on('unhandledRejection', (reason) => {
    logger.error(`[UNHANDLED REJECTION] ${reason.stack || reason}`);
});

// ─── Shutdown Handlers ────────────────────────────────────────────────────────
const { logGlobal } = require('./utils/globalLogger');

process.on('SIGINT', async () => {
    logger.warn('Received SIGINT. Logging offline status...');
    if (client && client.isReady()) {
        try {
            await logGlobal(client, `🛑 **${client.user.tag}** is now **offline** (Received shutdown signal SIGINT).`);
        } catch (e) {
            console.error('Failed to log global shutdown:', e);
        }
    }
    process.exit(0);
});

process.on('SIGTERM', async () => {
    logger.warn('Received SIGTERM. Logging offline status...');
    if (client && client.isReady()) {
        try {
            await logGlobal(client, `🛑 **${client.user.tag}** is now **offline** (Received shutdown signal SIGTERM).`);
        } catch (e) {
            console.error('Failed to log global shutdown:', e);
        }
    }
    process.exit(0);
});

// Initialize Client with necessary Intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
    ]
});

// Create command Map to hold all text commands
client.commands = new Collection();

// Load Lavalink Music System
const player = require('./lavalink_music/player')(client);

// Load Handlers
commandHandler(client);
eventHandler(client, player);

// Log in the bot using token
client.login(config.token);