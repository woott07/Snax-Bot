const { Player } = require('discord-player');
const { DefaultExtractors } = require('@discord-player/extractor');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const config = require('../config/config');

module.exports = (client) => {
    // Initialize the Player
    const player = new Player(client, {
        ytdlOptions: {
            quality: 'highestaudio',
            highWaterMark: 1 << 25
        }
    });

    // Load Extractors
    async function loadExtractors() {
        try {
            await player.extractors.loadMulti(DefaultExtractors);
            logger.success('Music Extractors loaded successfully!');
        } catch (e) {
            logger.error(`Music Extractors failed: ${e}`);
        }
    }
    loadExtractors();

    // Load Music Commands directly into client.commands
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
                logger.warn(`The music command at ${filePath} is missing a required "name" or "execute" property.`);
            }
        }
        logger.success(`Loaded ${count} music commands successfully!`);
    } else {
        logger.warn('Music commands directory not found.');
    }

    // Load Player Events
    const eventsPath = path.join(__dirname, 'events');
    if (fs.existsSync(eventsPath)) {
        const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
        let count = 0;
        for (const file of eventFiles) {
            const filePath = path.join(eventsPath, file);
            const event = require(filePath);
            player.events.on(event.name, (...args) => event.execute(...args, client, player, config));
            count++;
        }
        logger.success(`Registered ${count} music player events successfully!`);
    } else {
        logger.warn('Player events directory not found.');
    }

    return player;
};
