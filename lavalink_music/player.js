const { Kazagumo } = require('kazagumo');
const { Connectors } = require('shoukaku');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const config = require('../config/config');

module.exports = (client) => {
    // Define Lavalink nodes from configuration
    const Nodes = [{
        name: 'HeavenCloud-Node',
        url: `${config.lavalink.host}:${config.lavalink.port}`,
        auth: config.lavalink.password,
        secure: config.lavalink.secure
    }];

    // Initialize Kazagumo with Shoukaku connector
    const kazagumo = new Kazagumo({
        defaultSearchEngine: "youtube",
        send: (guildId, payload) => {
            const guild = client.guilds.cache.get(guildId);
            if (guild) guild.shard.send(payload);
        }
    }, new Connectors.DiscordJS(client), Nodes);

    // Register Shoukaku (Lavalink Connection) Events
    kazagumo.shoukaku.on('ready', (name) => {
        logger.success(`Lavalink Node "${name}" connected successfully!`);
    });

    kazagumo.shoukaku.on('error', (name, error) => {
        logger.error(`Lavalink Node "${name}" encountered an error: ${error.message || error}`);
    });

    kazagumo.shoukaku.on('close', (name, code, reason) => {
        logger.warn(`Lavalink Node "${name}" closed connection. Code: ${code}, Reason: ${reason}`);
    });

    kazagumo.shoukaku.on('disconnect', (name, players, moved) => {
        logger.warn(`Lavalink Node "${name}" disconnected. Active players: ${players.length}, Moved: ${moved}`);
    });

    // Load Lavalink Music Commands into client.commands
    const commandsPath = path.join(__dirname, 'commands');
    if (fs.existsSync(commandsPath)) {
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        let count = 0;
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            if (command.name && typeof command.execute === 'function') {
                client.commands.set(command.name, command);
                count++;
            } else {
                logger.warn(`The Lavalink command at ${filePath} is missing a required "name" or "execute" property.`);
            }
        }
        logger.success(`Loaded ${count} Lavalink music commands successfully!`);
    } else {
        logger.warn('Lavalink commands directory not found.');
    }

    // Load Kazagumo Player Events
    const eventsPath = path.join(__dirname, 'events');
    if (fs.existsSync(eventsPath)) {
        const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
        let count = 0;
        for (const file of eventFiles) {
            const filePath = path.join(eventsPath, file);
            const event = require(filePath);
            kazagumo.on(event.name, (...args) => event.execute(...args, client, kazagumo, config));
            count++;
        }
        logger.success(`Registered ${count} Kazagumo player events successfully!`);
    } else {
        logger.warn('Kazagumo events directory not found.');
    }

    // Attach kazagumo instance to client for global access
    client.kazagumo = kazagumo;

    return kazagumo;
};
