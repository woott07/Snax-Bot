const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { Player } = require('discord-player');
const { DefaultExtractors } = require('@discord-player/extractor');
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

// Initialize the Player and load extraction methods
const player = new Player(client);
player.extractors.loadMulti(DefaultExtractors).then(() => {
    logger.success('Extractors loaded successfully!');
}).catch(e => logger.error(`Extractors failed: ${e}`));

// Load Handlers
commandHandler(client);
eventHandler(client, player);

// Log in the bot using token
client.login(config.token);