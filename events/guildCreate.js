const { Events } = require('discord.js');
const { getOrCreateLogChannel, sendGuildLog } = require('../utils/serverLogger');

module.exports = {
    name: Events.GuildCreate,
    async execute(guild, client, player, config) {
        // Initialize the log channel when the bot joins a new server
        await getOrCreateLogChannel(guild);
        await sendGuildLog(guild, `👋 Hello! Thanks for adding **${client.user.username}** to your server. I've created this private channel to log important bot activities and errors.`);
    }
};
