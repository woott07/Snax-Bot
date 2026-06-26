const { Client, GatewayIntentBits, Collection } = require('discord.js');
const config = require('./config/config');
const logger = require('./utils/logger');
const eventHandler = require('./handlers/eventHandler');

const { logGlobal } = require('./utils/globalLogger');

let client;

// ─── Global Crash Protection ──────────────────────────────────────────────────
process.on('uncaughtException', async (error) => {
    logger.error(`[UNCAUGHT EXCEPTION] ${error.stack || error}`);
    if (client && client.isReady()) {
        try {
            await logGlobal(client, `🚨 **[UNCAUGHT EXCEPTION]**\n\`\`\`js\n${(error.stack || error).substring(0, 1800)}\n\`\`\``);
        } catch (e) {
            console.error('Failed to log uncaught exception globally:', e);
        }
    }
});
process.on('unhandledRejection', async (reason) => {
    logger.error(`[UNHANDLED REJECTION] ${reason.stack || reason}`);
    if (client && client.isReady()) {
        try {
            await logGlobal(client, `🚨 **[UNHANDLED REJECTION]**\n\`\`\`js\n${(reason.stack || reason || '').substring(0, 1800)}\n\`\`\``);
        } catch (e) {
            console.error('Failed to log unhandled rejection globally:', e);
        }
    }
});

// ─── Shutdown Handlers ────────────────────────────────────────────────────────

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
client = new Client({
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
eventHandler(client, player);

// Log in the bot using token
client.login(config.token);