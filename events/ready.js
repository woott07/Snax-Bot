const { Events } = require('discord.js');
const { getOrCreateLogChannel, sendGuildLog } = require('../utils/serverLogger');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`🤖 Success! Logged in as ${client.user.tag}`);
        
        // Initialize log channels for all currently joined guilds
        for (const [id, guild] of client.guilds.cache) {
            await getOrCreateLogChannel(guild);
            await sendGuildLog(guild, `✅ **${client.user.username}** has successfully started and is online!`);
        }
    }
};
