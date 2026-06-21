const { Events } = require('discord.js');
const { getOrCreateLogChannel, sendGuildLog } = require('../utils/serverLogger');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`🤖 Success! Logged in as ${client.user.tag}`);

        // Fetch application info so client.application.owner is populated for dynamic owner permissions
        try {
            await client.application.fetch();
            console.log(`👑 Successfully fetched application owner: ${client.application.owner?.name || client.application.owner?.tag || 'Team'}`);
        } catch (error) {
            console.error('Failed to fetch bot application owner:', error);
        }
        
        // Initialize log channels for all currently joined guilds
        for (const [id, guild] of client.guilds.cache) {
            await getOrCreateLogChannel(guild);
            await sendGuildLog(guild, `✅ **${client.user.username}** has successfully started and is online!`);
        }
    }
};
