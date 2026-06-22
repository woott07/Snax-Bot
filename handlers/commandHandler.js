const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

module.exports = (client) => {
    const commandsPath = path.join(__dirname, '../commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    let count = 0;
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if (command.name && typeof command.execute === 'function') {
            client.commands.set(command.name.toLowerCase(), command);
            count++;
        } else {
            logger.warn(`The command at ${filePath} is missing a required "name" or "execute" property.`);
        }
    }
    logger.success(`Loaded ${count} commands successfully!`);
};
