const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const config = require('../config/config');

module.exports = (client, player) => {
    // 1. Client Events
    const eventsPath = path.join(__dirname, '../events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    let clientEventsCount = 0;

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client, player, config));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client, player, config));
        }
        clientEventsCount++;
    }
    logger.success(`Registered ${clientEventsCount} client events successfully!`);

    // 2. Player Events
    const playerEventsPath = path.join(__dirname, '../playerEvents');
    const playerEventFiles = fs.readdirSync(playerEventsPath).filter(file => file.endsWith('.js'));
    let playerEventsCount = 0;

    for (const file of playerEventFiles) {
        const filePath = path.join(playerEventsPath, file);
        const event = require(filePath);
        player.events.on(event.name, (...args) => event.execute(...args, client, player, config));
        playerEventsCount++;
    }
    logger.success(`Registered ${playerEventsCount} player events successfully!`);
};
