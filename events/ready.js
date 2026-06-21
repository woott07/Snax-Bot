const { Events } = require('discord.js');
const { getOrCreateLogChannel, sendGuildLog } = require('../utils/serverLogger');
const { logGlobal, getOrCreateHomeChannel } = require('../utils/globalLogger');
const logger = require('../utils/logger');

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

        // Initialize in-server log channels for all currently joined guilds
        for (const [id, guild] of client.guilds.cache) {
            await getOrCreateLogChannel(guild);
            await sendGuildLog(guild, `✅ **${client.user.username}** has successfully started and is online!`);
        }

        // Ensure #global-log exists in home server
        await getOrCreateHomeChannel(client, 'global-log');

        // Log bot startup to home server's #global-log
        const serverCount = client.guilds.cache.size;
        const serverList = client.guilds.cache.map(g => `• **${g.name}** (\`${g.id}\`)`).join('\n').substring(0, 1800);

        await logGlobal(client,
            `✅ **${client.user.tag}** is now **online!**\n` +
            `📊 Active in **${serverCount}** server(s):\n${serverList || '*(none)*'}`
        );

        logger.success(`[Ready] Bot started. Serving ${serverCount} guild(s).`);
    }
};
