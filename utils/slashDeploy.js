const { REST, Routes } = require('discord.js');
const slashOptionsMap = require('../config/slashOptionsMap');
const logger = require('./logger');

async function deploySlashCommands(client) {
    try {
        const slashCommandsBody = [];
        
        for (const [name, command] of client.commands) {
            // Only deploy music commands
            if (!command.isMusic) continue;

            const slashCmd = {
                name: command.name.toLowerCase(),
                description: command.description || 'No description provided.',
            };
            
            // Attach options from slashOptionsMap if mapped
            const cmdConfig = slashOptionsMap[command.name.toLowerCase()];
            if (cmdConfig && cmdConfig.options) {
                slashCmd.options = cmdConfig.options;
            }
            
            slashCommandsBody.push(slashCmd);
        }
        
        logger.info(`Deploying ${slashCommandsBody.length} music slash commands...`);
        
        const rest = new REST({ version: '10' }).setToken(client.token);
        
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: slashCommandsBody }
        );
        
        logger.success(`Successfully registered ${slashCommandsBody.length} music application (/) commands globally!`);
    } catch (error) {
        logger.error('Failed to register music application (/) commands:', error);
    }
}

module.exports = { deploySlashCommands };
